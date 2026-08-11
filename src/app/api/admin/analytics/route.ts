import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getMockData() {
  return {
    success: true,
    data: {
      overview: {
        totalViews: 12847,
        totalShares: 934,
        totalSearches: 2183,
        totalSaves: 741,
        viewsDelta: 18,
        sharesDelta: 12,
      },
      topContent: [
        { slug: "patience-in-hardship", title: "On Patience in Times of Hardship", views: 1423, shares: 87, section: "Imam Ali Says" },
        { slug: "knowledge-and-wisdom", title: "The Difference Between Knowledge and Wisdom", views: 998, shares: 63, section: "Nahjul Balagha" },
        { slug: "exam-stress-faith", title: "Dealing with Exam Stress Through Faith", views: 854, shares: 41, section: "Student Corner" },
      ],
      searchTerms: [
        { term: "sabr", count: 342, language: "ur" },
        { term: "patience", count: 289, language: "en" },
        { term: "صبر", count: 198, language: "ar" },
      ],
      dailyViews: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en", { weekday: "short" }),
        views: 800 + Math.floor(Math.random() * 1200),
      })),
      sectionBreakdown: [
        { section: "Imam Ali Says", count: 4823, percentage: 38 },
        { section: "Youth Corner", count: 3214, percentage: 25 },
        { section: "Student Corner", count: 2569, percentage: 20 },
        { section: "Nahjul Balagha", count: 1926, percentage: 15 },
        { section: "Audio", count: 315, percentage: 2 },
      ],
    },
  };
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";

  // If Supabase is not configured, return mock data
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(getMockData());
  }

  try {
    // Build date filter based on range
    const rangeMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = rangeMap[range] || 7;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Fetch view events from analytics_events table (if it exists)
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_type, target_slug, target_section, created_at, search_term, search_lang")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (eventsError || !events) {
      // Table doesn't exist yet, return mock
      return NextResponse.json(getMockData());
    }

    // Process events
    const views = events.filter((e) => e.event_type === "view");
    const shares = events.filter((e) => e.event_type === "share");
    const searches = events.filter((e) => e.event_type === "search");
    const saves = events.filter((e) => e.event_type === "save");

    // Top content
    const contentMap: Record<string, { slug: string; title: string; views: number; shares: number; section: string }> = {};
    for (const e of views) {
      if (!e.target_slug) continue;
      if (!contentMap[e.target_slug]) {
        contentMap[e.target_slug] = { slug: e.target_slug, title: e.target_slug, views: 0, shares: 0, section: e.target_section || "General" };
      }
      contentMap[e.target_slug].views++;
    }
    for (const e of shares) {
      if (!e.target_slug || !contentMap[e.target_slug]) continue;
      contentMap[e.target_slug].shares++;
    }

    const topContent = Object.values(contentMap)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Search terms
    const termMap: Record<string, { term: string; count: number; language: string }> = {};
    for (const e of searches) {
      if (!e.search_term) continue;
      const key = e.search_term.toLowerCase();
      if (!termMap[key]) termMap[key] = { term: e.search_term, count: 0, language: e.search_lang || "en" };
      termMap[key].count++;
    }
    const searchTerms = Object.values(termMap).sort((a, b) => b.count - a.count).slice(0, 6);

    // Daily views
    const dayMap: Record<string, number> = {};
    for (const e of views) {
      const day = new Date(e.created_at).toLocaleDateString("en", { weekday: "short" });
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
    const dailyViews = Object.entries(dayMap).slice(-7).map(([date, count]) => ({ date, views: count }));

    // Section breakdown
    const sectionMap: Record<string, number> = {};
    for (const e of views) {
      if (!e.target_section) continue;
      sectionMap[e.target_section] = (sectionMap[e.target_section] || 0) + 1;
    }
    const total = Object.values(sectionMap).reduce((a, b) => a + b, 0) || 1;
    const sectionBreakdown = Object.entries(sectionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([section, count]) => ({ section, count, percentage: Math.round((count / total) * 100) }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalViews: views.length,
          totalShares: shares.length,
          totalSearches: searches.length,
          totalSaves: saves.length,
          viewsDelta: null,
          sharesDelta: null,
        },
        topContent,
        searchTerms,
        dailyViews,
        sectionBreakdown,
      },
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(getMockData());
  }
}
