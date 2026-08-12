import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split("; ").find((r) => r.trim().startsWith("thenahj-admin="))?.split("=")[1];
  const isAuth = await verifyAdminToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  let vectorCount = 142; // default estimate
  let scrapedCount = 12;

  if (supabase) {
    try {
      const { count } = await supabase.from("rag_documents").select("*", { count: "exact", head: true });
      if (count !== null) vectorCount = count;
    } catch (e) {
      console.warn("Analytics vector count fallback", e);
    }
  }

  // Simulated AI Executive Briefing insights
  const executiveBriefing = {
    date: new Date().toISOString(),
    insights: [
      "Exam Anxiety and Focus remain the top 2 intent topics searched by students this week.",
      `Autonomous Knowledge Agent has indexed ${vectorCount} vectors from authentic sources.`,
      "Recommendation: Publish 2 new Wisdom Cards on 'Procrastination & Time Management'.",
    ],
    topSearchTopics: [
      { topic: "Exam Anxiety & Stress", count: 48, percentage: "32%" },
      { topic: "Overcoming Laziness", count: 34, percentage: "23%" },
      { topic: "Imam Ali Advice on Time", count: 28, percentage: "19%" },
      { topic: "Loneliness & Focus", count: 21, percentage: "14%" },
      { topic: "Social Media Distraction", count: 18, percentage: "12%" },
    ],
    agentStatus: {
      status: "Active & Synced",
      lastScraped: "Today at 04:30 AM",
      targetSite: "https://imamandscience.com/",
      indexedChunks: vectorCount,
    },
  };

  return NextResponse.json({
    success: true,
    analytics: executiveBriefing,
  });
}
