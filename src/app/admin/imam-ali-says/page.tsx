"use client";

import { useState } from "react";
import { Feather, Sparkles, Search, Calendar, Plus, Trash2 } from "lucide-react";

const initialForm = {
  arabic_text: "",
  english_translation: "",
  source: "",
  category: "Wisdom",
  featured_image: "",
  publish_date: "",
  meta_title: "",
  meta_description: "",
  tags: [] as string[],
};

export default function ImamAliSaysCMSPage() {
  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    update("tags", form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Publishing saying...");
    setTimeout(() => {
      setStatus("Saying published successfully!");
      setForm(initialForm);
    }, 700);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Feather className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Imam Ali Says</h1>
          <p className="mt-1 text-sm text-muted">Manage isolated short sayings, direct quotes, and source references.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info */}
          <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-muted" /> Quote details
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Arabic Text</span>
              <textarea
                value={form.arabic_text}
                onChange={(e) => update("arabic_text", e.target.value)}
                required
                rows={3}
                dir="rtl"
                placeholder="كلام الإمام علي عليه السلام..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus:border-gold/40 focus:outline-none text-right font-serif"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">English Translation</span>
              <textarea
                value={form.english_translation}
                onChange={(e) => update("english_translation", e.target.value)}
                required
                rows={3}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Source (e.g. Sermon 42, Letter 31)</span>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                  required
                  placeholder="Ghurar al-Hikam"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Main Category</span>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none text-muted"
                >
                  <option value="Wisdom">Wisdom</option>
                  <option value="Ethics">Ethics</option>
                  <option value="Self-Development">Self-Development</option>
                  <option value="Worship">Worship</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Featured Image URL</span>
              <input
                type="text"
                value={form.featured_image}
                onChange={(e) => update("featured_image", e.target.value)}
                placeholder="/backgrounds/saying-bg.jpg"
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none font-mono"
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
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>
            </div>

            {/* Scheduling Panel */}
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
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none text-muted"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic Taxonomies & Tags */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-muted">Taxonomy Tags</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. silence, greed, youth"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-xl bg-gold/25 px-4 text-xs font-semibold text-gold-light hover:bg-gold/35"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted border border-border">
                {tag}
                <Trash2
                  size={12}
                  className="cursor-pointer text-red-400 hover:text-red-300"
                  onClick={() => removeTag(tag)}
                />
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
        >
          Publish Sayings Record
        </button>
      </form>

      {status && (
        <div className="max-w-4xl rounded-lg bg-surface p-4 text-sm text-gold-light border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
