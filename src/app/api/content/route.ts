import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { articlePayloadSchema } from "@/lib/content-schema";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      items: [],
      source: "fallback",
      message: "Supabase is not configured",
    });
  }

  let query = supabase
    .from("articles_unified")
    .select("*")
    .order("updated_at", { ascending: false });

  if (slug) query = query.eq("slug", slug);
  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { items: data ?? [], source: "supabase" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: Request) {
  const clientKey = `content:${getRequestClientIp(request)}`;
  const limit = await consumeRateLimit({
    key: clientKey,
    limit: 40,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const payload = articlePayloadSchema.parse({
      ...body,
      slug: normalizeSlug(body.slug || body.title || "article"),
    });

    const record = {
      ...payload,
      slug: normalizeSlug(payload.slug),
      content_blocks: payload.content_blocks,
      tags: payload.tags,
      published_at:
        payload.status === "published"
          ? new Date().toISOString()
          : payload.status === "scheduled" && payload.schedule_publish_at
          ? payload.schedule_publish_at
          : null,
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase not configured",
          draft: record,
        },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("articles_unified")
      .upsert(record, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const revisionRecord = {
      article_slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      content_blocks: record.content_blocks,
      status: record.status,
      created_at: new Date().toISOString(),
    };

    await supabase.from("article_revisions").insert(revisionRecord);

    revalidateTag("articles-unified");
    revalidateTag(`article:${record.slug}`);
    revalidateTag(`article-related:${record.slug}`);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Backend": limit.backend,
        },
      }
    );
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
    }

    let query = supabase.from("articles_unified").delete();
    if (id) {
      query = query.eq("id", id);
    } else if (slug) {
      query = query.eq("slug", slug);
    } else {
      return NextResponse.json({ success: false, error: "Missing id or slug parameter" }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (slug) {
      revalidateTag("articles-unified");
      revalidateTag(`article:${slug}`);
      revalidateTag(`article-related:${slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

