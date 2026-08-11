import { AudioPlayer, type AudioTrack } from "@/components/audio/AudioPlayer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const metadata = {
  title: "Audio Library & Reflections — Duas, Ziyarat, Nohay & Imam Ali (AS) Wisdom",
  description: "Listen to Ziyarat-e-Ashura, Dua-e-Kumail, Nade Ali, Nohay, and narrated reflections from Imam Ali (AS).",
};

const defaultTracks: AudioTrack[] = [
  {
    id: "ziyarat-ashura",
    title: "Ziyarat-e-Ashura",
    subtitle: "Sacred Salutation & Recitation for Imam Husayn (AS)",
    category: "Duas & Ziyarat",
    reciter: "Traditional Recitation",
    duration: "14:20",
    cover_image: "/backgrounds/architectural-1.jpg",
  },
  {
    id: "nade-ali",
    title: "Nade Ali (نَادِ عَلِيّاً)",
    subtitle: "Call upon Ali (AS), the manifestation of wonders",
    category: "Duas & Ziyarat",
    reciter: "Classic Recitation",
    duration: "3:15",
    cover_image: "/backgrounds/reflection-1.png",
  },
  {
    id: "dua-kumail",
    title: "Dua-e-Kumail (دُعَاء كُمَيْل)",
    subtitle: "Supplication of repentance taught by Imam Ali (AS) to Kumail ibn Ziyad",
    category: "Duas & Ziyarat",
    reciter: "Soulful Recitation",
    duration: "28:40",
    cover_image: "/backgrounds/abstract-1.png",
  },
  {
    id: "nohay-1",
    title: "Noha: Salam Ya Husayn (AS)",
    subtitle: "Eulogy & Remembrance of Karbala",
    category: "Nohay",
    reciter: "Nohay Collection",
    duration: "6:50",
    cover_image: "/backgrounds/cinematic-1.jpg",
  },
  {
    id: "t1",
    title: "Your Days Are Numbered",
    subtitle: "Nahjul Balagha, Sermon 42 — narrated reflection on time and youth",
    category: "Audio Reflections",
    reciter: "Wisdom Narration",
    duration: "3:42",
    cover_image: "/hero-bg.jpg",
  },
  {
    id: "t2",
    title: "Before You Sleep Tonight",
    subtitle: "A calm reminder for the end of your day — gratitude, review, intention",
    category: "Audio Reflections",
    reciter: "Night Reminder",
    duration: "5:18",
  },
  {
    id: "t3",
    title: "Focus Session: 25-Minute Flow",
    subtitle: "Ambient silence with a gentle Imam Ali (AS) quote at the start and end",
    category: "Focus",
    reciter: "Ambient Flow",
    duration: "25:00",
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
      // Merge DB tracks with default curated tracks, deduplicating by ID or identical title+src
      tracks = [...dbTracks, ...defaultTracks.filter((dt) => !dbTracks.some((dbt) => dbt.id === dt.id || (dbt.title === dt.title && dbt.src === dt.src)))];
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

      <AudioPlayer tracks={tracks} />
    </section>
  );
}

