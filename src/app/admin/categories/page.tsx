"use client";

import { useState } from "react";
import { FolderTree, Calendar, Search, Sparkles } from "lucide-react";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  cover_image: "",
  publish_date: "",
  expiry_date: "",
  meta_title: "",
  meta_description: "",
  schema_markup: "{}",
};

export default function CategoriesPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !f.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving…");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("Category saved successfully in database!");
      setForm(initialForm);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus(err.message ?? "Save failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <FolderTree className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Categories CMS</h1>
          <p className="mt-1 text-sm text-muted">Create taxomomies to group and organize your wisdom assets.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info */}
          <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-muted" /> Taxonomy Details
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Category Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
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

          {/* Metadata & Scheduling */}
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

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gold-muted">JSON-LD Schema Markup</span>
                <textarea
                  value={form.schema_markup}
                  onChange={(e) => update("schema_markup", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-xs focus:border-gold/40 focus:outline-none font-mono"
                />
              </label>
            </div>

            {/* Scheduling Panel */}
            <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-muted" /> Publish Schedule
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-gold-muted">Publish Date</span>
                  <input
                    type="datetime-local"
                    value={form.publish_date}
                    onChange={(e) => update("publish_date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-gold-muted">Expiry Date</span>
                  <input
                    type="datetime-local"
                    value={form.expiry_date}
                    onChange={(e) => update("expiry_date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
        >
          Publish Taxonomy Group
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
