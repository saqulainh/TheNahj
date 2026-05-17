"use client";

import { useState } from "react";

const initialForm = {
  title: "",
  subtitle: "",
  category: "Wisdom",
  duration: "",
  audio_url: "",
};

const categories = ["Wisdom", "Night", "Focus", "Calm", "Student"];

export default function AudioReflectionsPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving…");

    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus(`Saved successfully.`);
      setForm(initialForm);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Audio Reflections</h1>
        <p className="mt-2 text-sm text-muted">Upload and manage audio tracks for the library.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Track Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Subtitle / Description</span>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Category</span>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Duration (e.g. 4:12)</span>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="0:00"
                className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gold-muted">Audio URL (Supabase Storage or external link)</span>
            <input
              type="text"
              value={form.audio_url}
              onChange={(e) => update("audio_url", e.target.value)}
              required
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
          >
            Add Audio Track
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
