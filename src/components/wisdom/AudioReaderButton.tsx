"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioReaderProps {
  text: string;
  source?: string;
}

export function AudioReaderButton({ text, source }: AudioReaderProps) {
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
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // cancel any previous utterance
      const fullText = `${text}. ${source ? `Source: ${source}` : ""}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.9; // Slightly slower, calm speed
      utterance.pitch = 1.0;

      // Try to find a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Natural"));
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
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
