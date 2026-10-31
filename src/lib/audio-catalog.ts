import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AudioTrack } from "@/lib/stores/audioStore";

export const DEFAULT_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "dua-e-kumail",
    title: "Dua-e-Kumail",
    subtitle: "Supplication taught by Imam Ali (AS) to Kumail ibn Ziyad",
    category: "Duas & Ziyarat",
    reciter: "Abather Al-Halawaji",
    cover_image: "/backgrounds/reflection-1.png",
    duration: "28:15",
    src: "https://ia800301.us.archive.org/15/items/DuaKumayl_Abathar/DuaKumayl_Abathar.mp3",
  },
  {
    id: "ziyarat-ashura",
    title: "Ziyarat-e-Ashura",
    subtitle: "A sacred salutation to Imam Hussain (AS) and the martyrs of Karbala",
    category: "Duas & Ziyarat",
    reciter: "Ali Fani",
    cover_image: "/hero-bg.jpg",
    duration: "14:20",
    src: "https://ia800504.us.archive.org/11/items/ZiyaratAshura_AliFani/ZiyaratAshura_AliFani.mp3",
  },
  {
    id: "nade-ali",
    title: "Nade Ali (Call Upon Ali)",
    subtitle: "An invocation recalling divine support through Imam Ali (AS)",
    category: "Duas & Ziyarat",
    reciter: "Basim Karbalaei",
    cover_image: "/thenahj-logo.jpeg",
    duration: "04:45",
    src: "https://ia801905.us.archive.org/30/items/NadeAli_Basim/NadeAli_Basim.mp3",
  },
  {
    id: "munajat-kufa",
    title: "Munajat of Imam Ali (AS) in Kufa",
    subtitle: "The Whispered Prayer at the Grand Mosque of Kufa",
    category: "Audio Reflections",
    reciter: "Hussain Al-Akraf",
    cover_image: "/backgrounds/reflection-1.png",
    duration: "18:30",
    src: "https://ia800208.us.archive.org/20/items/MunajatMasjidKufa/MunajatMasjidKufa.mp3",
  },
];

export async function getAudioTracks(): Promise<AudioTrack[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("audio_tracks")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data?.length) {
        const tracks: AudioTrack[] = [];
        for (const track of data) {
          const src = track.audio_url || track.src;
          if (!src) continue;
          tracks.push({
            id: track.id,
            title: track.title,
            subtitle: track.subtitle || undefined,
            category: track.category || "Audio Reflections",
            reciter: track.reciter || undefined,
            cover_image: track.cover_image || track.thumbnail || undefined,
            duration: track.duration || "0:00",
            src,
          });
        }

        if (tracks.length) return tracks;
      }
    } catch (error) {
      console.error("Error loading audio tracks:", error);
    }
  }

  return DEFAULT_AUDIO_TRACKS;
}
