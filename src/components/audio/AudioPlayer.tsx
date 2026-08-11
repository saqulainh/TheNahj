"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, Music,
  Moon, Timer, Gauge, Share2, X, Copy, Check, Download,
} from "lucide-react";
import Image from "next/image";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  duration: string;
  reciter?: string;
  cover_image?: string;
  /** URL or path — falls back to placeholder if missing */
  src?: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

const SLEEP_PRESETS = [
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "60 min", seconds: 3600 },
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Advanced controls state
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [sleepTimerSec, setSleepTimerSec] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [shareTrack, setShareTrack] = useState<AudioTrack | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract unique categories for tabs
  const categories = ["All", ...Array.from(new Set(tracks.map((t) => t.category).filter(Boolean)))];

  // Filter tracks by active tab category
  const filteredTracks = selectedCategory === "All"
    ? tracks
    : tracks.filter((t) => t.category?.toLowerCase() === selectedCategory.toLowerCase() || (selectedCategory === "Duas & Ziyarat" && (t.category === "Dua" || t.category === "Ziyarat")));

  const activeTracks = filteredTracks.length > 0 ? filteredTracks : tracks;
  const safeCurrent = Math.min(current, activeTracks.length - 1);
  const track = activeTracks[safeCurrent] || tracks[0];

  const cleanup = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // ── Sleep Timer Logic ──
  useEffect(() => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    if (sleepTimerSec === null || sleepTimerSec <= 0) return;

    sleepIntervalRef.current = setInterval(() => {
      setSleepTimerSec((prev) => {
        if (prev === null || prev <= 1) {
          // Timer expired → pause playback
          if (audioRef.current) audioRef.current.pause();
          setPlaying(false);
          cleanup();
          if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    };
  }, [sleepTimerSec !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Playback Speed ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, track?.id]);

  const togglePlay = () => {
    if (!track?.src) {
      if (playing) {
        setPlaying(false);
        cleanup();
      } else {
        setPlaying(true);
        progressInterval.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              setPlaying(false);
              cleanup();
              return 0;
            }
            return p + 0.5;
          });
        }, 150);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.playbackRate = playbackSpeed;
      audio.play();
    }
    setPlaying(!playing);
  };

  const nextTrack = () => {
    cleanup();
    setPlaying(false);
    setProgress(0);
    setCurrent((c) => (c + 1) % activeTracks.length);
  };

  const prevTrack = () => {
    cleanup();
    setPlaying(false);
    setProgress(0);
    setCurrent((c) => (c - 1 + activeTracks.length) % activeTracks.length);
  };

  const startSleepTimer = (seconds: number) => {
    setSleepTimerSec(seconds);
    setShowSleepMenu(false);
  };

  const cancelSleepTimer = () => {
    setSleepTimerSec(null);
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    setShowSleepMenu(false);
  };

  // ── Share Card Copy ──
  const handleCopyShareText = (t: AudioTrack) => {
    const text = `🕌 ${t.title}\n${t.subtitle ? `📖 ${t.subtitle}\n` : ""}${t.reciter ? `🎙️ ${t.reciter}\n` : ""}\n🔗 Listen on TheNahj: https://thenahj.live/audio`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
                setCurrent(0);
                setPlaying(false);
                setProgress(0);
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
        {activeTracks.map((t, i) => {
          const isSelected = i === safeCurrent;
          return (
            <div key={t.id} className="flex items-stretch gap-0">
              <button
                type="button"
                onClick={() => {
                  cleanup();
                  setPlaying(false);
                  setProgress(0);
                  setCurrent(i);
                }}
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
                      {playing ? (
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
                onClick={() => setShareTrack(t)}
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

      {/* Now playing bar */}
      <AnimatePresence>
        {track && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 mt-8 overflow-hidden rounded-2xl border border-gold/30 bg-surface/95 shadow-xl backdrop-blur-xl"
          >
            {/* Progress bar */}
            <div className="h-[3px] w-full bg-border/40">
              <div
                className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Thumbnail in player bar */}
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-background flex items-center justify-center">
                {track.cover_image ? (
                  <Image src={track.cover_image} alt={track.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gold/15 text-gold">
                    <Music size={18} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{track.title}</p>
                <p className="truncate text-xs text-muted">
                  {track.reciter ? `${track.reciter} • ` : ""}{track.category}
                </p>
              </div>

              {/* ── Playback Controls ── */}
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={prevTrack} className="rounded-full p-2 text-muted transition-colors hover:text-foreground" aria-label="Previous">
                  <SkipBack size={17} />
                </button>
                <button type="button" onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black shadow-md transition-all hover:scale-105" aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause size={18} className="fill-black" /> : <Play size={18} className="ml-0.5 fill-black" />}
                </button>
                <button type="button" onClick={nextTrack} className="rounded-full p-2 text-muted transition-colors hover:text-foreground" aria-label="Next">
                  <SkipForward size={17} />
                </button>
              </div>

              {/* ── Advanced Controls Row ── */}
              <div className="flex items-center gap-1 border-l border-border/30 pl-2 ml-1">
                {/* Playback Speed */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowSleepMenu(false); }}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-bold tracking-wide transition-all ${playbackSpeed !== 1 ? "bg-gold/20 text-gold-light border border-gold/30" : "text-muted hover:text-foreground hover:bg-surface-elevated"}`}
                    aria-label="Playback speed"
                  >
                    {playbackSpeed}x
                  </button>
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 rounded-xl border border-border/40 bg-surface/98 p-1.5 shadow-xl backdrop-blur-xl z-50"
                      >
                        <p className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-gold-muted font-semibold">Speed</p>
                        {SPEED_OPTIONS.map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => { setPlaybackSpeed(spd); setShowSpeedMenu(false); }}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-all ${spd === playbackSpeed ? "bg-gold/20 text-gold-light" : "text-foreground hover:bg-surface-elevated"}`}
                          >
                            {spd}x {spd === 1 ? "(Normal)" : spd < 1 ? "(Slow)" : "(Fast)"}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sleep Timer */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowSleepMenu(!showSleepMenu); setShowSpeedMenu(false); }}
                    className={`rounded-lg p-1.5 transition-all ${sleepTimerSec !== null ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-muted hover:text-foreground hover:bg-surface-elevated"}`}
                    aria-label="Sleep timer"
                  >
                    <Moon size={15} />
                  </button>
                  {sleepTimerSec !== null && (
                    <span className="absolute -top-1.5 -right-1 rounded-full bg-indigo-500 px-1 py-[1px] text-[8px] font-bold text-white leading-none">
                      {formatCountdown(sleepTimerSec)}
                    </span>
                  )}
                  <AnimatePresence>
                    {showSleepMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 rounded-xl border border-border/40 bg-surface/98 p-1.5 shadow-xl backdrop-blur-xl z-50 w-40"
                      >
                        <p className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-gold-muted font-semibold flex items-center gap-1">
                          <Moon size={10} /> Sleep Timer
                        </p>
                        {SLEEP_PRESETS.map((preset) => (
                          <button
                            key={preset.seconds}
                            type="button"
                            onClick={() => startSleepTimer(preset.seconds)}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-all ${
                              sleepTimerSec === preset.seconds ? "bg-indigo-500/20 text-indigo-400" : "text-foreground hover:bg-surface-elevated"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                        {sleepTimerSec !== null && (
                          <button
                            type="button"
                            onClick={cancelSleepTimer}
                            className="mt-1 block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            ✕ Cancel Timer
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Volume */}
                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:text-foreground hover:bg-surface-elevated"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>

            {/* Sleep Timer Active Banner */}
            {sleepTimerSec !== null && (
              <div className="flex items-center justify-center gap-2 border-t border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5">
                <Moon size={11} className="text-indigo-400" />
                <span className="text-[10px] font-medium text-indigo-400 tracking-wide">
                  Sleep in {formatCountdown(sleepTimerSec)} — playback will stop automatically
                </span>
                <button type="button" onClick={cancelSleepTimer} className="ml-2 text-[10px] text-red-400/80 hover:text-red-400 underline">Cancel</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {track?.src && (
        <audio ref={audioRef} src={track.src} muted={muted} preload="metadata" />
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

