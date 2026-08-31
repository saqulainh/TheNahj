import { AudioPlayer, type AudioTrack } from "@/components/audio/AudioPlayer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Suspense } from "react";

export const revalidate = 0; // Always fetch fresh data — no caching

export const metadata = {
  title: "Audio Library & Reflections — Duas, Ziyarat, Nohay & Imam Ali (AS) Wisdom",
  description: "Listen to Ziyarat-e-Ashura, Dua-e-Kumail, Nade Ali, Nohay, and narrated reflections from Imam Ali (AS).",
};

export default async function AudioPage() {
  let tracks: AudioTrack[] = [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("audio_tracks")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const dbTracks: AudioTrack[] = data.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle || undefined,
        category: t.category || "Audio Reflections",
        reciter: t.reciter || undefined,
        cover_image: t.cover_image || t.thumbnail || undefined,
        duration: t.duration || "0:00",
        src: t.audio_url || t.src || undefined,
      }));
      tracks = dbTracks;
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-muted">Audio Library</p>
        <h1 className="mt-2 text-3xl font-medium text-foreground md:text-4xl">
          Duas, Ziyarat, Nohay & Audio Reflections
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Listen to sacred supplications (Dua-e-Kumail, Nade Ali, Ziyarat-e-Ashura), Nohay, and narrated reflections from Imam Ali (AS) whenever reading feels like too much.
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-border/20 bg-surface/40 p-12 text-center">
          <p className="text-muted text-sm">No audio tracks added yet. Add tracks from the Admin Panel → Audio Library.</p>
        </div>
      ) : (
        <Suspense fallback={<div className="p-12 text-center text-muted">Loading tracks...</div>}>
          <AudioPlayer tracks={tracks} />
        </Suspense>
      )}
    </section>
  );
}
