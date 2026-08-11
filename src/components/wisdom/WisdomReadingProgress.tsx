"use client";

import { useEffect, useState, useRef } from "react";
import { useStreak } from "@/lib/streak";

interface WisdomReadingProgressProps {
  readingTime: number;
}

export function WisdomReadingProgress({ readingTime }: WisdomReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const { markRead } = useStreak();

  const hasMarkedRead = useRef(false);

  // Record streak when opening a wisdom page
  useEffect(() => {
    if (!hasMarkedRead.current) {
      markRead();
      hasMarkedRead.current = true;
    }
  }, [markRead]);

  useEffect(() => {
    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = documentHeight > 0 ? Math.round((window.scrollY / documentHeight) * 100) : 0;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="sticky top-4 z-30 rounded-2xl border border-border/20 bg-surface/80 p-4 backdrop-blur-md shadow-sm md:top-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Reading Progress</p>
          <p className="mt-1 text-sm text-foreground">{progress}% complete</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground">{readingTime || 1} min read</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Estimated reading time</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/25">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
