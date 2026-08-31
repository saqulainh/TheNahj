"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, Share2, X, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useAudioStore } from "@/lib/stores/audioStore";
import { toast } from "sonner";
import { ShareDrawer } from "@/components/ui/ShareDrawer";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  duration: string;
  reciter?: string;
  cover_image?: string;
  src?: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const { playTrack, currentTrack, isPlaying, play, pause } = useAudioStore();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [shareTrack, setShareTrack] = useState<AudioTrack | null>(null);
  const [sharingTrack, setSharingTrack] = useState<AudioTrack | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Deep Linking: Auto-play track from URL ──
  useEffect(() => {
    const idFromUrl = searchParams?.get("id");
    if (idFromUrl && tracks.length > 0) {
      const trackToPlay = tracks.find((t) => t.id === idFromUrl);
      if (trackToPlay && currentTrack?.id !== trackToPlay.id) {
        playTrack({
          id: trackToPlay.id,
          title: trackToPlay.title,
          subtitle: trackToPlay.subtitle,
          src: trackToPlay.src || "",
          reciter: trackToPlay.reciter,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tracks]);

  const categories = ["All", ...Array.from(new Set(tracks.map((t) => t.category).filter(Boolean)))];

  const filteredTracks = selectedCategory === "All"
    ? tracks
    : tracks.filter((t) => t.category?.toLowerCase() === selectedCategory.toLowerCase() || (selectedCategory === "Duas & Ziyarat" && (t.category === "Dua" || t.category === "Ziyarat")));

  const activeTracks = filteredTracks.length > 0 ? filteredTracks : tracks;

  const togglePlay = (trackToPlay: AudioTrack) => {
    if (currentTrack?.id === trackToPlay.id) {
      if (isPlaying) pause();
      else play();
    } else {
      playTrack({
        id: trackToPlay.id,
        title: trackToPlay.title,
        subtitle: trackToPlay.subtitle,
        src: trackToPlay.src || "",
        reciter: trackToPlay.reciter
      });
    }
  };

  // Directly open native share if supported, fallback to custom drawer
  const handleShare = async (t: AudioTrack) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: `🎵 ${t.title}${t.subtitle ? `\n📖 ${t.subtitle}` : ""}${t.reciter ? `\n🎤 ${t.reciter}` : ""}`,
          url: `https://thenahj.live/audio?id=${t.id}`,
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSharingTrack(t);
        }
      }
    } else {
      setSharingTrack(t);
    }
  };

  // ── Share Card Copy ──
  const handleCopyShareText = (t: AudioTrack) => {
    const text = `🕌 ${t.title}\n${t.subtitle ? `📖 ${t.subtitle}\n` : ""}${t.reciter ? `🎙️ ${t.reciter}\n` : ""}\n🔗 Listen on TheNahj: https://thenahj.live/audio`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
                selectedCategory === cat
                  ? "bg-gold text-black shadow-md font-semibold"
                  : "bg-surface/70 text-muted hover:bg-surface-elevated hover:text-foreground border border-border/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Track list */}
      <div className="space-y-2.5">
        {activeTracks.map((t) => {
          const isSelected = currentTrack?.id === t.id;
          return (
            <div key={t.id} className="flex items-stretch gap-0">
              <button
                type="button"
                onClick={() => togglePlay(t)}
                className={`group flex flex-1 items-center gap-4 rounded-l-2xl p-3.5 text-left transition-all ${
                  isSelected
                    ? "border border-r-0 border-gold/40 bg-gold/10 shadow-sm"
                    : "border border-r-0 border-border/20 bg-surface/50 hover:border-border/40 hover:bg-surface-elevated/80"
                }`}
              >
                {/* Cover Thumbnail Image */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-background/80 flex items-center justify-center">
                  {t.cover_image ? (
                    <Image
                      src={t.cover_image}
                      alt={t.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/20 via-surface to-background text-gold-light">
                      <Music size={20} />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                      {isPlaying ? (
                        <div className="flex items-center gap-[3px]">
                          <span className="inline-block h-3.5 w-[3px] animate-pulse rounded-full bg-gold" />
                          <span className="inline-block h-5 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
                          <span className="inline-block h-2.5 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
                        </div>
                      ) : (
                        <Play size={18} className="ml-0.5 text-gold fill-gold" />
                      )}
                    </div>
                  )}
                </div>

                {/* Title & Details */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${isSelected ? "text-gold-light" : "text-foreground"}`}>
                    {t.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted/80">
                    {t.reciter ? <span className="font-medium text-gold-muted/90">{t.reciter} — </span> : null}
                    {t.subtitle}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-light">
                    {t.category}
                  </span>
                  <span className="text-xs tabular-nums text-muted">{t.duration}</span>
                </div>
              </button>

              {/* Share button per track */}
              <button
                type="button"
                onClick={() => handleShare(t)}
                className={`flex items-center justify-center rounded-r-2xl px-3 transition-all ${
                  isSelected
                    ? "border border-l-0 border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                    : "border border-l-0 border-border/20 bg-surface/50 text-muted hover:text-gold hover:bg-surface-elevated/80"
                }`}
                aria-label={`Share ${t.title}`}
              >
                <Share2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {sharingTrack && (
        <ShareDrawer
          isOpen={!!sharingTrack}
          onClose={() => setSharingTrack(null)}
          shareData={{
            title: sharingTrack.title,
            text: `🎵 ${sharingTrack.title}${sharingTrack.subtitle ? `\n📖 ${sharingTrack.subtitle}` : ""}${sharingTrack.reciter ? `\n🎤 ${sharingTrack.reciter}` : ""}`,
            url: `https://thenahj.live/audio?id=${sharingTrack.id}`,
            audioSrc: sharingTrack.src,
            coverImage: sharingTrack.cover_image
          }}
        />
      )}

      {/* ── Share Dua Card Modal ── */}
      <AnimatePresence>
        {shareTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShareTrack(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm space-y-5"
            >
              {/* The Shareable Card */}
              <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1a1510] via-[#0f0d0a] to-[#1a1510] p-6 shadow-2xl">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C7A654' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                {/* Cover image */}
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border border-gold/20 shadow-lg mb-5">
                  {shareTrack.cover_image ? (
                    <Image src={shareTrack.cover_image} alt={shareTrack.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/30 to-gold/5">
                      <Music size={48} className="text-gold/60" />
                    </div>
                  )}
                </div>

                <div className="relative text-center space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/80">{shareTrack.category}</p>
                  <h3 className="text-xl font-bold text-white leading-tight">{shareTrack.title}</h3>
                  {shareTrack.subtitle && (
                    <p className="text-xs leading-relaxed text-white/60 max-w-[260px] mx-auto">{shareTrack.subtitle}</p>
                  )}
                  {shareTrack.reciter && (
                    <p className="text-[11px] font-medium text-gold/70 pt-1">🎙️ {shareTrack.reciter}</p>
                  )}
                  <div className="flex items-center justify-center gap-3 pt-3">
                    <span className="text-[10px] text-white/40 tracking-wider">{shareTrack.duration}</span>
                    <span className="h-1 w-1 rounded-full bg-gold/40" />
                    <span className="text-[10px] text-gold/60 font-semibold tracking-wider">thenahj.live/audio</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyShareText(shareTrack)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-xs font-bold text-black transition-all hover:bg-gold-light shadow-md"
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Share Text</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: shareTrack.title,
                        text: `🕌 ${shareTrack.title}\n${shareTrack.subtitle || ""}\n🔗 Listen on TheNahj`,
                        url: "https://thenahj.live/audio",
                      });
                    } else {
                      handleCopyShareText(shareTrack);
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-surface/80 px-4 py-3 text-xs font-bold text-gold transition-all hover:bg-gold/10"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  type="button"
                  onClick={() => setShareTrack(null)}
                  className="flex items-center justify-center rounded-xl border border-border/30 bg-surface/80 px-3 py-3 text-muted hover:text-foreground transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
