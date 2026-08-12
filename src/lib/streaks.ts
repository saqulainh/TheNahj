"use client";

import { useEffect, useState } from "react";

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastReadDate: string | null; // YYYY-MM-DD
  totalCardsRead: number;
  badges: string[];
}

const STORAGE_KEY = "thenahj_user_streak";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 1,
    bestStreak: 1,
    lastReadDate: null,
    totalCardsRead: 0,
    badges: ["First Step of Wisdom"],
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (stored) {
      try {
        const parsed: StreakData = JSON.parse(stored);
        if (parsed.lastReadDate === today) {
          // Already read today
          setStreak(parsed);
        } else if (parsed.lastReadDate === yesterday) {
          // Read yesterday, streak is active but hasn't read today yet
          setStreak(parsed);
        } else {
          // Missed a day, reset streak to 0 or 1
          const resetData: StreakData = {
            ...parsed,
            currentStreak: 0,
          };
          setStreak(resetData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        }
      } catch (e) {
        console.warn("Failed to parse streak data", e);
      }
    } else {
      // Initialize new streak
      const initial: StreakData = {
        currentStreak: 1,
        bestStreak: 1,
        lastReadDate: today,
        totalCardsRead: 1,
        badges: ["First Step of Wisdom"],
      };
      setStreak(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  const recordRead = () => {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    setStreak((prev) => {
      if (prev.lastReadDate === today) {
        // Already logged today, increment total count
        const updated = { ...prev, totalCardsRead: prev.totalCardsRead + 1 };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }

      let newStreak = prev.currentStreak + 1;
      if (prev.lastReadDate !== yesterday && prev.lastReadDate !== today) {
        newStreak = 1;
      }

      const newBest = Math.max(prev.bestStreak, newStreak);
      const badges = [...prev.badges];

      if (newStreak >= 3 && !badges.includes("3-Day Seeker")) badges.push("3-Day Seeker");
      if (newStreak >= 7 && !badges.includes("7-Day Noor Beacon")) badges.push("7-Day Noor Beacon");
      if (newStreak >= 30 && !badges.includes("30-Day Master of Reflection")) badges.push("30-Day Master of Reflection");

      const updated: StreakData = {
        currentStreak: newStreak,
        bestStreak: newBest,
        lastReadDate: today,
        totalCardsRead: prev.totalCardsRead + 1,
        badges,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { streak, recordRead };
}
