import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const payloadSchema = z.object({
  arabic_text: z.string().min(1),
  english_translation: z.string().min(1),
  source: z.string().optional(),
  category: z.string().optional(),
  featured_image: z.string().optional(),
  publish_date: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  background_image: z.string().optional(),
  background_type: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `imam-ali-says:post:${ip}`, limit: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json();
  const validation = payloadSchema.safeParse(rawBody);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid payload", details: validation.error.format() }, { status: 400 });
  }

  const body = validation.data;

  const slug = slugify(body.english_translation ?? body.arabic_text ?? "imam-ali-says");

  const record = {
    slug,
    arabic_text: body.arabic_text,
    english_translation: body.english_translation,
    source: body.source,
    category: body.category,
    featured_image: body.featured_image,
    publish_date: body.publish_date,
    meta_title: body.meta_title,
    meta_description: body.meta_description,
    tags: body.tags ?? [],
    background_image: body.background_image,
    background_type: body.background_type,
  };

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        draft: record,
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.from("imam_ali_says").insert(record).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}