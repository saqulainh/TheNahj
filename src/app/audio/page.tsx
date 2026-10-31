import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Suspense } from "react";
import type { AudioTrack } from "@/lib/stores/audioStore";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 0; // Always fetch fresh data — no caching

const DEFAULT_TRACKS: AudioTrack[] = [
  {
    id: "dua-e-kumail",
    title: "Dua-e-Kumail",
    subtitle: "Supplication of Prophet Khidr taught by Imam Ali (AS) to Kumail ibn Ziyad for forgiveness, protection & tranquility",
    category: "Duas & Ziyarat",
    reciter: "Abather Al-Halawaji",
    cover_image: "/backgrounds/reflection-1.png",
    duration: "28:15",
    src: "https://ia800301.us.archive.org/15/items/DuaKumayl_Abathar/DuaKumayl_Abathar.mp3",
  },
  {
    id: "ziyarat-ashura",
    title: "Ziyarat-e-Ashura",
    subtitle: "Sacred salutation to Imam Hussain (AS) and the righteous martyrs of Karbala",
    category: "Duas & Ziyarat",
    reciter: "Ali Fani",
    cover_image: "/hero-bg.jpg",
    duration: "14:20",
    src: "https://ia800504.us.archive.org/11/items/ZiyaratAshura_AliFani/ZiyaratAshura_AliFani.mp3",
  },
  {
    id: "nade-ali",
    title: "Nade Ali (Call Upon Ali)",
    subtitle: "The historical invocation revealed during the Battle of Khaybar, invoking divine support through Imam Ali (AS)",
    category: "Duas & Ziyarat",
    reciter: "Basim Karbalaei",
    cover_image: "/thenahj-logo.jpeg",
    duration: "04:45",
    src: "https://ia801905.us.archive.org/30/items/NadeAli_Basim/NadeAli_Basim.mp3",
  },
  {
    id: "munajat-kufa",
    title: "Munajat of Imam Ali (AS) in Kufa",
    subtitle: "The Whispered Prayer at the Grand Mosque of Kufa: 'Antal Maula wa Anal Abd... Who else has mercy upon the servant except the Master?'",
    category: "Audio Reflections",
    reciter: "Hussain Al-Akraf",
    cover_image: "/backgrounds/reflection-1.png",
    duration: "18:30",
    src: "https://ia800208.us.archive.org/20/items/MunajatMasjidKufa/MunajatMasjidKufa.mp3",
  },
];

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
  const defaultTrack = DEFAULT_TRACKS.find(t => t.id === id);
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

  // Fallback to curated default tracks if database is empty or offline
  if (tracks.length === 0) {
    tracks = DEFAULT_TRACKS;
  }

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
