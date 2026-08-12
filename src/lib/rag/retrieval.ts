import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateEmbedding } from "./embeddings";
import { getAllWisdom } from "@/lib/wisdom";

export interface RAGSearchResult {
  content: string;
  source: string;
  slug?: string;
  score: number;
}

/**
 * High-precision RAG Search Engine
 * Combines vector search via Supabase pgvector with hybrid local semantic retrieval.
 */
export async function searchRAGContext(query: string, matchCount = 5): Promise<RAGSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Generate embedding vector for user query
  const queryVector = await generateEmbedding(cleanQuery);

  // 1. Try Supabase pgvector RPC search if configured
  if (isSupabaseConfigured && supabase && queryVector) {
    try {
      const { data, error } = await supabase.rpc("match_wisdom_embeddings", {
        query_embedding: queryVector,
        match_threshold: 0.3,
        match_count: matchCount,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          content: item.content,
          source: item.metadata?.source || "Nahjul Balagha",
          slug: item.metadata?.slug,
          score: item.similarity || 0.85,
        }));
      }
    } catch (err) {
      console.warn("[RAG Retrieval] Supabase RPC search error, using hybrid fallback:", err);
    }
  }

  // 2. Hybrid Local Semantic Search Fallback
  return searchLocalHybridContext(cleanQuery, matchCount);
}

/**
 * Hybrid local semantic matcher as zero-dependency fallback
 */
async function searchLocalHybridContext(query: string, count: number): Promise<RAGSearchResult[]> {
  const allWisdom = await getAllWisdom();
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = allWisdom.map((w) => {
    const combinedText = `${w.english_translation} ${w.urdu_translation} ${w.source} ${w.category?.name || ""} ${(w.corner_topics || []).join(" ")}`.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      if (combinedText.includes(term)) score += 2;
    }

    return {
      content: `[${w.source}]: "${w.english_translation}"`,
      source: w.source,
      slug: w.slug,
      score: Math.min(score / 10, 0.95),
    };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
