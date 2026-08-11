"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderPlus, X, Check, Trash2, Bookmark, ChevronDown, 
  Sparkles, BookOpen, Moon, Sun, Heart, Star, Flame, Zap 
} from "lucide-react";

// ── Types ──
export interface WisdomCollection {
  id: string;
  name: string;
  emoji: string;
  slugs: string[];
  createdAt: string;
}

// ── Emoji Palette ──
const COLLECTION_EMOJIS = ["📖", "🌙", "☀️", "❤️", "⭐", "🔥", "⚡", "🕌", "🤲", "📚", "🎯", "💎", "🌟", "🧠", "🌿"];

// ── Local Storage Key ──
const COLLECTIONS_KEY = "thenahj-collections";

// ── Helper Functions (exported for use across components) ──
export function getCollections(): WisdomCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    return raw ? (JSON.parse(raw) as WisdomCollection[]) : [];
  } catch {
    return [];
  }
}

export function saveCollections(collections: WisdomCollection[]) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

export function createCollection(name: string, emoji: string): WisdomCollection {
  const collections = getCollections();
  const newCollection: WisdomCollection = {
    id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    emoji,
    slugs: [],
    createdAt: new Date().toISOString(),
  };
  collections.push(newCollection);
  saveCollections(collections);
  return newCollection;
}

export function deleteCollection(collectionId: string) {
  const collections = getCollections().filter((c) => c.id !== collectionId);
  saveCollections(collections);
}

export function addToCollection(collectionId: string, slug: string) {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (col && !col.slugs.includes(slug)) {
    col.slugs.push(slug);
    saveCollections(collections);
  }
}

export function removeFromCollection(collectionId: string, slug: string) {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (col) {
    col.slugs = col.slugs.filter((s) => s !== slug);
    saveCollections(collections);
  }
}

export function getCollectionsForSlug(slug: string): string[] {
  return getCollections()
    .filter((c) => c.slugs.includes(slug))
    .map((c) => c.id);
}

// ── "Add to Collection" Dropdown Component (used inside WisdomCard) ──
interface AddToCollectionMenuProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCollectionMenu({ slug, isOpen, onClose }: AddToCollectionMenuProps) {
  const [collections, setCollections] = useState<WisdomCollection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📖");
  const [memberOf, setMemberOf] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setCollections(getCollections());
    setMemberOf(getCollectionsForSlug(slug));
  }, [slug]);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const handleToggle = (collectionId: string) => {
    if (memberOf.includes(collectionId)) {
      removeFromCollection(collectionId, slug);
    } else {
      addToCollection(collectionId, slug);
    }
    refresh();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = createCollection(newName.trim(), newEmoji);
    addToCollection(col.id, slug);
    setNewName("");
    setNewEmoji("📖");
    setIsCreating(false);
    refresh();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 z-[60] w-64 rounded-2xl border border-border/40 bg-surface/98 shadow-2xl backdrop-blur-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/20 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Save to Collection</p>
            <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Collection List */}
          <div className="max-h-52 overflow-y-auto p-2 space-y-1 scrollbar-none">
            {collections.length === 0 && !isCreating && (
              <p className="px-3 py-4 text-center text-xs text-muted/60">
                No collections yet. Create one below!
              </p>
            )}
            {collections.map((col) => {
              const isMember = memberOf.includes(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                    isMember
                      ? "bg-gold/15 border border-gold/30"
                      : "hover:bg-surface-elevated border border-transparent"
                  }`}
                >
                  <span className="text-base">{col.emoji}</span>
                  <span className={`flex-1 truncate text-xs font-medium ${isMember ? "text-gold-light" : "text-foreground"}`}>
                    {col.name}
                  </span>
                  <span className="text-[10px] text-muted tabular-nums">{col.slugs.length}</span>
                  {isMember && <Check size={14} className="text-gold shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Create New Collection */}
          {isCreating ? (
            <div className="border-t border-border/20 p-3 space-y-3">
              <div className="flex gap-2">
                {/* Emoji Picker */}
                <div className="flex flex-wrap gap-1 max-w-[140px]">
                  {COLLECTION_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      className={`h-7 w-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        newEmoji === em ? "bg-gold/20 ring-1 ring-gold/40 scale-110" : "hover:bg-surface-elevated"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Collection name..."
                className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-gold/40"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-[10px] font-bold text-black transition-all hover:bg-gold-light disabled:opacity-40"
                >
                  Create
                </button>
                <button
                  onClick={() => { setIsCreating(false); setNewName(""); }}
                  className="rounded-lg border border-border/30 px-3 py-1.5 text-[10px] font-medium text-muted hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-border/20 p-2">
              <button
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-gold hover:bg-gold/10 transition-all"
              >
                <FolderPlus size={14} />
                New Collection
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
