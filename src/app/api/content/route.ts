import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { articlePayloadSchema } from "@/lib/content-schema";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { SECTION_TAXONOMY, inferThemeTopicFromTagsForSection, isValidSectionThemeTopic, normalizeThemeForSection, normalizeTopicForSection, uniqueTagsWithTaxonomy } from "@/lib/taxonomy";
import { deleteWisdomCardProjection, syncWisdomCardProjection } from "@/lib/wisdom-card-projection";

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

  try {
    let query = supabase
      .from("articles_unified")
      .select("*")
      .order("updated_at", { ascending: false });

    if (slug) query = query.eq("slug", slug);
    if (category) query = query.eq("category", category);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query;

    if (error) {
      // Table may not exist yet — return empty gracefully
      if (error.message.includes("Invalid path") || error.message.includes("relation") || error.message.includes("schema cache") || error.code === "PGRST204" || error.code === "PGRST116") {
        return NextResponse.json({
          items: [],
          source: "supabase",
          message: "Table not found — run the migration to create articles_unified.",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enrichedItems = (data ?? []).map((item) => {
      const section = item.category;
      const { theme, topic } = inferThemeTopicFromTagsForSection(section, item.tags || []);
      return {
        ...item,
        theme,
        topic,
      };
    });

    return NextResponse.json(
      { items: enrichedItems, source: "supabase" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({
      items: [],
      source: "error",
      message: err instanceof Error ? err.message : "Unexpected error",
    });
  }
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

    function normalizePoint(v: unknown) {
      if (v === null || v === undefined) return null;
      // Accept JSON-stringified objects too
      if (typeof v === "string") {
        try {
          v = JSON.parse(v);
        } catch {
          return null;
        }
      }
      if (typeof v === "object" && v !== null) {
        const obj = v as Record<string, unknown>;
        const x = Number(obj.x);
        const y = Number(obj.y);
        if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
      }
      return null;
    }

    const normalized = {
      ...body,
      hero_focal_point: normalizePoint(body.hero_focal_point),
      featured_focal_point: normalizePoint(body.featured_focal_point),
      sidebar_focal_point: normalizePoint(body.sidebar_focal_point),
      slug: normalizeSlug(body.slug || body.title || "article"),
    };

    // Backwards-compat: migrate legacy `narration` field to new `arabic`/`translation` shape
    if (Array.isArray(normalized.narrations)) {
      normalized.narrations = normalized.narrations.map((n: unknown) => {
        // If old shape used `narration` string, map it to `translation` if translation missing
        if (n && typeof n === "object") {
          const copy = { ...(n as Record<string, unknown>) };
          if (typeof copy.narration === "string" && !copy.translation && !copy.arabic) {
            copy.translation = copy.narration;
          }
          // map legacy Urdu keys to `urdu`
          if (!copy.urdu) {
            if (typeof copy.narration_urdu === "string") copy.urdu = copy.narration_urdu;
            else if (typeof copy.urdu_translation === "string") copy.urdu = copy.urdu_translation;
            else if (typeof copy.urduText === "string") copy.urdu = copy.urduText;
          }
          // remove legacy keys to keep payload clean
          delete copy.narration;
          delete copy.narration_urdu;
          delete copy.urdu_translation;
          delete copy.urduText;
          return copy;
        }
        return n;
      });
    }

    const payload = articlePayloadSchema.parse(normalized);

    const section = payload.category;
    const inferred = inferThemeTopicFromTagsForSection(section, payload.tags || []);
    const resolvedTheme = normalizeThemeForSection(section, payload.theme || inferred.theme);
    const resolvedTopic = normalizeTopicForSection(section, resolvedTheme, payload.topic || inferred.topic);

    const hasSectionTaxonomy = Boolean(SECTION_TAXONOMY[section]);
    const shouldEnforceTaxonomy = hasSectionTaxonomy && (payload.status === "published" || payload.status === "scheduled");

    if (shouldEnforceTaxonomy && !isValidSectionThemeTopic(section, resolvedTheme, resolvedTopic)) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: {
            message: "A valid Theme -> Topic mapping is required for this category.",
            category: payload.category,
            theme: payload.theme || null,
            topic: payload.topic || null,
          },
        },
        { status: 400 }
      );
    }

    const { theme: _theme, topic: _topic, audiences: _audiences, ...persistablePayload } = payload;
    const normalizedTags = uniqueTagsWithTaxonomy(persistablePayload.tags || [], resolvedTheme, resolvedTopic);

    const record = {
      ...persistablePayload,
      slug: normalizeSlug(persistablePayload.slug),
      content_blocks: persistablePayload.content_blocks,
      tags: normalizedTags,
      schedule_publish_at: persistablePayload.schedule_publish_at || null,
      published_at:
        persistablePayload.status === "published"
          ? new Date().toISOString()
          : persistablePayload.status === "scheduled" && persistablePayload.schedule_publish_at
          ? persistablePayload.schedule_publish_at
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

    let oldSlug: string | null = null;
    if (record.id && isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase
          .from("articles_unified")
          .select("slug")
          .eq("id", record.id)
          .maybeSingle();
        if (existing && existing.slug !== record.slug) {
          oldSlug = existing.slug;
        }
      } catch {
        // ignore errors querying existing
      }
    }

    const conflictTarget = record.id ? "id" : "slug";
    const { data, error } = await supabase
      .from("articles_unified")
      .upsert(record, { onConflict: conflictTarget })
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

    try {
      if (oldSlug) {
        await deleteWisdomCardProjection(oldSlug);
      }
      await syncWisdomCardProjection(data as Record<string, unknown>);
    } catch {
      // Wisdom card projection is best-effort and must not block publishing.
    }

    revalidateTag("articles-unified");
    revalidateTag(`article:${record.slug}`);
    revalidateTag(`article-related:${record.slug}`);
    revalidateTag("wisdom-cards");
    revalidateTag(`wisdom-card:${record.slug}`);

    if (oldSlug) {
      revalidateTag(`article:${oldSlug}`);
      revalidateTag(`article-related:${oldSlug}`);
      revalidateTag(`wisdom-card:${oldSlug}`);
    }

    const enrichedData = {
      ...data,
      theme: resolvedTheme,
      topic: resolvedTopic,
    };

    return NextResponse.json(
      { success: true, data: enrichedData },
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
      revalidateTag("wisdom-cards");
      revalidateTag(`wisdom-card:${slug}`);

      try {
        await deleteWisdomCardProjection(slug);
      } catch {
        // Best-effort cleanup only.
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

