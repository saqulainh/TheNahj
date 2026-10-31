"use client";

import { Headphones, Pause, Play } from "lucide-react";
import type { AudioTrack } from "@/lib/stores/audioStore";
import { useAudioStore } from "@/lib/stores/audioStore";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AudioPreview({ tracks }: { tracks: AudioTrack[] }) {
  const { currentTrack, isPlaying, playTrack, pause, play } = useAudioStore();
  const previewTracks = tracks.slice(0, 3);

  if (!previewTracks.length) return null;

  const handlePlay = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : play();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <section className="relative py-12 md:py-16" aria-labelledby="audio-preview-title">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          id="audio-preview-title"
          eyebrow="Listen"
          title="Audio reflections"
          description="Duas, ziyarat and reflections—ready to play while you read or rest."
          href="/audio"
          action="Browse audio"
        />

        <div className="grid gap-3 md:grid-cols-3">
          {previewTracks.map((track) => {
            const active = currentTrack?.id === track.id;
            const playing = active && isPlaying;
            return (
              <article
                key={track.id}
                className="group flex min-h-[116px] items-center gap-4 rounded-2xl border border-border/50 bg-surface/65 p-4 transition-colors hover:border-gold/35 hover:bg-surface"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[.08] text-gold-light">
                  <Headphones size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-gold-muted">
                    {track.category || "Audio"}{track.duration ? ` · ${track.duration}` : ""}
                  </p>
                  <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{track.title}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-muted/75">{track.reciter || "TheNahj audio"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlay(track)}
                  aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                  aria-pressed={playing}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-95"
                >
                  {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
