"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Share2,
  Music,
  Check,
  Copy,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useAudioStore, type AudioTrack } from "@/lib/stores/audioStore";
import { toast } from "sonner";
import { ShareDrawer } from "@/components/ui/ShareDrawer";

export { type AudioTrack };

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoop,
    isShuffle,
    playTrack,
    setPlaylist,
    play,
    pause,
    togglePlay,
    stop,
    setVolume,
    toggleMute,
    seek,
    skipForward,
    skipBackward,
    nextTrack,
    prevTrack,
    toggleLoop,
    toggleShuffle,
  } = useAudioStore();

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sharingTrack, setSharingTrack] = useState<AudioTrack | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync playlist into store
  useEffect(() => {
    if (tracks.length > 0) {
      setPlaylist(tracks);
    }
  }, [tracks, setPlaylist]);

  // Deep linking or Auto-load First Track so Player is OPEN immediately
  useEffect(() => {
    if (tracks.length === 0) return;
    const idFromUrl = searchParams?.get("id");
    if (idFromUrl) {
      const match = tracks.find((t) => t.id === idFromUrl);
      if (match && currentTrack?.id !== match.id) {
        playTrack(match, tracks);
        return;
      }
    }

    // If no track is currently loaded in store, auto-load first track in paused/ready state
    if (!currentTrack && tracks[0]) {
      useAudioStore.setState({
        currentTrack: tracks[0],
        playlist: tracks,
        isPlaying: false,
      });
    }
  }, [searchParams, tracks, currentTrack, playTrack]);

  const activeTrack = currentTrack || tracks[0] || null;

  const categories = ["All", ...Array.from(new Set(tracks.map((t) => t.category).filter((c): c is string => Boolean(c))))];

  const filteredTracks = selectedCategory === "All"
    ? tracks
    : tracks.filter((t) =>
        t.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "Duas & Ziyarat" && (t.category === "Dua" || t.category === "Ziyarat"))
      );

  const activeTracks = filteredTracks.length > 0 ? filteredTracks : tracks;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
  };

  const handleShare = async (track: AudioTrack) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `🎵 ${track.title}${track.subtitle ? `\n📖 ${track.subtitle}` : ""}${track.reciter ? `\n🎙️ ${track.reciter}` : ""}`,
          url: `https://thenahj.live/audio?id=${track.id}`,
        });
        return;
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSharingTrack(track);
        }
      }
    } else {
      setSharingTrack(track);
    }
  };

  const handleCopyLink = (track: AudioTrack) => {
    const url = `https://thenahj.live/audio?id=${track.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Audio link copied to clipboard");
    });
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  if (!activeTrack) {
    return (
      <div className="rounded-3xl border border-border/20 bg-surface/40 p-12 text-center">
        <p className="text-muted text-sm">No audio tracks available.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      {/* ── Spotify-Style Main Hero Player Card ── */}
      <section 
        aria-label="Spotify Style Audio Player"
        className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 bg-surface/80 p-6 sm:p-8 md:p-10 backdrop-blur-2xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.6)]"
      >
        {/* Ambient Aura Background */}
        <div 
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-gold/25 via-amber-600/10 to-transparent blur-3xl opacity-70 transition-opacity duration-700" 
        />
        <div 
          className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl opacity-50" 
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* 1. Curved Square Artwork Card (Spotify Motion Thumbnail) */}
          <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
            {/* Pulsing ambient glow ring behind artwork */}
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.05, 1] : 0.98,
                opacity: isPlaying ? [0.4, 0.65, 0.4] : 0.25,
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-gold via-gold-light to-gold-muted blur-xl"
            />

            <motion.div
              animate={{
                scale: isPlaying ? 1 : 0.95,
                y: isPlaying ? 0 : 4,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 overflow-hidden rounded-[2rem] border-2 border-gold/40 bg-surface-alt shadow-[0_20px_50px_rgba(0,0,0,0.55)] group"
            >
              {activeTrack.cover_image ? (
                <Image
                  src={activeTrack.cover_image}
                  alt={activeTrack.title}
                  fill
                  sizes="(max-width: 768px) 256px, 288px"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gold/25 via-surface-elevated to-background p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold mb-3 shadow-inner">
                    <Music size={32} />
                  </div>
                  <span className="font-serif text-lg font-bold text-foreground">TheNahj</span>
                  <span className="text-xs uppercase tracking-widest text-gold-muted mt-1">Sacred Audio</span>
                </div>
              )}

              {/* Live Equalizer Badge on Artwork */}
              {isPlaying && (
                <div className="absolute bottom-3 right-3 flex items-end gap-1 rounded-full border border-gold/30 bg-black/60 px-3 py-1.5 backdrop-blur-md shadow-lg">
                  <span className="h-3 w-1 rounded-full bg-gold animate-[bounce_0.8s_infinite]" />
                  <span className="h-5 w-1 rounded-full bg-gold-light animate-[bounce_0.8s_infinite_0.2s]" />
                  <span className="h-2.5 w-1 rounded-full bg-gold animate-[bounce_0.8s_infinite_0.4s]" />
                </div>
              )}

              {/* Category Floating Pill */}
              <div className="absolute top-3 left-3 rounded-full border border-gold/30 bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-light backdrop-blur-md">
                {activeTrack.category || "Sacred Audio"}
              </div>
            </motion.div>
          </div>

          {/* 2. Track Title & Artist Metadata */}
          <div className="w-full text-center max-w-xl mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight drop-shadow-sm">
              {activeTrack.title}
            </h2>
            {activeTrack.reciter && (
              <p className="mt-1 text-sm sm:text-base font-medium text-gold flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-gold-light" />
                <span>{activeTrack.reciter}</span>
              </p>
            )}
            {activeTrack.subtitle && (
              <p className="mt-2 text-xs sm:text-sm text-muted/85 leading-relaxed line-clamp-2 px-4">
                {activeTrack.subtitle}
              </p>
            )}
          </div>

          {/* 3. Interactive Timeline Scrubber (Spotify Style) */}
          <div className="w-full max-w-xl mx-auto mb-6">
            <div className="relative flex items-center group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 cursor-pointer appearance-none rounded-lg bg-surface-alt accent-gold focus:outline-none transition-all group-hover:h-2.5"
                aria-label="Seek track"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs font-medium tabular-nums text-muted/90 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 4. Spotify Control Row (Stop, Prev, -10s, PLAY/PAUSE, +10s, Next, Loop, Shuffle) */}
          <div className="w-full max-w-xl mx-auto flex items-center justify-between sm:justify-center sm:gap-6 mb-8">
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              className={`relative p-2.5 rounded-full transition-all ${
                isShuffle ? "text-gold bg-gold/15 shadow-sm" : "text-muted hover:text-foreground hover:bg-surface-elevated"
              }`}
              title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              aria-label="Toggle shuffle"
            >
              <Shuffle size={18} />
              {isShuffle && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
            </button>

            {/* Previous Track */}
            <button
              type="button"
              onClick={prevTrack}
              className="p-2.5 rounded-full text-muted hover:text-gold hover:bg-surface-elevated transition-all active:scale-95"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack size={22} className="fill-current" />
            </button>

            {/* Rewind 10s */}
            <button
              type="button"
              onClick={() => skipBackward(10)}
              className="p-2.5 rounded-full text-muted hover:text-gold hover:bg-surface-elevated transition-all active:scale-95"
              title="Rewind 10 seconds"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw size={20} />
            </button>

            {/* Center Main Play / Pause Button (Spotify Signature Gold Button) */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full bg-gold text-black shadow-[0_8px_30px_rgba(199,166,84,0.45)] transition-all hover:scale-105 hover:bg-gold-light active:scale-95"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={28} className="fill-current" />
              ) : (
                <Play size={28} className="fill-current ml-1" />
              )}
            </button>

            {/* Forward 10s */}
            <button
              type="button"
              onClick={() => skipForward(10)}
              className="p-2.5 rounded-full text-muted hover:text-gold hover:bg-surface-elevated transition-all active:scale-95"
              title="Forward 10 seconds"
              aria-label="Forward 10 seconds"
            >
              <RotateCw size={20} />
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={nextTrack}
              className="p-2.5 rounded-full text-muted hover:text-gold hover:bg-surface-elevated transition-all active:scale-95"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward size={22} className="fill-current" />
            </button>

            {/* Loop / Repeat */}
            <button
              type="button"
              onClick={toggleLoop}
              className={`relative p-2.5 rounded-full transition-all ${
                isLoop ? "text-gold bg-gold/15 shadow-sm" : "text-muted hover:text-foreground hover:bg-surface-elevated"
              }`}
              title={isLoop ? "Loop On" : "Loop Off"}
              aria-label="Toggle loop"
            >
              <Repeat size={18} />
              {isLoop && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
            </button>

            {/* Stop Button */}
            <button
              type="button"
              onClick={stop}
              className="p-2.5 rounded-full text-muted hover:text-destructive hover:bg-surface-elevated transition-all active:scale-95 hidden xs:inline-flex"
              title="Stop playback"
              aria-label="Stop playback"
            >
              <Square size={17} className="fill-current" />
            </button>
          </div>

          {/* 5. Dedicated Working Volume Control Bar & Quick Actions */}
          <div className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/20">
            {/* Real Working Volume Controller */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/30 bg-surface-alt text-muted hover:text-gold hover:border-gold/40 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {getVolumeIcon()}
              </button>

              <div className="flex items-center gap-2 flex-1 sm:w-36">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 cursor-pointer appearance-none rounded-lg bg-surface-alt accent-gold focus:outline-none"
                  aria-label="Volume slider"
                />
                <span className="text-[11px] font-semibold tabular-nums text-gold-muted min-w-[36px] text-right">
                  {isMuted ? "Muted" : `${Math.round(volume * 100)}%`}
                </span>
              </div>

              {/* Volume Preset Quick Taps */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVolume(0.5)}
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition-colors ${
                    !isMuted && Math.round(volume * 100) === 50
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/20 text-muted/70 hover:text-foreground"
                  }`}
                  title="50% volume"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setVolume(1)}
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition-colors ${
                    !isMuted && Math.round(volume * 100) === 100
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/20 text-muted/70 hover:text-foreground"
                  }`}
                  title="Max volume"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Share & Copy Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(activeTrack)}
                className="flex items-center gap-1.5 rounded-xl border border-border/30 bg-surface-alt px-3 py-1.5 text-xs font-medium text-muted hover:text-gold hover:border-gold/40 transition-colors"
                title="Copy track link"
              >
                {copied ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(activeTrack)}
                className="flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light hover:bg-gold/20 hover:border-gold/50 transition-colors"
                title="Share track"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Tabs ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            Sacred Tracklist ({activeTracks.length})
          </h3>
          <span className="text-xs text-muted">Tap any track to play</span>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
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

        {/* ── Track List ── */}
        <div className="space-y-2.5">
          {activeTracks.map((t) => {
            const isSelected = activeTrack.id === t.id;
            return (
              <div key={t.id} className="flex items-stretch gap-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      togglePlay();
                    } else {
                      playTrack(t, tracks);
                    }
                  }}
                  className={`group flex flex-1 items-center gap-3.5 sm:gap-4 rounded-l-2xl p-3 sm:p-3.5 text-left transition-all ${
                    isSelected
                      ? "border border-r-0 border-gold/40 bg-gold/10 shadow-sm"
                      : "border border-r-0 border-border/20 bg-surface/50 hover:border-border/40 hover:bg-surface-elevated/80"
                  }`}
                >
                  {/* Track Thumbnail */}
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-background/80 flex items-center justify-center">
                    {t.cover_image ? (
                      <Image
                        src={t.cover_image}
                        alt={t.title}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/20 via-surface to-background text-gold-light">
                        <Music size={18} />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center backdrop-blur-[1px]">
                        {isPlaying ? (
                          <div className="flex items-center gap-[3px]">
                            <span className="inline-block h-3.5 w-[3px] animate-pulse rounded-full bg-gold" />
                            <span className="inline-block h-5 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
                            <span className="inline-block h-2.5 w-[3px] animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
                          </div>
                        ) : (
                          <Play size={16} className="ml-0.5 text-gold fill-gold" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${isSelected ? "text-gold-light font-bold" : "text-foreground"}`}>
                      {t.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted/80">
                      {t.reciter ? <span className="font-medium text-gold-muted/90">{t.reciter} — </span> : null}
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Category & Duration */}
                  <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                    <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-light hidden sm:inline-block">
                      {t.category}
                    </span>
                    <span className="text-xs tabular-nums text-muted">{t.duration}</span>
                  </div>
                </button>

                {/* Share Button per Track */}
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
                  <Share2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Drawer */}
      {sharingTrack && (
        <ShareDrawer
          isOpen={!!sharingTrack}
          onClose={() => setSharingTrack(null)}
          shareData={{
            title: sharingTrack.title,
            text: `🎵 ${sharingTrack.title}${sharingTrack.subtitle ? `\n📖 ${sharingTrack.subtitle}` : ""}${sharingTrack.reciter ? `\n🎤 ${sharingTrack.reciter}` : ""}`,
            url: `https://thenahj.live/audio?id=${sharingTrack.id}`,
            audioSrc: sharingTrack.src,
            coverImage: sharingTrack.cover_image,
          }}
        />
      )}
    </div>
  );
}
