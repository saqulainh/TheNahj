import { NextResponse } from "next/server";
import { searchDiscoveryContent } from "@/lib/discovery";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `search:get:${ip}`, limit: 30, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const section = url.searchParams.get("section");
  const limit = Number(url.searchParams.get("limit") || "12");

  if (!q.trim()) {
    return NextResponse.json({
      query: q,
      results: [],
      observability: {
        query: q,
        tokenCount: 0,
        totalCandidates: 0,
        matched: 0,
        sourceCounts: { wisdom: 0, article: 0 },
        sectionCounts: {},
        reasonCounts: {},
      },
    });
  }

  const data = await searchDiscoveryContent(q, {
    section: section || null,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 24) : 12,
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
