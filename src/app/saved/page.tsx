"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { Button } from "@/components/ui/Button";
import type { Wisdom } from "@/lib/types";
import { getSavedSlugs } from "@/lib/wisdom";

export default function SavedPage() {
  const [items, setItems] = useState<Wisdom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = getSavedSlugs();
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    fetch("/api/wisdom/list")
      .then((r) => r.json())
      .then((data: Wisdom[]) => {
        const saved = data.filter((w) => slugs.includes(w.slug));
        setItems(slugs.map((s) => saved.find((w) => w.slug === s)).filter(Boolean) as Wisdom[]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="flex items-center gap-3">
        <Bookmark className="text-gold" size={28} />
        <div>
          <h1 className="text-3xl font-medium text-foreground">Saved Wisdom</h1>
          <p className="mt-1 text-sm text-muted">Reflections you marked to return to.</p>
        </div>
      </div>

      {loading && <p className="mt-12 text-center text-muted">Loading…</p>}

      {!loading && items.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-muted">Nothing saved yet.</p>
          <Button href="/wisdom" className="mt-6">
            Explore wisdom
          </Button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-12 space-y-8">
          {items.map((w, i) => (
            <WisdomCard key={w.id} wisdom={w} index={i} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-xs text-muted">
        Your saved wisdom securely syncs across your devices when logged in.
      </p>
    </section>
  );
}
