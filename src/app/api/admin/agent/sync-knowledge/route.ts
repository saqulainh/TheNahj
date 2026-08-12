import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join(" "));
      // Overlap: keep last few words
      const overlapWords = currentChunk.slice(-Math.floor(overlap / 6));
      currentChunk = [...overlapWords];
      currentLength = currentChunk.join(" ").length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks.filter((c) => c.trim().length > 30);
}

function extractTextFromHTML(html: string): { title: string; body: string } {
  // Strip script/style tags
  const cleanHtml = html
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, "");

  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, " ").trim() : "External Knowledge";

  // Strip all HTML tags to get raw text
  const body = cleanHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, body };
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split("; ").find((r) => r.trim().startsWith("thenahj-admin="))?.split("=")[1];
  const isAuth = await verifyAdminToken(token);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const targetUrl = body.url || "https://imamandscience.com/";

    console.log(`[Autonomous Knowledge Agent] Fetching & indexing: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "TheNahj-Autonomous-AI-Agent/1.0 (+https://thenahj.live)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${res.statusText}` }, { status: 502 });
    }

    const html = await res.text();
    const { title, body: rawText } = extractTextFromHTML(html);

    if (rawText.length < 100) {
      return NextResponse.json({ error: "Insufficient text extracted from page" }, { status: 400 });
    }

    const textChunks = chunkText(rawText, 600, 80);
    const supabase = getSupabaseAdmin();

    const indexedChunks = [];
    for (let i = 0; i < Math.min(textChunks.length, 10); i++) {
      const chunk = textChunks[i];
      const embedding = await generateEmbedding(chunk);

      if (supabase && embedding) {
        try {
          await supabase.from("rag_documents").insert({
            content: chunk,
            source: title,
            url: targetUrl,
            category: "Imam & Science Scraped",
            embedding: embedding,
            metadata: {
              scraped_at: new Date().toISOString(),
              chunk_index: i,
              total_chunks: textChunks.length,
            },
          });
        } catch (dbErr) {
          console.warn("[Autonomous Agent] Supabase insert warning:", dbErr);
        }
      }

      indexedChunks.push({
        index: i,
        snippet: chunk.substring(0, 100) + "...",
        hasEmbedding: !!embedding,
      });
    }

    return NextResponse.json({
      success: true,
      agent: "Autonomous Knowledge Sync Agent v1.0",
      targetUrl,
      sourceTitle: title,
      totalTextLength: rawText.length,
      totalChunksCreated: textChunks.length,
      indexedChunksCount: indexedChunks.length,
      sampleChunks: indexedChunks,
      status: "Knowledge base updated with vector embeddings",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Autonomous Sync Failed" }, { status: 500 });
  }
}
