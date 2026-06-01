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

function buildSparklineEvents(rows: Array<{ created_at?: string | null }>, startMs: number, rangeMs: number, bucketCount = 7) {
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const bucketSizeMs = rangeMs / bucketCount;

  rows.forEach((row) => {
    if (!row.created_at) return;
    const timestamp = new Date(row.created_at).getTime();
    if (!Number.isFinite(timestamp)) return;
    const relative = timestamp - startMs;
    if (relative < 0 || relative > rangeMs) return;
    const index = Math.min(bucketCount - 1, Math.max(0, Math.floor(relative / bucketSizeMs)));
    buckets[index] += 1;
  });

  return buckets;
}

function emptySparklineEvents() {
  return Array.from({ length: 7 }, () => 0);
}

function buildTopPracticedArticles(rows: Array<{ article_slug?: string | null; event_type?: string | null }>, limit = 5) {
  const map = new Map<string, { articleSlug: string; events: number; completedSessions: number }>();

  rows.forEach((row) => {
    const articleSlug = row.article_slug?.trim();
    if (!articleSlug) return;

    const existing = map.get(articleSlug) ?? { articleSlug, events: 0, completedSessions: 0 };
    existing.events += 1;
    if (row.event_type === "session_completed") {
      existing.completedSessions += 1;
    }
    map.set(articleSlug, existing);
  });

  return Array.from(map.values())
    .sort((left, right) => {
      if (right.events !== left.events) return right.events - left.events;
      if (right.completedSessions !== left.completedSessions) return right.completedSessions - left.completedSessions;
      return left.articleSlug.localeCompare(right.articleSlug);
    })
    .slice(0, limit);
}

async function fetchArticleTitles(slugs: string[]) {
  if (!supabase || slugs.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("articles_unified")
    .select("slug,title")
    .in("slug", slugs);

  if (error || !data) return new Map<string, string>();

  const map = new Map<string, string>();
  data.forEach((row) => {
    if (row.slug && row.title) {
      map.set(row.slug, row.title);
    }
  });
  return map;
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

// Simple in-memory cache for summary responses (short TTL)
const SUMMARY_CACHE = new Map<string, { ts: number; payload: any }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = parseRangeHours(url);

  // Return cached response when available
  const cached = SUMMARY_CACHE.get(range.label);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, summary: cached.payload, source: "cache" });
  }

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
        sparklineEvents: emptySparklineEvents(),
        topPracticedArticles: [],
      },
      source: "fallback",
    });
  }

  const now = Date.now();
  const rangeMs = range.hours * 60 * 60 * 1000;
  const currentStartMs = now - rangeMs;
  const currentStart = new Date(now - range.hours * 60 * 60 * 1000).toISOString();
  const previousStart = new Date(now - range.hours * 2 * 60 * 60 * 1000).toISOString();
  const currentEnd = new Date(now).toISOString();

  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from("reflection_analytics_events")
      .select("event_type,article_slug,created_at")
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
          sparklineEvents: emptySparklineEvents(),
          topPracticedArticles: [],
        },
        source: "table-missing",
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const currentSummary = calculateSummary(currentResult.data || []);
  const previousSummary = calculateSummary(previousResult.data || []);
  const sparklineEvents = buildSparklineEvents(currentResult.data || [], currentStartMs, rangeMs);
  const topPracticedArticles = buildTopPracticedArticles(currentResult.data || []);
  const titleMap = await fetchArticleTitles(topPracticedArticles.map((item) => item.articleSlug));
  const topPracticedArticlesWithTitles = topPracticedArticles.map((item) => ({
    ...item,
    articleTitle: titleMap.get(item.articleSlug) ?? item.articleSlug,
  }));

  const summaryPayload = {
    ...currentSummary,
    range: range.label,
    trend: {
      periodEventsDeltaPct: calculateDeltaPct(currentSummary.periodEvents, previousSummary.periodEvents),
      completedSessionsDeltaPct: calculateDeltaPct(currentSummary.completedSessions, previousSummary.completedSessions),
      uniqueArticlesDeltaPct: calculateDeltaPct(currentSummary.uniqueArticles, previousSummary.uniqueArticles),
      completionRateDeltaPct: calculateDeltaPct(currentSummary.completionRatePct, previousSummary.completionRatePct),
    },
    sparklineEvents,
    topPracticedArticles: topPracticedArticlesWithTitles,
  };

  // cache the computed payload for a short time
  try {
    SUMMARY_CACHE.set(range.label, { ts: Date.now(), payload: summaryPayload });
  } catch {
    // ignore cache errors
  }

  return NextResponse.json({ success: true, summary: summaryPayload, source: "supabase" });
}
