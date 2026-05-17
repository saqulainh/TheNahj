"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  /** URL or path — falls back to placeholder if missing */
  src?: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = tracks[current];

  const cleanup = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const togglePlay = () => {
    if (!track.src) {
      // simulate playback for demo
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
      audio.play();
    }
    setPlaying(!playing);
  };

  const nextTrack = () => {
    cleanup();
    setPlaying(false);
    setProgress(0);
    setCurrent((c) => (c + 1) % tracks.length);
  };

  const prevTrack = () => {
    cleanup();
    setPlaying(false);
    setProgress(0);
    setCurrent((c) => (c - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="w-full">
      {/* Track list */}
      <div className="space-y-2">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              cleanup();
              setPlaying(false);
              setProgress(0);
              setCurrent(i);
            }}
            className={`group flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-all ${
              i === current
                ? "border border-gold/30 bg-gold/5"
                : "border border-transparent hover:bg-surface-elevated"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                i === current
                  ? "bg-gold/20 text-gold-light"
                  : "bg-surface text-muted group-hover:bg-gold/10 group-hover:text-gold"
              }`}
            >
              {i === current && playing ? (
                <div className="flex items-center gap-[3px]">
                  <span className="inline-block h-3 w-[3px] animate-pulse rounded-full bg-gold" />
                  <span className="inline-block h-4 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
                  <span className="inline-block h-2 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
                </div>
              ) : (
                <Play size={16} className="ml-0.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{t.subtitle}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-gold-muted">
                {t.category}
              </span>
              <span className="text-xs tabular-nums text-muted">{t.duration}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Now playing bar */}
      <AnimatePresence>
        {track && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 mt-8 overflow-hidden rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-xl"
          >
            {/* Progress bar */}
            <div className="h-[2px] w-full bg-border/40">
              <div
                className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{track.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{track.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevTrack}
                  className="rounded-full p-2 text-muted transition-colors hover:text-foreground"
                  aria-label="Previous"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold-light transition-all hover:scale-105 hover:bg-gold/25"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={nextTrack}
                  className="rounded-full p-2 text-muted transition-colors hover:text-foreground"
                  aria-label="Next"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMuted(!muted)}
                className="rounded-full p-2 text-muted transition-colors hover:text-foreground"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {track.src && (
        <audio ref={audioRef} src={track.src} muted={muted} preload="metadata" />
      )}
    </div>
  );
}
