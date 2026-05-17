"use client";

import { useState } from "react";
import { GraduationCap, Sparkles, Search, Calendar, Plus, Trash2 } from "lucide-react";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  reflection_questions: [] as string[],
  study_checklist: [] as string[],
  publish_date: "",
  meta_title: "",
  meta_description: "",
};

export default function StudentCornerCMSPage() {
  const [form, setForm] = useState(initialForm);
  const [questionInput, setQuestionInput] = useState("");
  const [stepInput, setStepInput] = useState("");
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

  const addQuestion = () => {
    if (questionInput.trim() && !form.reflection_questions.includes(questionInput.trim())) {
      update("reflection_questions", [...form.reflection_questions, questionInput.trim()]);
      setQuestionInput("");
    }
  };

  const addStep = () => {
    if (stepInput.trim() && !form.study_checklist.includes(stepInput.trim())) {
      update("study_checklist", [...form.study_checklist, stepInput.trim()]);
      setStepInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Publishing student corner asset...");
    setTimeout(() => {
      setStatus("Student corner asset published successfully!");
      setForm(initialForm);
    }, 700);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <GraduationCap className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Student Corner CMS</h1>
          <p className="mt-1 text-sm text-muted">Create guidance paths, spiritual study checklists, and anxiety relief resources.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Core metadata */}
          <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-muted" /> Core Settings
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Guidance Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                placeholder="e.g. Focus mantras before exam week"
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
              <span className="text-xs uppercase tracking-wider text-gold-muted">Intro Description</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={3}
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

            {/* Calendar */}
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

        {/* Dynamic Lists */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Checklist */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-muted">Spiritual Checklist Steps</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                placeholder="e.g. Read Surah Rahman for calm focus"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={addStep}
                className="rounded-xl bg-gold/25 px-4 text-xs font-semibold text-gold-light hover:bg-gold/35"
              >
                Add Step
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.study_checklist.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-background p-2.5 text-xs text-muted border border-border">
                  <span>{step}</span>
                  <Trash2
                    size={14}
                    className="cursor-pointer text-red-400 hover:text-red-300"
                    onClick={() => update("study_checklist", form.study_checklist.filter((_, i) => i !== idx))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reflection Prompts */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-muted">Student Reflection Questions</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="e.g. What is the source of my underlying worry?"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-xl bg-gold/25 px-4 text-xs font-semibold text-gold-light hover:bg-gold/35"
              >
                Add
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.reflection_questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-background p-2.5 text-xs text-muted border border-border">
                  <span>{q}</span>
                  <Trash2
                    size={14}
                    className="cursor-pointer text-red-400 hover:text-red-300"
                    onClick={() => update("reflection_questions", form.reflection_questions.filter((_, i) => i !== idx))}
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
          Publish Student Guidance Asset
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
