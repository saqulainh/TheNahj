"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, Search, Calendar, Layers } from "lucide-react";

const initialForm = {
  type: "sermon", // sermon, letter, saying
  index_number: "",
  title: "",
  slug: "",
  historical_context: "",
  arabic_text: "",
  english_translation: "",
  urdu_translation: "",
  meta_title: "",
  meta_description: "",
  publish_date: "",
};

export default function NahjulBalaghaCMSPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slug) {
        next.slug = `nb-${f.type}-${f.index_number}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Publishing Nahjul Balagha record...");
    setTimeout(() => {
      setStatus("Nahjul Balagha node published successfully!");
      setForm(initialForm);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <MessageSquare className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Nahjul Balagha CMS</h1>
          <p className="mt-1 text-sm text-muted">Complete creation suite for Sermons, Letters, and Sayings of Imam Ali (AS).</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info */}
          <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold-muted" /> Node Context
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Record Type</span>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none text-muted"
                >
                  <option value="sermon">Sermon (Khutbah)</option>
                  <option value="letter">Letter (Maktoub)</option>
                  <option value="saying">Saying (Hikmah)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Index Number</span>
                <input
                  type="number"
                  value={form.index_number}
                  onChange={(e) => update("index_number", e.target.value)}
                  required
                  placeholder="e.g. 31"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Refined Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                placeholder="e.g. Advice to his son Hassan (AS)"
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">System Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none font-mono"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Historical Context / Commentary</span>
              <textarea
                value={form.historical_context}
                onChange={(e) => update("historical_context", e.target.value)}
                rows={3}
                placeholder="Spoken after the Battle of Siffin..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>

          {/* Texts & Translations */}
          <div className="space-y-6">
            {/* Arabic Script */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-muted" /> Original Arabic Script
              </h2>
              <textarea
                value={form.arabic_text}
                onChange={(e) => update("arabic_text", e.target.value)}
                required
                rows={4}
                dir="rtl"
                placeholder="الْحَمْدُ لِلَّهِ الَّذِي..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus:border-gold/40 focus:outline-none text-right font-serif"
              />
            </div>

            {/* English & Urdu Translations */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-gold-muted" /> Translations
              </h2>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">English Translation</span>
                <textarea
                  value={form.english_translation}
                  onChange={(e) => update("english_translation", e.target.value)}
                  required
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-gold/40 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">Urdu Translation</span>
                <textarea
                  value={form.urdu_translation}
                  onChange={(e) => update("urdu_translation", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-gold/40 focus:outline-none text-right font-serif"
                />
              </label>
            </div>
          </div>
        </div>

        {/* SEO & Publishing Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* SEO Panel */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
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

          {/* Scheduling Panel */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
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

        <button
          type="submit"
          className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
        >
          Publish Nahjul Balagha Record
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
