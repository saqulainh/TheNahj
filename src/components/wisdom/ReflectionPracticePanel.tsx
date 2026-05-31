"use client";

import { useMemo, useState } from "react";

interface ReflectionPracticePanelProps {
  questions: string[];
  actionSteps: string[];
}

export function ReflectionPracticePanel({ questions, actionSteps }: ReflectionPracticePanelProps) {
  const safeQuestions = useMemo(() => questions.filter(Boolean), [questions]);
  const safeSteps = useMemo(() => actionSteps.filter(Boolean), [actionSteps]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  if (safeQuestions.length === 0 && safeSteps.length === 0) return null;

  const currentQuestion = safeQuestions[activeQuestion] || null;
  const completedCount = safeSteps.reduce((count, _, index) => (completedSteps[index] ? count + 1 : count), 0);

  return (
    <section className="rounded-[1.75rem] border border-gold/20 bg-[linear-gradient(180deg,_hsl(var(--surface-elevated)/0.9),_hsl(var(--surface)/0.7))] p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Interactive Reflection</p>
        {safeSteps.length > 0 && (
          <span className="rounded-full border border-border/20 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted">
            {completedCount}/{safeSteps.length} steps complete
          </span>
        )}
      </div>

      {currentQuestion && (
        <article className="rounded-2xl border border-border/20 bg-background/75 p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Guided Question</p>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">{currentQuestion}</p>
          {safeQuestions.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {safeQuestions.map((_, index) => (
                <button
                  key={`q-${index}`}
                  type="button"
                  onClick={() => setActiveQuestion(index)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    index === activeQuestion
                      ? "border-gold/45 bg-gold/15 text-gold-light"
                      : "border-border/25 bg-background/60 text-muted hover:border-gold/30 hover:text-gold-light"
                  }`}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          )}
        </article>
      )}

      {safeSteps.length > 0 && (
        <div className="mt-4 space-y-2">
          {safeSteps.map((step, index) => (
            <label
              key={`step-${index}`}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/20 bg-background/70 p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={Boolean(completedSteps[index])}
                onChange={(event) =>
                  setCompletedSteps((prev) => ({
                    ...prev,
                    [index]: event.target.checked,
                  }))
                }
                className="mt-0.5 h-4 w-4 rounded border-border/30 bg-background"
              />
              <span className={completedSteps[index] ? "text-muted line-through" : "text-foreground/90"}>{step}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
