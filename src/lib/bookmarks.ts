"use client";

import { useState, useEffect } from "react";

export interface BookmarkItem {
  slug: string;
  title: string;
  source: string;
  quote: string;
  savedAt: string;
}

const BOOKMARKS_KEY = "thenahj_user_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const isBookmarked = (slug: string) => {
    return bookmarks.some((b) => b.slug === slug);
  };

  const toggleBookmark = (item: { slug: string; title: string; source: string; quote: string }) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.slug === item.slug);
      let updated: BookmarkItem[];

      if (exists) {
        updated = prev.filter((b) => b.slug !== item.slug);
      } else {
        updated = [
          {
            ...item,
            savedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }

      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { bookmarks, isBookmarked, toggleBookmark };
}
