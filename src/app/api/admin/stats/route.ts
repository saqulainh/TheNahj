import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  const fallbackActivity = [
    { action: "Published Wisdom Card", target: "Welcome to TheNahj", time: new Date().toISOString() },
  ];

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      stats: {
        wisdomCardsCount: 1,
        articlesCount: 0,
        audioReflectionsCount: 0,
        usersCount: 1,
      },
      recentActivity: fallbackActivity,
      message: "Supabase not configured. Showing fallback stats.",
    });
  }

  try {
    // 1. Total Wisdom Cards: category is one of the wisdom corner types and status is published
    const { count: wisdomCardsCount, error: wisdomError } = await supabase
      .from("articles_unified")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .in("category", ["Imam Ali Says", "Student Corner", "Youth Corner", "Nahjul Balagha"]);

    if (wisdomError) throw wisdomError;

    // 2. Articles Published: category is Articles and status is published
    const { count: articlesCount, error: articlesError } = await supabase
      .from("articles_unified")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("category", "Articles");

    if (articlesError) throw articlesError;

    // 3. Audio Reflections: category is Audio Reflections and status is published
    const { count: audioReflectionsCount, error: audioError } = await supabase
      .from("articles_unified")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("category", "Audio Reflections");

    if (audioError) throw audioError;

    // 4. Total Users: count unique user_ids from bookmarks and reflections
    const { data: bookmarkedUsers } = await supabase.from("bookmarks").select("user_id");
    const { data: reflectionUsers } = await supabase.from("reflections").select("user_id");
    const { data: savedWisdomUsers } = await supabase.from("saved_wisdom").select("user_id");

    const uniqueUsers = new Set<string>();
    bookmarkedUsers?.forEach((u) => u.user_id && uniqueUsers.add(u.user_id));
    reflectionUsers?.forEach((u) => u.user_id && uniqueUsers.add(u.user_id));
    savedWisdomUsers?.forEach((u) => u.user_id && uniqueUsers.add(u.user_id));

    // Ensure we count at least 1 (the admin themselves)
    const usersCount = Math.max(1, uniqueUsers.size);

    // 5. Recent Activity: fetch top 4 recently updated articles
    const { data: recentItems } = await supabase
      .from("articles_unified")
      .select("title, category, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(4);

    const recentActivity = (recentItems || []).map((item) => {
      const isDraft = item.status === "draft";
      const isScheduled = item.status === "scheduled";
      const action = isDraft
        ? `Saved Draft (${item.category})`
        : isScheduled
        ? `Scheduled (${item.category})`
        : `Published (${item.category})`;

      return {
        action,
        target: item.title,
        time: item.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        wisdomCardsCount: wisdomCardsCount || 0,
        articlesCount: articlesCount || 0,
        audioReflectionsCount: audioReflectionsCount || 0,
        usersCount,
      },
      recentActivity: recentActivity.length ? recentActivity : fallbackActivity,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database query failed",
      },
      { status: 500 }
    );
  }
}
