import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ReflectionEventType = "question_viewed" | "step_toggled" | "session_completed";

interface ReflectionEventPayload {
  articleSlug: string;
  eventType: ReflectionEventType;
  questionIndex?: number;
  stepIndex?: number;
  checked?: boolean;
  completedSteps?: number;
  totalSteps?: number;
  clientId?: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function tableMissing(message: string, code?: string) {
  return message.includes("relation") || message.includes("schema cache") || code === "PGRST204" || code === "PGRST116";
}

function parseRangeHours(url: URL): { hours: number; label: "24h" | "7d" | "30d" } {
  const raw = url.searchParams.get("range") || "7d";
  if (raw === "24h") return { hours: 24, label: "24h" };
  if (raw === "30d") return { hours: 30 * 24, label: "30d" };
  return { hours: 7 * 24, label: "7d" };
}

function calculateSummary(rows: Array<{ event_type: string; article_slug: string | null }>) {
  const completedSessions = rows.filter((row) => row.event_type === "session_completed").length;
  const uniqueArticles = new Set(rows.map((row) => row.article_slug).filter(Boolean)).size;
  const completionRatePct = rows.length > 0 ? Math.round((completedSessions / rows.length) * 100) : 0;

  return {
    periodEvents: rows.length,
    completedSessions,
    uniqueArticles,
    completionRatePct,
  };
}

function calculateDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export async function POST(request: Request) {
  const limit = await consumeRateLimit({
    key: `analytics-reflection:${getRequestClientIp(request)}`,
    limit: 120,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  let payload: ReflectionEventPayload;
  try {
    payload = (await request.json()) as ReflectionEventPayload;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.articleSlug || !payload.eventType) {
    return NextResponse.json({ success: false, error: "Missing articleSlug or eventType" }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, stored: false, reason: "supabase-not-configured" });
  }

  const record = {
    article_slug: payload.articleSlug,
    event_type: payload.eventType,
    question_index: isFiniteNumber(payload.questionIndex) ? payload.questionIndex : null,
    step_index: isFiniteNumber(payload.stepIndex) ? payload.stepIndex : null,
    checked: typeof payload.checked === "boolean" ? payload.checked : null,
    completed_steps: isFiniteNumber(payload.completedSteps) ? payload.completedSteps : null,
    total_steps: isFiniteNumber(payload.totalSteps) ? payload.totalSteps : null,
    client_id: payload.clientId || null,
    metadata: {},
  };

  const { error } = await supabase.from("reflection_analytics_events").insert(record);
  if (error) {
    if (tableMissing(error.message, error.code)) {
      return NextResponse.json({ success: true, stored: false, reason: "table-missing" });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, stored: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = parseRangeHours(url);

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      summary: {
        periodEvents: 0,
        completedSessions: 0,
        uniqueArticles: 0,
        completionRatePct: 0,
        range: range.label,
        trend: {
          periodEventsDeltaPct: 0,
          completedSessionsDeltaPct: 0,
          uniqueArticlesDeltaPct: 0,
          completionRateDeltaPct: 0,
        },
      },
      source: "fallback",
    });
  }

  const now = Date.now();
  const currentStart = new Date(now - range.hours * 60 * 60 * 1000).toISOString();
  const previousStart = new Date(now - range.hours * 2 * 60 * 60 * 1000).toISOString();
  const currentEnd = new Date(now).toISOString();

  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from("reflection_analytics_events")
      .select("event_type,article_slug")
      .gte("created_at", currentStart)
      .lte("created_at", currentEnd),
    supabase
      .from("reflection_analytics_events")
      .select("event_type,article_slug")
      .gte("created_at", previousStart)
      .lt("created_at", currentStart),
  ]);

  const error = currentResult.error || previousResult.error;

  if (error) {
    if (tableMissing(error.message, error.code)) {
      return NextResponse.json({
        success: true,
        summary: {
          periodEvents: 0,
          completedSessions: 0,
          uniqueArticles: 0,
          completionRatePct: 0,
          range: range.label,
          trend: {
            periodEventsDeltaPct: 0,
            completedSessionsDeltaPct: 0,
            uniqueArticlesDeltaPct: 0,
            completionRateDeltaPct: 0,
          },
        },
        source: "table-missing",
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const currentSummary = calculateSummary(currentResult.data || []);
  const previousSummary = calculateSummary(previousResult.data || []);

  return NextResponse.json({
    success: true,
    summary: {
      ...currentSummary,
      range: range.label,
      trend: {
        periodEventsDeltaPct: calculateDeltaPct(currentSummary.periodEvents, previousSummary.periodEvents),
        completedSessionsDeltaPct: calculateDeltaPct(currentSummary.completedSessions, previousSummary.completedSessions),
        uniqueArticlesDeltaPct: calculateDeltaPct(currentSummary.uniqueArticles, previousSummary.uniqueArticles),
        completionRateDeltaPct: calculateDeltaPct(currentSummary.completionRatePct, previousSummary.completionRatePct),
      },
    },
    source: "supabase",
  });
}
