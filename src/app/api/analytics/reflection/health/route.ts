import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, source: "fallback", recent: { lastEventAt: null, lastHour: 0, last24h: 0 } });
  }

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [lastRow, lastHourRes, last24hRes] = await Promise.all([
      supabase.from("reflection_analytics_events").select("created_at").order("created_at", { ascending: false }).limit(1),
      supabase.from("reflection_analytics_events").select("id", { count: "exact" }).gte("created_at", oneHourAgo),
      supabase.from("reflection_analytics_events").select("id", { count: "exact" }).gte("created_at", oneDayAgo),
    ]);

    const lastEventAt = (lastRow.data && lastRow.data[0] && lastRow.data[0].created_at) || null;
    const lastHour = typeof lastHourRes.count === "number" ? lastHourRes.count : 0;
    const last24h = typeof last24hRes.count === "number" ? last24hRes.count : 0;

    return NextResponse.json({ success: true, source: "supabase", recent: { lastEventAt, lastHour, last24h } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
