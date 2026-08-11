import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { verifyAdminToken } from "@/lib/auth";
import { z } from "zod";

const payloadSchema = z.object({
  arabic_text: z.string().min(1),
  urdu_translation: z.string().min(1),
  english_translation: z.string().min(1),
  short_reflection: z.string().optional(),
  deep_reflection: z.string().optional(),
  simple_meaning: z.string().optional(),
  why_today: z.string().optional(),
  reflection_questions: z.array(z.string()).optional(),
  action_steps: z.array(z.string()).optional(),
  source: z.string().optional(),
  category_id: z.string().optional(),
  audio_url: z.string().optional(),
  featured_image: z.string().optional(),
  background_type: z.string().optional(),
  background_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  corner_topics: z.array(z.string()).optional(),
  related_slugs: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `wisdom:post:${ip}`, limit: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  const isValid = await verifyAdminToken(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json();
  const validation = payloadSchema.safeParse(rawBody);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid payload", details: validation.error.format() }, { status: 400 });
  }

  const body = validation.data;

  const slug = slugify(body.english_translation ?? body.arabic_text ?? "wisdom");

  const record = {
    slug,
    arabic_text: body.arabic_text,
    urdu_translation: body.urdu_translation,
    english_translation: body.english_translation,
    short_reflection: body.short_reflection,
    deep_reflection: body.deep_reflection,
    simple_meaning: body.simple_meaning || null,
    why_today: body.why_today || null,
    reflection_questions: body.reflection_questions ?? [],
    source: body.source,
    category_id: body.category_id,
    action_steps: body.action_steps ?? [],
    tags: body.tags ?? [],
    corner_topics: body.corner_topics ?? [],
    featured: Boolean(body.featured),
    trending: Boolean(body.trending),
    featured_image: body.featured_image || null,
    background_type: body.background_type || 'cinematic',
    background_url: body.background_url || body.featured_image || null,
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

  const { data, error } = await supabase.from("wisdom").insert(record).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
