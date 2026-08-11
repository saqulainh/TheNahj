"use client";

import { useEffect, useState, useCallback } from "react";
import { Bookmark, FolderOpen, Trash2, Plus, ChevronRight } from "lucide-react";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { Button } from "@/components/ui/Button";
import type { Wisdom } from "@/lib/types";
import { getSavedSlugs } from "@/lib/wisdom";
import { 
  getCollections, deleteCollection, createCollection, 
  type WisdomCollection 
} from "@/components/wisdom/CollectionManager";
import { motion, AnimatePresence } from "framer-motion";

type ActiveTab = "all" | string; // "all" or collection ID

export default function SavedPage() {
  const [items, setItems] = useState<Wisdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<WisdomCollection[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📖");

  const EMOJIS = ["📖", "🌙", "☀️", "❤️", "⭐", "🔥", "⚡", "🕌", "🤲", "📚", "🎯", "💎", "🌟", "🧠", "🌿"];

  const refreshCollections = useCallback(() => {
    setCollections(getCollections());
  }, []);

  useEffect(() => {
    refreshCollections();
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
  }, [refreshCollections]);

  // Refresh collections when tab changes (for reactivity)
  useEffect(() => {
    refreshCollections();
  }, [activeTab, refreshCollections]);

  const handleCreateCollection = () => {
    if (!newName.trim()) return;
    createCollection(newName.trim(), newEmoji);
    setNewName("");
    setNewEmoji("📖");
    setShowCreateModal(false);
    refreshCollections();
  };

  const handleDeleteCollection = (id: string) => {
    deleteCollection(id);
    if (activeTab === id) setActiveTab("all");
    refreshCollections();
  };

  // Get items for the active view
  const activeCollection = collections.find((c) => c.id === activeTab);
  const displayItems = activeTab === "all"
    ? items
    : items.filter((w) => activeCollection?.slugs.includes(w.slug));

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bookmark className="text-gold" size={28} />
          <div>
            <h1 className="text-3xl font-medium text-foreground">Saved Wisdom</h1>
            <p className="mt-1 text-sm text-muted">Reflections you marked to return to.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-4 py-2.5 text-xs font-bold text-gold transition-all hover:bg-gold/20"
        >
          <Plus size={14} /> New Collection
        </button>
      </div>

      {/* Collection Tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all ${
            activeTab === "all"
              ? "bg-gold text-black shadow-md font-semibold"
              : "bg-surface/70 text-muted hover:bg-surface-elevated hover:text-foreground border border-border/30"
          }`}
        >
          📚 All Saved ({items.length})
        </button>
        {collections.map((col) => {
          const count = items.filter((w) => col.slugs.includes(w.slug)).length;
          return (
            <div key={col.id} className="relative group flex items-stretch">
              <button
                onClick={() => setActiveTab(col.id)}
                className={`whitespace-nowrap rounded-l-full pl-4 pr-2 py-2 text-xs font-medium tracking-wide transition-all ${
                  activeTab === col.id
                    ? "bg-gold text-black shadow-md font-semibold"
                    : "bg-surface/70 text-muted hover:bg-surface-elevated hover:text-foreground border border-r-0 border-border/30"
                }`}
              >
                {col.emoji} {col.name} ({count})
              </button>
              <button
                onClick={() => handleDeleteCollection(col.id)}
                className={`rounded-r-full pr-3 pl-1 py-2 text-xs transition-all ${
                  activeTab === col.id
                    ? "bg-gold text-black/50 hover:text-black"
                    : "bg-surface/70 text-muted/40 hover:text-red-400 border border-l-0 border-border/30"
                }`}
                aria-label={`Delete ${col.name}`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {loading && <p className="mt-12 text-center text-muted">Loading…</p>}

      {!loading && displayItems.length === 0 && (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold mb-6">
            <FolderOpen size={32} />
          </div>
          <p className="text-lg font-medium text-foreground">
            {activeTab === "all" ? "Nothing saved yet." : `No items in "${activeCollection?.name || "collection"}".`}
          </p>
          <p className="mt-2 text-sm text-muted">
            {activeTab === "all" 
              ? "Explore wisdom and tap the bookmark icon to save reflections here." 
              : "Add wisdom cards to this collection using the dropdown arrow on any card."}
          </p>
          <Button href="/wisdom" className="mt-6">
            Explore wisdom
          </Button>
        </div>
      )}

      {!loading && displayItems.length > 0 && (
        <div className="mt-8 space-y-8">
          {displayItems.map((w, i) => (
            <WisdomCard key={w.id} wisdom={w} index={i} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-xs text-muted">
        Your saved wisdom securely syncs across your devices when logged in.
      </p>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-border/40 bg-surface p-6 shadow-2xl space-y-5"
            >
              <h3 className="text-lg font-semibold text-foreground">Create Collection</h3>
              
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewEmoji(em)}
                    className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      newEmoji === em ? "bg-gold/20 ring-2 ring-gold/40 scale-110" : "bg-surface-elevated hover:bg-surface-elevated/80"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                placeholder="e.g. Morning Routine, Exam Prep..."
                className="w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-gold/40"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCreateCollection}
                  disabled={!newName.trim()}
                  className="flex-1 rounded-xl bg-gold py-3 text-xs font-bold text-black transition-all hover:bg-gold-light disabled:opacity-40"
                >
                  {newEmoji} Create Collection
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border/30 px-4 py-3 text-xs font-medium text-muted hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
