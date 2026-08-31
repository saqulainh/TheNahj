"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { speakMultilingualText, stopTTS } from "@/lib/tts";

interface AudioReaderProps {
  text: string;
  arabicText?: string;
  urduText?: string;
  source?: string;
}

export function AudioReaderButton({ text, arabicText, urduText, source }: AudioReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const handleToggle = () => {
    if (!supported || typeof window === "undefined") return;

    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else {
      const fullText = [arabicText, urduText, text, source ? `Source: ${source}` : ''].filter(Boolean).join(". ");
      speakMultilingualText(fullText, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
        isPlaying
          ? "border-gold bg-gold/20 text-gold shadow-[0_0_15px_rgba(199,166,84,0.3)] animate-pulse"
          : "border-border/40 bg-surface-alt/70 text-muted hover:text-gold hover:border-gold/40"
      }`}
      title={isPlaying ? "Stop Voice Narration" : "Listen to Voice Narration"}
    >
      {isPlaying ? <VolumeX size={14} className="text-gold" /> : <Volume2 size={14} />}
      <span>{isPlaying ? "Stop Listening" : "Listen Audio"}</span>
    </button>
  );
}
