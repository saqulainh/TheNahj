import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ReflectionEventType = "question_viewed" | "step_toggled" | "session_completed";

interface ReflectionEventPayload {
  articleSlug: string;
  eventType: ReflectionEventType;
  questionIndex?: number | null;
  stepIndex?: number | null;
  checked?: boolean | null;
  completedSteps?: number | null;
  totalSteps?: number | null;
  clientId?: string | null;
  metadata?: Record<string, unknown> | null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function tableMissing(message: string, code?: string) {
  return message.includes("relation") || message.includes("schema cache") || code === "PGRST204" || code === "PGRST116";
}

export async function POST(request: Request) {
  const limit = await consumeRateLimit({
    key: `analytics-reflection-bulk:${getRequestClientIp(request)}`,
    limit: 60,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ success: false, error: "Expected array of events" }, { status: 400 });
  }

  const raw = body as ReflectionEventPayload[];
  if (raw.length === 0) return NextResponse.json({ success: true, inserted: 0 });
  if (raw.length > 500) return NextResponse.json({ success: false, error: "Too many events" }, { status: 400 });

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, inserted: 0, reason: "supabase-not-configured" });
  }

  const records = raw
    .map((r) => {
      if (!r || typeof r.articleSlug !== "string" || !r.articleSlug) return null;
      if (!r.eventType || typeof r.eventType !== "string") return null;
      return {
        article_slug: r.articleSlug,
        event_type: r.eventType,
        question_index: isFiniteNumber(r.questionIndex) ? r.questionIndex : null,
        step_index: isFiniteNumber(r.stepIndex) ? r.stepIndex : null,
        checked: typeof r.checked === "boolean" ? r.checked : null,
        completed_steps: isFiniteNumber(r.completedSteps) ? r.completedSteps : null,
        total_steps: isFiniteNumber(r.totalSteps) ? r.totalSteps : null,
        client_id: typeof r.clientId === "string" ? r.clientId : null,
        metadata: r.metadata ?? {},
      };
    })
    .filter(Boolean) as Record<string, unknown>[];

  if (records.length === 0) return NextResponse.json({ success: true, inserted: 0 });

  const { error, data } = await supabase.from("reflection_analytics_events").insert(records);
  if (error) {
    if (tableMissing(error.message, error.code)) {
      return NextResponse.json({ success: true, inserted: 0, reason: "table-missing" });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: Array.isArray(data) ? data.length : records.length });
}
