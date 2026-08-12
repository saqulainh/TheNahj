"use client";

import { useEffect, useState } from "react";

const HISTORY_KEY = "thenahj-reading-history";
const MAX_HISTORY = 50;

export interface ReadingEvent {
  slug: string;
  category: string;
  tags: string[];
  timestamp: number;
}

export function usePersonalization() {
  const [history, setHistory] = useState<ReadingEvent[]>([]);
  const [topTopics, setTopTopics] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingEvent[];
        setHistory(parsed);
        calculateTopTopics(parsed);
      }
    } catch (e) {
      console.error("Failed to load personalization history", e);
    }
  }, []);

  // Calculate top topics based on frequency in recent history
  const calculateTopTopics = (events: ReadingEvent[]) => {
    const topicCounts: Record<string, number> = {};
    
    events.forEach(event => {
      // Weight recent events higher? For simplicity, we just count them.
      if (event.category) {
        topicCounts[event.category] = (topicCounts[event.category] || 0) + 1.5;
      }
      event.tags.forEach(tag => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    });

    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    setTopTopics(sortedTopics);
  };

  // Track a new reading event
  const trackReading = (slug: string, category: string, tags: string[] = []) => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      let current: ReadingEvent[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if re-reading
      current = current.filter(e => e.slug !== slug);

      const newEvent: ReadingEvent = {
        slug,
        category,
        tags,
        timestamp: Date.now()
      };

      current.unshift(newEvent);

      // Trim to max history
      if (current.length > MAX_HISTORY) {
        current = current.slice(0, MAX_HISTORY);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(current));
      setHistory(current);
      calculateTopTopics(current);
    } catch (e) {
      console.error("Failed to save reading history", e);
    }
  };

  return {
    history,
    topTopics,
    trackReading
  };
}
