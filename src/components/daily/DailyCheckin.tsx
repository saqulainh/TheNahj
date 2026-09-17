"use client";

import { useState, useEffect } from "react";
import { useStreak } from "@/lib/streak";
import { CheckCircle, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DailyCheckin() {
  const { streak, markRead } = useStreak();
  const [marked, setMarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarkAsRead = () => {
    markRead();
    setMarked(true);
  };

  if (!mounted) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const isAlreadyRead = streak.lastReadDate === todayStr || marked;

  return (
    <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center space-y-4 rounded-2xl border border-border/50 bg-surface-alt/30 p-8 backdrop-blur-sm">
      <div className="flex items-center space-x-2 text-gold">
        <Flame size={28} className={streak.currentStreak > 0 ? "text-orange-500" : "text-muted"} />
        <span className="text-2xl font-bold">{streak.currentStreak} Day Streak</span>
      </div>
      
      <p className="text-center text-sm text-muted">
        Build a daily habit of reading Imam Ali's (AS) wisdom.
      </p>

      <AnimatePresence mode="wait">
        {isAlreadyRead ? (
          <motion.div
            key="read"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 rounded-full bg-green-500/10 px-6 py-2.5 text-sm font-semibold text-green-600 dark:text-green-400"
          >
            <CheckCircle size={18} />
            <span>Today's wisdom completed!</span>
          </motion.div>
        ) : (
          <motion.button
            key="unread"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleMarkAsRead}
            className="rounded-full bg-gold px-8 py-3 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
          >
            Mark as Read
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
