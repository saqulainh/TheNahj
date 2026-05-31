"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Copy, Share2 } from "lucide-react";

interface WisdomHeroActionsProps {
  slug: string;
  title: string;
}

const storageKey = (slug: string) => `thenahj-wisdom-bookmark:${slug}`;

export function WisdomHeroActions({ slug, title }: WisdomHeroActionsProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setSaved(localStorage.getItem(storageKey(slug)) === "1");
    } catch {
      setSaved(false);
    }
  }, [slug]);

  const toggleBookmark = () => {
    const next = !saved;
    setSaved(next);
    try {
      localStorage.setItem(storageKey(slug), next ? "1" : "0");
    } catch {
      // Ignore storage failures.
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/wisdom/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/wisdom/${slug}`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-gold/35 hover:text-gold-light"
      >
        <Share2 size={13} />
        Share
      </button>
      <button
        type="button"
        onClick={toggleBookmark}
        className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-gold/35 hover:text-gold-light"
      >
        {saved ? <Check size={13} /> : <Bookmark size={13} />}
        {saved ? "Saved" : "Bookmark"}
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-gold/35 hover:text-gold-light"
      >
        <Copy size={13} />
        Copy link
      </button>
    </div>
  );
}