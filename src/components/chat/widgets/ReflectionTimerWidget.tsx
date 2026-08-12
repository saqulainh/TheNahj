"use client";

import { useState, useEffect } from "react";
import { Timer, CheckCircle, Sparkles } from "lucide-react";

export function ReflectionTimerWidget({ prompt = "Close your eyes and reflect on Imam Ali's words for 60 seconds." }: { prompt?: string }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  return (
    <div className="rounded-2xl border border-gold/30 bg-surface-alt/90 p-4 shadow-lg backdrop-blur-md max-w-xs mx-auto my-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-gold text-[10px] uppercase font-bold tracking-widest mb-1">
        <Timer size={13} />
        <span>1-Minute Silent Reflection</span>
      </div>

      <p className="text-xs text-foreground/90 my-2 leading-relaxed font-medium">{prompt}</p>

      <div className="my-3 flex justify-center items-center gap-2">
        <span className="text-3xl font-extrabold text-gold tracking-tight">{timeLeft}s</span>
      </div>

      {!completed ? (
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-1.5 rounded-full bg-gold text-black font-bold text-xs transition-transform hover:scale-105"
        >
          {isRunning ? "Pause Reflection" : "Begin Silence"}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-green-400 text-xs font-semibold py-1">
          <CheckCircle size={14} />
          <span>Reflection Complete. May Allah grant you peace.</span>
        </div>
      )}
    </div>
  );
}
