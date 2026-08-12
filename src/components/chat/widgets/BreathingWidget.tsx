"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Heart } from "lucide-react";

export function BreathingWidget({ title = "Mindful Reflection & Calm" }: { title?: string }) {
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === "Inhale") {
          setPhase("Hold");
          return 7;
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return 8;
        } else {
          setPhase("Inhale");
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, phase]);

  const reset = () => {
    setActive(false);
    setPhase("Inhale");
    setTimer(4);
  };

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-surface-alt/90 to-surface-elevated/90 p-4 text-center shadow-lg backdrop-blur-md max-w-xs mx-auto my-3">
      <div className="flex items-center justify-center gap-1.5 text-gold text-[10px] uppercase font-bold tracking-widest mb-1">
        <Heart size={12} className="animate-pulse" />
        <span>Generative Calming Widget</span>
      </div>
      
      <h4 className="text-xs font-semibold text-foreground mb-3">{title}</h4>

      {/* Pulsing Breathing Circle */}
      <div className="relative flex h-28 w-28 items-center justify-center mx-auto my-2">
        <motion.div
          animate={{
            scale: phase === "Inhale" ? 1.35 : phase === "Hold" ? 1.35 : 0.85,
            opacity: phase === "Hold" ? 0.9 : 0.6,
          }}
          transition={{ duration: phase === "Inhale" ? 4 : phase === "Exhale" ? 8 : 0.2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold/30 via-amber-500/20 to-gold/40 border border-gold/50 shadow-[0_0_20px_rgba(199,166,84,0.3)]"
        />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-sm font-bold text-gold-light uppercase tracking-wider">{phase}</span>
          <span className="text-xl font-extrabold text-foreground">{timer}s</span>
        </div>
      </div>

      <p className="text-[10px] text-muted italic my-2">
        &quot;In the remembrance of Allah do hearts find rest.&quot; (Quran 13:28)
      </p>

      <div className="flex justify-center gap-2 mt-3">
        <button
          onClick={() => setActive(!active)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold text-black text-[11px] font-bold transition-transform hover:scale-105"
        >
          {active ? <Pause size={12} /> : <Play size={12} />}
          {active ? "Pause" : "Start Breath"}
        </button>

        <button
          onClick={reset}
          className="p-1.5 rounded-full border border-border/40 text-muted hover:text-foreground hover:border-gold/40"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
