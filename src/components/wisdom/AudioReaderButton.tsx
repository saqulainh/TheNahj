"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

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
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // cancel any previous utterance
      setIsPlaying(true);

      const voices = window.speechSynthesis.getVoices();
      const utterances: SpeechSynthesisUtterance[] = [];

      // 1. Arabic
      if (arabicText) {
        const arU = new SpeechSynthesisUtterance(arabicText);
        arU.lang = "ar-SA";
        arU.rate = 0.85; // slightly slower for arabic reading
        // try to find an arabic voice
        const arVoice = voices.find(v => v.lang.startsWith("ar"));
        if (arVoice) arU.voice = arVoice;
        utterances.push(arU);
      }

      // 2. Urdu
      if (urduText) {
        const urU = new SpeechSynthesisUtterance(urduText);
        urU.lang = "ur-PK";
        urU.rate = 0.9;
        const urVoice = voices.find(v => v.lang.startsWith("ur"));
        if (urVoice) urU.voice = urVoice;
        utterances.push(urU);
      }

      // 3. English + Source
      const fullEngText = `${text}. ${source ? `Source: ${source}` : ""}`;
      const enU = new SpeechSynthesisUtterance(fullEngText);
      enU.lang = "en-US";
      enU.rate = 0.9;
      const enVoice = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Natural")) 
                   || voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) enU.voice = enVoice;
      utterances.push(enU);

      // Handle events
      utterances.forEach((u, index) => {
        u.onerror = () => {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
        };
        // Only stop playing when the very last utterance finishes
        if (index === utterances.length - 1) {
          u.onend = () => setIsPlaying(false);
        }
      });

      // Speak all in sequence
      utterances.forEach(u => window.speechSynthesis.speak(u));
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
