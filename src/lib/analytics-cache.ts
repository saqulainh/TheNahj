import type { ReflectionSummary, TrendData } from "@/lib/types";

interface ReflectionSummaryWithRange extends ReflectionSummary {
  range: "24h" | "7d" | "30d";
  trend: TrendData;
  sparklineEvents: number[];
  topPracticedArticles: Array<{ articleSlug: string; articleTitle: string; events: number; completedSessions: number }>;
}

const CACHE = new Map<string, { ts: number; payload: ReflectionSummaryWithRange }>();
const TTL_MS = 30_000;

export function getCachedSummary(key: string) {
  try {
    const entry = CACHE.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL_MS) {
      CACHE.delete(key);
      return null;
    }
    return entry.payload;
  } catch {
    return null;
  }
}

export function setCachedSummary(key: string, payload: ReflectionSummary) {
  try {
    CACHE.set(key, { ts: Date.now(), payload });
  } catch {
    // ignore
  }
}

export function clearSummaryCache() {
  try {
    CACHE.clear();
  } catch {
    // ignore
  }
}
