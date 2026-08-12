import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const LOCAL_DATA_PATH = path.join(process.cwd(), "src", "data", "local_wisdom.json");

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
    const token = match ? match[1] : null;

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
    }

    const body = await request.json();

    const newRecord = {
      id: body.slug || `wisdom-${Date.now()}`,
      slug: body.slug || `wisdom-${Date.now()}`,
      title: body.title || "Untitled Wisdom",
      arabic_text: body.arabic_text || "",
      urdu_translation: body.urdu_translation || "",
      english_translation: body.english_translation || "",
      source: body.source || "Nahjul Balagha",
      source_number: body.source_number || "",
      book_name: body.book_name || "Nahjul Balagha",
      category_id: body.category_id || "youth",
      excerpt: body.master_card_json?.basicInfo?.excerpt || body.english_translation,
      master_card_json: body.master_card_json || null,
      status: "published",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    let savedToSupabase = false;

    // 1. Save to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("wisdom_cards").upsert(
          {
            slug: newRecord.slug,
            arabic_text: newRecord.arabic_text,
            urdu_translation: newRecord.urdu_translation,
            english_translation: newRecord.english_translation,
            source: newRecord.source,
            status: "published",
            metadata: newRecord.master_card_json,
          },
          { onConflict: "slug" }
        );

        if (!error) {
          savedToSupabase = true;
        }
      } catch (sbErr) {
        console.warn("[Admin Wisdom API] Supabase write failed, writing locally:", sbErr);
      }
    }

    // 2. Always persist locally in src/data/local_wisdom.json as fallback / backup
    try {
      let existingData: any[] = [];
      try {
        const fileContent = await fs.readFile(LOCAL_DATA_PATH, "utf-8");
        existingData = JSON.parse(fileContent);
      } catch (e) {
        existingData = [];
      }

      // Filter out duplicate slug if existing
      const filtered = existingData.filter((item: any) => item.slug !== newRecord.slug);
      filtered.unshift(newRecord);

      await fs.writeFile(LOCAL_DATA_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("[Admin Wisdom API] Local JSON write failed:", fsErr);
    }

    return NextResponse.json({
      success: true,
      savedToSupabase,
      message: savedToSupabase
        ? "Published live to Supabase database!"
        : "Published live to local JSON storage (src/data/local_wisdom.json)!",
      data: newRecord,
    });
  } catch (error: any) {
    console.error("[Admin Wisdom API Error]", error);
    return NextResponse.json({ error: error.message || "Failed to publish wisdom card" }, { status: 500 });
  }
}
