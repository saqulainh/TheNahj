import { AudioPlayer, type AudioTrack } from "@/components/audio/AudioPlayer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const metadata = {
  title: "Audio Reflections",
  description: "Wisdom narration, night reminders, and calm focus sessions — listen when reading feels like too much.",
};

const defaultTracks: AudioTrack[] = [
  {
    id: "t1",
    title: "Your Days Are Numbered",
    subtitle: "Nahjul Balagha, Sermon 42 — narrated reflection on time and youth",
    category: "Wisdom",
    duration: "3:42",
  },
  {
    id: "t2",
    title: "Before You Sleep Tonight",
    subtitle: "A calm reminder for the end of your day — gratitude, review, intention",
    category: "Night",
    duration: "5:18",
  },
  {
    id: "t3",
    title: "Focus Session: 25-Minute Flow",
    subtitle: "Ambient silence with a gentle Imam Ali (AS) quote at the start and end",
    category: "Focus",
    duration: "25:00",
  },
  {
    id: "t4",
    title: "The Strong One Controls Himself",
    subtitle: "Reflection on anger, impulse, and emotional discipline",
    category: "Wisdom",
    duration: "4:11",
  },
];

export default async function AudioPage() {
  let tracks = defaultTracks;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("audio_tracks")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      tracks = data.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle || undefined,
        category: t.category,
        duration: t.duration || "0:00",
        audio_url: t.audio_url || undefined,
      }));
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Audio Library</p>
        <h1 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">
          Audio Reflections
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Listen when reading feels like too much. Wisdom narration, night reminders,
          student calm sessions, and focus flows — all rooted in the words of Imam Ali (AS).
        </p>
      </div>

      <AudioPlayer tracks={tracks} />

      <p className="mt-16 text-center text-xs text-muted">
        Audio content is being recorded and curated. Connect Supabase Storage to upload your own tracks via the Admin panel.
      </p>
    </section>
  );
}
