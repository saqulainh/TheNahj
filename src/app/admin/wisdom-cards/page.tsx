"use client";

import { useState } from "react";
import { categories, studentTopics, youthTopics } from "@/data/mock";

const topicOptions = [
  ...studentTopics.map((t) => ({ slug: t.slug, label: `Student: ${t.title}` })),
  ...youthTopics.map((t) => ({ slug: t.slug, label: `Youth: ${t.title}` })),
];

const initialForm = {
  arabic_text: "",
  urdu_translation: "",
  english_translation: "",
  category_id: categories[0]?.id ?? "",
  source: "",
  short_reflection: "",
  deep_reflection: "",
  simple_meaning: "",
  why_today: "",
  reflection_questions: "",
  action_steps: "",
  tags: "",
  corner_topics: [] as string[],
  featured: false,
  trending: false,
};

export default function WisdomCardsPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string | boolean | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleTopic = (slug: string) => {
    setForm((f) => ({
      ...f,
      corner_topics: f.corner_topics.includes(slug)
        ? f.corner_topics.filter((s) => s !== slug)
        : [...f.corner_topics, slug],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving…");

    try {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          action_steps: form.action_steps.split("\\n").filter(Boolean),
          reflection_questions: form.reflection_questions.split("\\n").filter(Boolean),
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus(`Saved. Live at /wisdom/${data.data?.slug ?? "(check Supabase)"}`);
      setForm(initialForm);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
      console.log("Wisdom draft:", form);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Wisdom Cards</h1>
        <p className="mt-2 text-sm text-muted">Create and manage wisdom cards, reflections, and assignments.</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {(
              [
                ["arabic_text", "Arabic text", "textarea"],
                ["urdu_translation", "Urdu translation", "textarea"],
                ["english_translation", "English translation", "textarea"],
                ["source", "Source", "input"],
                ["short_reflection", "Short reflection", "textarea"],
              ] as const
            ).map(([key, label, type]) => (
              <label key={key} className={`block ${key === "source" ? "col-span-full" : ""}`}>
                <span className="text-xs uppercase tracking-wider text-gold-muted">{label}</span>
                {type === "textarea" ? (
                  <textarea
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => update(key, e.target.value)}
                    required={!["action_steps", "tags", "reflection_questions", "simple_meaning", "why_today"].includes(key)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => update(key, e.target.value)}
                    required={!["action_steps", "tags", "reflection_questions", "simple_meaning", "why_today"].includes(key)}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                  />
                )}
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Deep reflection</span>
            <textarea
              value={form.deep_reflection}
              onChange={(e) => update("deep_reflection", e.target.value)}
              required
              rows={6}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
             {(
              [
                ["simple_meaning", "Simple meaning"],
                ["why_today", "Why this matters today"],
                ["reflection_questions", "Reflection questions (one per line)"],
                ["action_steps", "Action steps (one per line)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">{label}</span>
                <textarea
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => update(key, e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Tags (comma separated)</span>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Category</span>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="rounded-xl border border-border bg-surface p-4">
            <legend className="px-2 text-xs uppercase tracking-wider text-gold-muted">
              Corner topics (student / youth pages)
            </legend>
            <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {topicOptions.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleTopic(t.slug)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    form.corner_topics.includes(t.slug)
                      ? "bg-gold/20 text-gold-light"
                      : "bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-6 rounded-xl border border-border bg-surface p-4">
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-gold-light focus:ring-gold/40 focus:ring-offset-background"
              />
              Featured on home
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.trending}
                onChange={(e) => update("trending", e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-gold-light focus:ring-gold/40 focus:ring-offset-background"
              />
              Trending
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
          >
            Publish Wisdom
          </button>
        </form>

        {status && (
          <div className="mt-6 rounded-lg bg-surface p-4 text-sm text-muted border border-border">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
