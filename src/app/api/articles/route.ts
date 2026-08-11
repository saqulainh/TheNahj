import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { verifyAdminToken } from "@/lib/auth";
import { z } from "zod";

const payloadSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  cover_image: z.string().optional(),
  seo_description: z.string().optional(),
  type: z.string().optional(),
  corner_topics: z.array(z.string()).optional(),
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
  const rl = await consumeRateLimit({ key: `articles:post:${ip}`, limit: 10, windowMs: 60000 });
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

  const slug = slugify(body.title ?? "article");

  const record = {
    slug,
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    cover_image: body.cover_image || null,
    seo_description: body.seo_description,
    type: body.type || 'reflection',
    corner_topics: body.corner_topics ?? [],
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

  const { data, error } = await supabase.from("articles").insert(record).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
