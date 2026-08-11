"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getStreakData } from "@/lib/streak";

export function StreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = getStreakData();
    setStreak(data.currentStreak);
  }, []);

  if (streak === 0) return null;

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-gold/10 border border-gold/20 px-2.5 py-1 text-gold"
      title={`${streak}-day reading streak!`}
    >
      <Flame size={13} className="text-orange-400" />
      <span className="text-[11px] font-bold tabular-nums">{streak}</span>
    </div>
  );
}
