"use client";

import { useState } from "react";
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

const initialMenu: MenuItem[] = [
  { id: "1", label: "Home", href: "/", order: 1 },
  { id: "2", label: "Wisdom Library", href: "/wisdom", order: 2 },
  { id: "3", label: "Focus Timer", href: "/focus", order: 3 },
  { id: "4", label: "Audio", href: "/audio", order: 4 },
  { id: "5", label: "Articles", href: "/articles", order: 5 },
];

export default function NavigationPage() {
  const [items, setItems] = useState<MenuItem[]>(initialMenu);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newHref) return;
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newLabel,
      href: newHref,
      order: items.length + 1,
    };
    setItems([...items, newItem]);
    setNewLabel("");
    setNewHref("");
    setStatus("Added item. Don't forget to Save changes!");
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    setStatus("Deleted item. Don't forget to Save changes!");
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditHref(item.href);
  };

  const saveEdit = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, label: editLabel, href: editHref } : it)));
    setEditingId(null);
    setStatus("Edited item inline. Save configuration to push live.");
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp!;
    setItems(next);
  };

  const handleSave = () => {
    setStatus("Saving changes to global brand configuration...");
    setTimeout(() => {
      setStatus("Header Navigation Menu updated dynamically!");
    }, 600);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Menu className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Navigation Menu Builder</h1>
          <p className="mt-1 text-sm text-muted">Dynamically construct the site navigation bar structure and custom links.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Creator panel */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface p-6 space-y-6 self-start">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold-muted" /> Add Link Item
          </h2>

          <form onSubmit={addItem} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Link Label</span>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Topics"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Destination Path (href)</span>
              <input
                type="text"
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                placeholder="e.g. /topics"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none font-mono"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-gold/15 py-3 text-xs font-semibold text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
            >
              Add to Menu Structure
            </button>
          </form>
        </div>

        {/* Builder view */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-muted mb-4">Site Menu Nodes</h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-4 mr-4">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-1/3 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editHref}
                        onChange={(e) => setEditHref(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-none font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-foreground text-sm">{item.label}</span>
                      <span className="ml-4 text-xs font-mono text-muted">{item.href}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Sort buttons */}
                    <button
                      onClick={() => moveOrder(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:text-gold-light text-muted disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveOrder(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="p-1 hover:text-gold-light text-muted disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <div className="h-4 w-px bg-border mx-2" />

                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-muted hover:text-gold-light"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-muted hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
          >
            Save Navigation Configuration
          </button>
        </div>
      </div>

      {status && (
        <div className="rounded-lg bg-surface p-4 text-xs text-gold-muted border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
