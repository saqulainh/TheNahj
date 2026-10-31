"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2, VolumeX, Volume1, Maximize2, SkipForward, SkipBack } from "lucide-react";
import { useAudioStore } from "@/lib/stores/audioStore";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    seekTarget,
    isLoop,
    play,
    pause,
    setVolume,
    toggleMute,
    seek,
    clearSeekTarget,
    nextTrack,
    prevTrack,
    stop,
    updateTime,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const isAudioPage = pathname === "/audio";

  // Handle play/pause sync
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Audio play blocked", e));
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

  // Handle seekTarget instruction from store
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      clearSeekTarget();
    }
  }, [seekTarget, clearSeekTarget]);

  // Progress update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateTime(audioRef.current.currentTime, audioRef.current.duration || 0);
    }
  };

  const syncVolumeAndMetadata = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (audioRef.current.duration) {
        updateTime(audioRef.current.currentTime, audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    if (isLoop && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      nextTrack();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seek(time);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Underlying Single Audio Element — persists continuously across page transitions */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={syncVolumeAndMetadata}
        onCanPlay={syncVolumeAndMetadata}
        onEnded={handleEnded}
        autoPlay
      />

      {/* Floating Bottom Bar — visible on all pages EXCEPT /audio (where the full Spotify hero player is open) */}
      <AnimatePresence>
        {!isAudioPage && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 pointer-events-none"
          >
            <div className="mx-auto max-w-4xl w-full pointer-events-auto">
              <div className="rounded-2xl border border-gold/30 bg-surface/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-gold/15">
                {/* Progress Bar (Top Edge) */}
                <div className="h-1.5 w-full bg-surface-alt relative group cursor-pointer">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Seek timeline"
                  />
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gold via-gold-light to-gold shadow-[0_0_8px_rgba(199,166,84,0.5)]"
                    style={{ width: `${((currentTime / (duration || 1)) * 100) || 0}%` }}
                  />
                </div>

                <div className="p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl border border-gold/30 bg-surface-alt shadow-sm">
                    {currentTrack.cover_image ? (
                      <Image
                        src={currentTrack.cover_image}
                        alt={currentTrack.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/20 via-surface to-background text-gold">
                        <span className="text-xs font-serif font-bold">TN</span>
                      </div>
                    )}
                  </div>

                  {/* Playback Controls (Prev, Play, Next) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={prevTrack}
                      className="p-1.5 text-muted hover:text-gold transition-colors hidden xs:flex items-center justify-center rounded-lg"
                      title="Previous"
                      aria-label="Previous track"
                    >
                      <SkipBack className="h-4 w-4 fill-current" />
                    </button>

                    <button
                      onClick={isPlaying ? pause : play}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-gold text-black hover:bg-gold-light transition-all shadow-md active:scale-95"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={nextTrack}
                      className="p-1.5 text-muted hover:text-gold transition-colors hidden xs:flex items-center justify-center rounded-lg"
                      title="Next"
                      aria-label="Next track"
                    >
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-xs sm:text-sm font-semibold text-foreground">
                      {currentTrack.title}
                    </h4>
                    <p className="truncate text-[11px] sm:text-xs text-muted/90 mt-0.5">
                      {currentTrack.reciter ? (
                        <span className="text-gold-light font-medium">{currentTrack.reciter} — </span>
                      ) : null}
                      {currentTrack.subtitle || "TheNahj Audio"}
                    </p>
                  </div>

                  {/* Time & Volume Controls */}
                  <div className="flex items-center gap-3 text-muted">
                    <div className="text-[11px] sm:text-xs font-medium tabular-nums text-muted/90">
                      {formatTime(currentTime)} <span className="opacity-40">/</span> {formatTime(duration)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleMute}
                        className="p-1 text-muted hover:text-gold transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {getVolumeIcon()}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-16 sm:w-20 accent-gold h-1.5 cursor-pointer bg-surface-alt rounded-lg"
                        aria-label="Volume slider"
                      />
                    </div>
                  </div>

                  {/* Right Actions (Expand to /audio, Close) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href="/audio"
                      className="p-1.5 text-muted hover:text-gold transition-colors hidden sm:flex items-center justify-center rounded-lg"
                      title="Open Full Audio Player"
                      aria-label="Open Full Audio Player"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={stop}
                      className="p-1.5 text-muted hover:text-destructive transition-colors rounded-lg"
                      title="Close Player"
                      aria-label="Close Player"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
