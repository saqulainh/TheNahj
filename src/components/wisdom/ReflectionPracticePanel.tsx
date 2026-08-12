"use client";

import { useEffect, useMemo, useState } from "react";
import { AITranslatedText } from "@/components/ui/AITranslatedText";

interface ReflectionPracticePanelProps {
  articleSlug: string;
  questions: string[];
  actionSteps: string[];
}

function buildKey(articleSlug: string) {
  return `thenahj-reflection-practice:${articleSlug}`;
}

function getClientId() {
  const key = "thenahj-client-id";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, next);
    return next;
  } catch {
    return "anonymous";
  }
}

function sendReflectionEvent(payload: {
  articleSlug: string;
  eventType: "question_viewed" | "step_toggled" | "session_completed";
  questionIndex?: number;
  stepIndex?: number;
  checked?: boolean;
  completedSteps?: number;
  totalSteps?: number;
}) {
  // enqueue for reliable delivery from the client-side queue
  try {
    enqueueEvent({
      ...payload,
      clientId: getClientId(),
      ts: Date.now(),
    });
  } catch {
    // fallback to best-effort immediate send
    const body = JSON.stringify({
      ...payload,
      clientId: getClientId(),
    });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/reflection", blob);
      return;
    }
    fetch("/api/analytics/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }
}

// --- client-side event queue -------------------------------------------------
const QUEUE_KEY = "thenahj-reflection-events-queue";

type QueuedEvent = Record<string, unknown> & { ts: number };

function readQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as QueuedEvent[];
  } catch {
    // ignore
  }
  return [];
}

function writeQueue(items: QueuedEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      while (items.length > 0) {
        items.splice(0, Math.ceil(items.length / 2));
        try {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
          break;
        } catch {
          continue;
        }
      }
    }
  }
}

function enqueueEvent(ev: QueuedEvent) {
  const items = readQueue();
  items.push(ev);
  if (items.length > 200) items.splice(0, items.length - 200);
  writeQueue(items);
}

async function sendSingleEvent(ev: QueuedEvent) {
  try {
    const res = await fetch("/api/analytics/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function flushQueue() {
  try {
    const items = readQueue();
    if (items.length === 0) return;
    const remaining: QueuedEvent[] = [];
    for (const it of items) {
      const ok = await sendSingleEvent(it);
      if (!ok) remaining.push(it);
    }
    writeQueue(remaining);
  } catch {
    // ignore
  }
}

type NavigatorWithBeacon = Navigator & {
  sendBeacon?: (url: string, data: unknown) => boolean;
};

function beaconFlush() {
  try {
    const items = readQueue();
    if (items.length === 0) return;
    const nav = navigator as NavigatorWithBeacon;
    // try to send each event with sendBeacon (best-effort)
    if (typeof nav.sendBeacon === "function") {
      items.forEach((it) => {
        try {
          const blob = new Blob([JSON.stringify(it)], { type: "application/json" });
          nav.sendBeacon("/api/analytics/reflection", blob);
        } catch {
          // ignore per-item failure
        }
      });
      // we can't reliably know what succeeded, so clear local queue to avoid duplicates
      writeQueue([]);
    }
  } catch {
    // ignore
  }
}

export function ReflectionPracticePanel({ articleSlug, questions, actionSteps }: ReflectionPracticePanelProps) {
  const safeQuestions = useMemo(() => questions.filter(Boolean), [questions]);
  const safeSteps = useMemo(() => actionSteps.filter(Boolean), [actionSteps]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(buildKey(articleSlug));
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        activeQuestion?: number;
        completedSteps?: Record<number, boolean>;
      };

      if (typeof parsed.activeQuestion === "number" && Number.isFinite(parsed.activeQuestion)) {
        setActiveQuestion(Math.max(0, Math.min(parsed.activeQuestion, Math.max(0, safeQuestions.length - 1))));
      }

      if (parsed.completedSteps && typeof parsed.completedSteps === "object") {
        const allowedIndexes = new Set(safeSteps.map((_, index) => index));
        const sanitized: Record<number, boolean> = {};
        Object.entries(parsed.completedSteps).forEach(([key, value]) => {
          const index = Number(key);
          if (allowedIndexes.has(index) && value === true) sanitized[index] = true;
        });
        setCompletedSteps(sanitized);
      }
    } catch {
      // Ignore invalid cached state.
    }
  }, [articleSlug, safeQuestions.length, safeSteps]);

  useEffect(() => {
    try {
      const payload = JSON.stringify({
        activeQuestion,
        completedSteps,
      });
      localStorage.setItem(buildKey(articleSlug), payload);
    } catch {
      // Ignore storage failures (private mode/quota).
    }
  }, [articleSlug, activeQuestion, completedSteps]);

  useEffect(() => {
    if (activeQuestion > safeQuestions.length - 1) {
      setActiveQuestion(Math.max(0, safeQuestions.length - 1));
    }
  }, [activeQuestion, safeQuestions.length]);

// Periodically flush queued events and flush on page hide/unload
 useEffect(() => {
    // try a flush on mount
    flushQueue().catch(() => undefined);

    const intervalId = setInterval(() => {
      flushQueue().catch(() => undefined);
    }, 15_000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        beaconFlush();
      }
    };

    const handlePageHide = () => {
      beaconFlush();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [safeQuestions.length, safeSteps.length]);

  const currentQuestion = safeQuestions[activeQuestion] || null;
  const completedCount = safeSteps.reduce((count, _, index) => (completedSteps[index] ? count + 1 : count), 0);

  useEffect(() => {
    if (currentQuestion) {
      sendReflectionEvent({
        articleSlug,
        eventType: "question_viewed",
        questionIndex: activeQuestion,
        completedSteps: completedCount,
        totalSteps: safeSteps.length,
      });
    }
  }, [activeQuestion, articleSlug, currentQuestion, completedCount, safeSteps.length]);

  useEffect(() => {
    if (safeSteps.length > 0 && completedCount === safeSteps.length) {
      sendReflectionEvent({
        articleSlug,
        eventType: "session_completed",
        completedSteps: completedCount,
        totalSteps: safeSteps.length,
      });
    }
  }, [articleSlug, completedCount, safeSteps.length]);

  if (safeQuestions.length === 0 && safeSteps.length === 0) {
    return null;
  }

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
          <p className="mt-3 text-base leading-relaxed text-foreground/90" dir="auto">
            <AITranslatedText text={currentQuestion} />
          </p>
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
                onChange={(event) => {
                  const checked = event.target.checked;
                  setCompletedSteps((prev) => {
                    const next = {
                      ...prev,
                      [index]: checked,
                    };
                    const nextCompletedCount = safeSteps.reduce(
                      (count, _, stepIndex) => (next[stepIndex] ? count + 1 : count),
                      0
                    );
                    sendReflectionEvent({
                      articleSlug,
                      eventType: "step_toggled",
                      stepIndex: index,
                      checked,
                      completedSteps: nextCompletedCount,
                      totalSteps: safeSteps.length,
                    });
                    return next;
                  });
                }}
                className="mt-0.5 h-4 w-4 rounded border-border/30 bg-background"
              />
              <span className={completedSteps[index] ? "text-muted line-through" : "text-foreground/90"}>
                <AITranslatedText text={step} />
              </span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
