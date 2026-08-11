"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Star } from "lucide-react";
import { useStreak, getHeatmapData } from "@/lib/streak";

export function StreakDashboard() {
  const { streak } = useStreak();

  const heatmap = getHeatmapData(streak.readDates);
  const earnedBadges = streak.badges.filter((b) => b.earned);
  const nextBadge = streak.badges.find((b) => !b.earned);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-4 text-center"
        >
          <Flame size={20} className="mx-auto text-gold mb-2" />
          <p className="text-2xl font-bold text-gold tabular-nums">{streak.currentStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-gold-muted font-medium mt-1">Current Streak</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/20 bg-surface/60 p-4 text-center"
        >
          <Trophy size={20} className="mx-auto text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{streak.longestStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium mt-1">Best Streak</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/20 bg-surface/60 p-4 text-center"
        >
          <Calendar size={20} className="mx-auto text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{streak.totalDays}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium mt-1">Total Days</p>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-2xl border border-border/20 bg-surface/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted font-semibold mb-3">Last 90 Days</p>
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(12px,_1fr))] gap-[3px]">
          {heatmap.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-[3px] transition-colors ${
                day.count > 0
                  ? "bg-gold/70 shadow-[0_0_4px_rgba(199,166,84,0.3)]"
                  : "bg-border/20"
              }`}
              title={`${day.date}: ${day.count > 0 ? "Read" : "Missed"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[9px] text-muted">Less</span>
          <div className="h-2.5 w-2.5 rounded-[2px] bg-border/20" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-gold/40" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-gold/70" />
          <span className="text-[9px] text-muted">More</span>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl border border-border/20 bg-surface/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted font-semibold mb-3">
          <Star size={10} className="inline mr-1" />
          Badges ({earnedBadges.length}/{streak.badges.length})
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {streak.badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: badge.earned ? 1.1 : 1 }}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all ${
                badge.earned
                  ? "bg-gold/10 border border-gold/20"
                  : "bg-surface/30 border border-border/10 opacity-40 grayscale"
              }`}
              title={badge.description}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className={`text-[9px] font-semibold text-center leading-tight ${badge.earned ? "text-gold-light" : "text-muted"}`}>
                {badge.name}
              </span>
              <span className="text-[8px] text-muted tabular-nums">{badge.requiredDays}d</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Badge Progress */}
      {nextBadge && (
        <div className="rounded-2xl border border-gold/15 bg-gold/5 p-4 flex items-center gap-4">
          <span className="text-3xl grayscale-[50%]">{nextBadge.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Next: {nextBadge.name}</p>
            <p className="text-[10px] text-muted mt-0.5">{nextBadge.description}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (streak.currentStreak / nextBadge.requiredDays) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
              />
            </div>
            <p className="text-[9px] text-gold-muted mt-1 tabular-nums">
              {streak.currentStreak} / {nextBadge.requiredDays} days
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
