"use client";

import { useState } from "react";
import { studentTopics, youthTopics } from "@/data/mock";

const topicOptions = [
  ...studentTopics.map((t) => ({ slug: t.slug, label: `Student: ${t.title}` })),
  ...youthTopics.map((t) => ({ slug: t.slug, label: `Youth: ${t.title}` })),
];

const articleTypes = ["reflection", "story", "student", "youth", "self-improvement", "wisdom"];

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  seo_description: "",
  type: "reflection",
  corner_topics: [] as string[],
};

export default function ArticlesPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string | string[]) => {
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
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus(`Saved. Live at /articles/${data.data?.slug ?? "(check Supabase)"}`);
      setForm(initialForm);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
      console.log("Article draft:", form);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Articles</h1>
        <p className="mt-2 text-sm text-muted">Create and manage your articles and long-form reflections.</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Excerpt</span>
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              required
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Content (Markdown/HTML supported)</span>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              required
              rows={10}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none font-mono text-xs"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Article Type</span>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              >
                {articleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Cover Image URL</span>
              <input
                type="text"
                value={form.cover_image}
                onChange={(e) => update("cover_image", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                placeholder="/images/..."
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">SEO Description</span>
            <input
              type="text"
              value={form.seo_description}
              onChange={(e) => update("seo_description", e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
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

          <button
            type="submit"
            className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
          >
            Publish Article
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
