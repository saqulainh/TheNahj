"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ──
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastReadDate: string | null;
  readDates: string[]; // YYYY-MM-DD format
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredDays: number;
  earned: boolean;
  earnedAt?: string;
}

// ── Constants ──
const STREAK_KEY = "thenahj-streak";

const BADGE_DEFINITIONS: Omit<Badge, "earned" | "earnedAt">[] = [
  { id: "first-step", name: "First Step", emoji: "🌱", description: "Read your first wisdom", requiredDays: 1 },
  { id: "week-warrior", name: "Week Warrior", emoji: "🔥", description: "7-day reading streak", requiredDays: 7 },
  { id: "fortnight-focus", name: "Fortnight Focus", emoji: "⚡", description: "14-day reading streak", requiredDays: 14 },
  { id: "monthly-master", name: "Monthly Master", emoji: "🌙", description: "30-day reading streak", requiredDays: 30 },
  { id: "quarter-quest", name: "Quarter Quest", emoji: "💎", description: "90-day reading streak", requiredDays: 90 },
  { id: "century-sage", name: "Century Sage", emoji: "👑", description: "100-day reading streak", requiredDays: 100 },
];

// ── Helpers ──
function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function calculateStreak(readDates: string[]): number {
  if (readDates.length === 0) return 0;
  const sorted = [...new Set(readDates)].sort().reverse();
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  // Streak must include today or yesterday to be active
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i + 1]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(readDates: string[]): number {
  if (readDates.length === 0) return 0;
  const sorted = [...new Set(readDates)].sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
}

// ── Core Functions ──
export function getStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastReadDate: null, readDates: [], badges: [] };
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastReadDate: null, readDates: [], badges: [] };
    }
    const data = JSON.parse(raw) as StreakData;
    // Recalculate live streak
    data.currentStreak = calculateStreak(data.readDates);
    data.longestStreak = Math.max(data.longestStreak, calculateLongestStreak(data.readDates));
    data.totalDays = new Set(data.readDates).size;
    // Compute badges
    data.badges = BADGE_DEFINITIONS.map((def) => ({
      ...def,
      earned: data.longestStreak >= def.requiredDays,
      earnedAt: data.longestStreak >= def.requiredDays ? new Date().toISOString() : undefined,
    }));
    return data;
  } catch {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastReadDate: null, readDates: [], badges: [] };
  }
}

export function recordReading(): StreakData {
  const data = getStreakData();
  const today = getTodayStr();
  if (!data.readDates.includes(today)) {
    data.readDates.push(today);
  }
  data.lastReadDate = today;
  data.currentStreak = calculateStreak(data.readDates);
  data.longestStreak = Math.max(data.longestStreak, calculateLongestStreak(data.readDates));
  data.totalDays = new Set(data.readDates).size;
  data.badges = BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earned: data.longestStreak >= def.requiredDays,
    earnedAt: data.longestStreak >= def.requiredDays ? new Date().toISOString() : undefined,
  }));
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}

// ── Hook ──
export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, totalDays: 0, lastReadDate: null, readDates: [], badges: []
  });

  useEffect(() => {
    setStreak(getStreakData());
  }, []);

  const markRead = useCallback(() => {
    const updated = recordReading();
    setStreak(updated);
  }, []);

  return { streak, markRead };
}

// ── Heatmap helpers ──
export function getHeatmapData(readDates: string[]): { date: string; count: number }[] {
  const dateSet = new Set(readDates);
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  // Last 90 days
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, count: dateSet.has(dateStr) ? 1 : 0 });
  }
  return result;
}
