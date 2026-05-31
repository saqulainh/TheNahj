"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw, Maximize, Minimize, Square } from "lucide-react";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const focusQuotes = [
  "Your days are numbered — spend them on what builds you.",
  "The strong one controls himself when anger rises.",
  "Seeking knowledge is an obligation — start small, start now.",
  "You are but a collection of days. Make this one count.",
  "Silence is wisdom — excessive speech weakens a person.",
  "Whoever strives, finds — laziness never carried anyone to honor.",
  "Protect your heart fiercely — it is your guardian.",
];

const ambientSounds = [
  { id: "rain", label: "Rain", emoji: "🌧️", src: "/sounds/rain.mp3" },
  { id: "solitude", label: "Solitude", emoji: "🏔️", src: "/sounds/solitude.mp3" },
  { id: "mosque", label: "Mosque Ambience", emoji: "🕌", src: "/sounds/mosque.mp3" },
  { id: "silent", label: "Silent", emoji: "🤫", src: "" },
];

export function PomodoroTimer() {
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [zenMode, setZenMode] = useState(false);
  const [soundId, setSoundId] = useState("silent");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const total = onBreak ? BREAK_SECONDS : FOCUS_SECONDS;
  const progress = ((total - seconds) / total) * 100;

  const tick = useCallback(() => {
    setSeconds((s) => {
      if (s <= 1) {
        setRunning(false);
        if (!onBreak) {
          setSessionsCompleted((c) => c + 1);
        }
        setOnBreak((b) => !b);
        return onBreak ? FOCUS_SECONDS : BREAK_SECONDS;
      }
      return s - 1;
    });
  }, [onBreak]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % focusQuotes.length);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Handle audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (soundId !== "silent") {
      const sound = ambientSounds.find(s => s.id === soundId);
      if (sound && sound.src) {
        audioRef.current = new Audio(sound.src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch((e) => console.debug("Audio play failed:", e));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [soundId]);

  const reset = () => {
    setRunning(false);
    setOnBreak(false);
    setSeconds(FOCUS_SECONDS);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleSound = (id: string) => {
    setSoundId(id);
  };

  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  // SVG circle math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center transition-all duration-700 ${zenMode ? "scale-110" : ""}`}>
      {/* Session counter */}
      <AnimatePresence>
        {!zenMode && sessionsCompleted > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 flex items-center gap-2"
          >
            {Array.from({ length: sessionsCompleted }).map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-gold/60"
              />
            ))}
            <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
              {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer circle */}
      <div className="relative flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
        {/* Glow effect when running */}
        {running && (
          <div className="absolute inset-0 rounded-full bg-gold/5 blur-3xl" />
        )}

        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#e8d48b" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative text-center">
          <span className="text-6xl font-extralight tabular-nums tracking-tight text-foreground md:text-7xl">
            {mins}:{secs}
          </span>
          <p className={`mt-3 text-[10px] uppercase tracking-[0.3em] transition-colors ${
            onBreak ? "text-emerald-400/80" : "text-gold-muted"
          }`}>
            {onBreak ? "Break" : "Focus"}
          </p>
        </div>
      </div>

      {/* Quote */}
      <AnimatePresence mode="wait">
        <motion.p
          key={quoteIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="mt-12 max-w-md text-center text-sm italic leading-relaxed text-muted/80"
        >
          &ldquo;{focusQuotes[quoteIndex]}&rdquo;
        </motion.p>
      </AnimatePresence>

      {/* Controls */}
      {!zenMode && (
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 text-muted transition-all hover:border-gold/30 hover:text-foreground"
            aria-label="Reset"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-light transition-all hover:scale-105 hover:bg-gold/25 active:scale-95"
            aria-label={running ? "Pause" : "Start"}
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <button
            type="button"
            onClick={() => setZenMode(!zenMode)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 text-muted transition-all hover:border-gold/30 hover:text-foreground"
            aria-label={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
          >
            {zenMode ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      )}

      {/* Ambient sound picker */}
      <AnimatePresence>
        {!zenMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-10 overflow-hidden"
          >
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted/60">
              Ambient Sound
            </p>
            <div className="flex items-center justify-center gap-2">
              {ambientSounds.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSound(s.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-all ${
                    soundId === s.id
                      ? "bg-gold/15 text-gold-light"
                      : "bg-surface text-muted hover:bg-surface-elevated hover:text-foreground"
                  }`}
                >
                  {s.emoji}
                  <span>{s.label}</span>
                  {soundId === s.id && <Square size={14} className="ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode indicator */}
      {zenMode && (
        <div className="mt-6 text-center text-sm text-gold/70">
          Zen Mode Active • <span className="underline decoration-gold/50 hover:decoration-gold/200"
            onClick={() => setZenMode(false)}
          >
            Exit
          </span>
        </div>
      )}
    </div>
  );
}
