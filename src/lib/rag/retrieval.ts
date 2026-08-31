import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateEmbedding } from "./embeddings";
import { getAllWisdom } from "@/lib/wisdom";
import type { Wisdom } from "@/lib/types";

export interface RAGSearchResult {
  content: string;
  source: string;
  slug?: string;
  score: number;
}

export interface RAGRetrievalPayload {
  results: RAGSearchResult[];
  isSpecificReferenceQuery: boolean;
  hasVerifiedMatch: boolean;
  queryIntent: "specific_citation" | "general_inquiry";
}

// Baseline confidence thresholds (empirically tunable based on embedding model distribution)
const GENERAL_SIMILARITY_THRESHOLD = 0.45;
const STRICT_REFERENCE_THRESHOLD = 0.65;

// Regex to detect explicit requests for numbered sermons, letters, sayings, or chapters
const SPECIFIC_REFERENCE_REGEX = /\b(khutba|sermon|letter|maktuub|saying|hikmat|hadith|chapter|ayah|surah)\s*(?:no\.?|#|number)?\s*(\d+)\b/i;

/**
 * High-precision RAG Search Engine with Confidence Thresholding
 * Combines vector search via Supabase pgvector with hybrid local semantic retrieval.
 */
export async function searchRAGContext(
  query: string, 
  matchCount = 5, 
  preloadedWisdom?: Wisdom[]
): Promise<RAGSearchResult[]> {
  const payload = await searchRAGContextWithConfidence(query, matchCount, preloadedWisdom);
  return payload.results;
}

/**
 * Enhanced RAG Retrieval returning confidence metadata and verified-match validation
 */
export async function searchRAGContextWithConfidence(
  query: string,
  matchCount = 5,
  preloadedWisdom?: Wisdom[]
): Promise<RAGRetrievalPayload> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      results: [],
      isSpecificReferenceQuery: false,
      hasVerifiedMatch: false,
      queryIntent: "general_inquiry",
    };
  }

  const refMatch = cleanQuery.match(SPECIFIC_REFERENCE_REGEX);
  const isSpecificReferenceQuery = !!refMatch;
  const targetNumber = refMatch ? refMatch[2] : null;

  // Generate embedding vector for user query
  const embedStart = Date.now();
  const queryVector = await generateEmbedding(cleanQuery);
  const embedMs = Date.now() - embedStart;

  let rawResults: RAGSearchResult[] = [];

  // 1. Try Supabase pgvector RPC search if configured
  if (isSupabaseConfigured && supabase && queryVector) {
    const supabaseStart = Date.now();
    try {
      const { data, error } = await supabase.rpc("match_wisdom_embeddings", {
        query_embedding: queryVector,
        match_threshold: 0.3,
        match_count: matchCount,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        console.log(`[RAG] ⏱ embedding=${embedMs}ms, supabase-pgvector=${Date.now() - supabaseStart}ms, results=${data.length}`);
        rawResults = data.map((item: any) => ({
          content: item.content,
          source: item.metadata?.source || "Nahjul Balagha",
          slug: item.metadata?.slug,
          score: item.similarity || 0.85,
        }));
      }
    } catch (err) {
      console.warn(`[RAG] ⏱ embedding=${embedMs}ms — Supabase RPC error, using hybrid fallback:`, err);
    }
  }

  // 2. Hybrid Local Semantic Search Fallback / Supplement
  if (rawResults.length === 0) {
    rawResults = await searchLocalHybridContext(cleanQuery, matchCount, preloadedWisdom);
  }

  // 3. Apply Confidence Score Thresholding
  const threshold = isSpecificReferenceQuery ? STRICT_REFERENCE_THRESHOLD : GENERAL_SIMILARITY_THRESHOLD;
  const filteredResults = rawResults.filter((r) => r.score >= threshold);

  // 4. For specific citation lookups, strictly verify the target number appears in the source or text
  let hasVerifiedMatch = false;
  if (isSpecificReferenceQuery && targetNumber) {
    hasVerifiedMatch = filteredResults.some((r) => {
      const textToSearch = `${r.source} ${r.content}`.toLowerCase();
      // Verify target number is actually present in the citation or content
      return textToSearch.includes(targetNumber);
    });
  } else {
    hasVerifiedMatch = filteredResults.length > 0;
  }

  return {
    results: hasVerifiedMatch ? filteredResults : (isSpecificReferenceQuery ? [] : filteredResults),
    isSpecificReferenceQuery,
    hasVerifiedMatch,
    queryIntent: isSpecificReferenceQuery ? "specific_citation" : "general_inquiry",
  };
}

/**
 * Hybrid local semantic matcher as zero-dependency fallback
 */
async function searchLocalHybridContext(
  query: string, 
  count: number, 
  preloadedWisdom?: Wisdom[]
): Promise<RAGSearchResult[]> {
  const allWisdom = preloadedWisdom || await getAllWisdom();
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
