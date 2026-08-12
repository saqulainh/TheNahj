"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useAudioStore } from "@/lib/stores/audioStore";
import Link from "next/link";

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, volume, play, pause, setVolume, stop } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle play/pause sync
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Handle volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle progress
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={stop}
        autoPlay
      />

      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 pointer-events-none"
        >
          <div className="mx-auto max-w-4xl w-full pointer-events-auto">
            <div className="rounded-2xl border border-gold/20 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Progress Bar (Top Edge) */}
              <div className="h-1 w-full bg-surface/50 relative group cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gold to-gold-light"
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                />
              </div>

              <div className="p-3 sm:p-4 flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={isPlaying ? pause : play}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-background hover:bg-gold-light transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-1" />
                  )}
                </button>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">
                    {currentTrack.title}
                  </h4>
                  <p className="truncate text-xs text-muted mt-0.5">
                    {currentTrack.reciter || currentTrack.subtitle || "TheNahj Audio"}
                  </p>
                </div>

                {/* Desktop Controls */}
                <div className="hidden sm:flex items-center gap-4 text-muted">
                  <div className="text-xs font-medium tabular-nums min-w-[80px] text-right">
                    {formatTime(progress)} / {formatTime(duration)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-foreground transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-16 accent-gold"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link 
                    href="/audio" 
                    className="p-2 text-muted hover:text-gold transition-colors hidden sm:block"
                    title="Open Audio Library"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={stop}
                    className="p-2 text-muted hover:text-destructive transition-colors"
                    title="Close Player"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
