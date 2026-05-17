"use client";

import { useState } from "react";
import { Library, Tag, Search, Calendar, Plus, Trash2 } from "lucide-react";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  cover_image: "",
  tags: [] as string[],
  items: [] as string[],
  publish_date: "",
  meta_title: "",
  meta_description: "",
};

export default function CollectionsPage() {
  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState("");
  const [itemInput, setItemInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: any) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addItem = () => {
    if (itemInput.trim() && !form.items.includes(itemInput.trim())) {
      update("items", [...form.items, itemInput.trim()]);
      setItemInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Publishing collection…");
    setTimeout(() => {
      setStatus("Collection published successfully!");
      setForm(initialForm);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Library className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Collections Manager</h1>
          <p className="mt-1 text-sm text-muted">Group sermon translations, wisdom insights, and digital content together.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main info */}
          <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Library className="h-4 w-4 text-gold-muted" /> Collection Core
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Collection Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none font-mono"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Cover Image URL</span>
              <input
                type="text"
                value={form.cover_image}
                onChange={(e) => update("cover_image", e.target.value)}
                placeholder="/backgrounds/..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-6">
            {/* SEO Panel */}
            <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-gold-muted" /> SEO Optimization
              </h2>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Meta Title</span>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={(e) => update("meta_title", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Meta Description</span>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => update("meta_description", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>
            </div>

            {/* Scheduling */}
            <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-muted" /> Publishing Schedule
              </h2>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Publish Date</span>
                <input
                  type="datetime-local"
                  value={form.publish_date}
                  onChange={(e) => update("publish_date", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic taxonomies & items selector */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tags */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-gold-muted">Tags & Taxonomies</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. self-discipline"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-gold/25 px-4 text-xs font-semibold text-gold-light hover:bg-gold/35"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted border border-border">
                  {t}
                  <Trash2
                    size={12}
                    className="cursor-pointer text-red-400 hover:text-red-300"
                    onClick={() => update("tags", form.tags.filter((_, i) => i !== idx))}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Child Slugs */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-gold-muted">Wisdom Slugs in Collection</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                placeholder="e.g. silence-is-wisdom"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={addItem}
                className="rounded-xl bg-gold/25 px-4 text-xs font-semibold text-gold-light hover:bg-gold/35"
              >
                Add
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-background p-2.5 text-xs text-muted border border-border">
                  <span className="font-mono">{it}</span>
                  <Trash2
                    size={14}
                    className="cursor-pointer text-red-400 hover:text-red-300"
                    onClick={() => update("items", form.items.filter((_, i) => i !== idx))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
        >
          Publish Theme Collection
        </button>
      </form>

      {status && (
        <div className="max-w-4xl rounded-lg bg-surface p-4 text-sm text-muted border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
