import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_AUDIO_TRACKS, getAudioTracks } from "@/lib/audio-catalog";

export const revalidate = 0; // Always fetch fresh data — no caching

export async function generateMetadata(
  props: { searchParams: Promise<{ id?: string }> }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const id = searchParams?.id;
  
  const defaultMeta = {
    title: "Audio Library & Reflections — Duas, Ziyarat, Nohay & Imam Ali (AS) Wisdom",
    description: "Listen to Ziyarat-e-Ashura, Dua-e-Kumail, Nade Ali, Nohay, and narrated reflections from Imam Ali (AS).",
  };

  if (!id) return defaultMeta;

  // Try DB first
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("audio_tracks")
      .select("title, subtitle, cover_image, reciter")
      .eq("id", id)
      .single();

    if (data) {
      const imageUrl = data.cover_image;
      return {
        title: `${data.title} ${data.reciter ? `— by ${data.reciter}` : ''} | TheNahj Audio`,
        description: data.subtitle || defaultMeta.description,
        openGraph: {
          title: data.title,
          description: data.subtitle || defaultMeta.description,
          images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: data.title }] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: data.title,
          description: data.subtitle || defaultMeta.description,
          images: imageUrl ? [imageUrl] : undefined,
        }
      };
    }
  }

  // Fallback to default tracks
  const defaultTrack = DEFAULT_AUDIO_TRACKS.find(t => t.id === id);
  if (defaultTrack) {
    return {
      title: `${defaultTrack.title} — ${defaultTrack.reciter} | TheNahj Audio`,
      description: defaultTrack.subtitle || defaultMeta.description,
      openGraph: {
        title: defaultTrack.title,
        description: defaultTrack.subtitle || defaultMeta.description,
        images: defaultTrack.cover_image ? [{ url: defaultTrack.cover_image, width: 800, height: 800, alt: defaultTrack.title }] : undefined,
      }
    };
  }

  return defaultMeta;
}

export default async function AudioPage() {
  const tracks = await getAudioTracks();

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-10 pb-32">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-muted">Sacred Sound & Contemplation</p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-foreground md:text-4xl">
          Duas, Ziyarat, Nohay & Reflections
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
          Immerse your soul in sacred supplications (Dua-e-Kumail, Nade Ali, Ziyarat-e-Ashura) and reflections from Imam Ali (AS) with Spotify-style fluid controls.
        </p>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-muted">Loading sacred tracks...</div>}>
        <AudioPlayer tracks={tracks} />
      </Suspense>

      <nav aria-label="Explore related content" className="mt-12 rounded-3xl border border-border/25 bg-surface/50 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold text-gold-light">Continue exploring sacred wisdom</h2>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2.5 text-xs sm:text-sm">
          <Link href="/wisdom" className="text-muted hover:text-gold transition-colors">Imam Ali Wisdom</Link>
          <Link href="/nahjul-balagha" className="text-muted hover:text-gold transition-colors">Nahjul Balagha Quotes</Link>
          <Link href="/daily" className="text-muted hover:text-gold transition-colors">Daily Contemplation</Link>
          <Link href="/situation-search" className="text-muted hover:text-gold transition-colors">AI Situation Guidance</Link>
          <Link href="/focus" className="text-muted hover:text-gold transition-colors">Deep Focus Timer</Link>
        </div>
      </nav>
    </section>
  );
}
