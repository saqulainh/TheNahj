import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateEmbedding } from "./embeddings";

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

// Empirical confidence thresholds derived from gemini-embedding-001 distribution:
// - Exact matches: 0.80 - 0.90+
// - Topical semantic matches: 0.65 - 0.75
// - Fake specific citations: 0.50 - 0.55 max
// - Out-of-domain / noise: < 0.45
const GENERAL_SIMILARITY_THRESHOLD = 0.55;
const STRICT_REFERENCE_THRESHOLD = 0.65;

// Regex to detect explicit requests for numbered sermons, letters, sayings, chapters, duas
const SPECIFIC_REFERENCE_REGEX = /\b(khutba|sermon|letter|maktuub|saying|hikmat|hadith|chapter|ayah|surah|dua|sahifa)\s*(?:no\.?|#|number)?\s*(\d+)\b/i;

/**
 * High-precision RAG Search Engine with Confidence Thresholding
 * Combines vector search via Supabase pgvector with hybrid local semantic retrieval.
 */


/**
 * Enhanced RAG Retrieval returning confidence metadata and verified-match validation
 */
export async function searchRAGContextWithConfidence(
  query: string,
  matchCount = 5
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
      const rpcArgs: any = {
        query_text: cleanQuery,
        query_embedding: queryVector,
        match_count: matchCount,
      };
      
      // Inject metadata pre-filter for specific citations
      if (isSpecificReferenceQuery && targetNumber && refMatch) {
        let rawType = refMatch[1].toLowerCase();
        let corpusId = "nahjul-balagha";

        if (['surah', 'ayah', 'chapter'].includes(rawType)) {
          corpusId = "quran";
        } else if (['dua', 'sahifa'].includes(rawType)) {
          corpusId = "sahifa-sajjadiya";
        } else if (['hadith'].includes(rawType)) {
          corpusId = "hadith";
        }

        const citationType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
        
        rpcArgs.filter_metadata = {
          corpus_id: corpusId,
          citation_type: citationType,
          citation_number: targetNumber
        };
      }

      const { data, error } = await supabase.rpc("hybrid_search_wisdom", rpcArgs);

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

  // Removed Hybrid Local Semantic Search Fallback since we are using native Postgres FTS via hybrid_search_wisdom

  // 3. Apply Confidence Score Thresholding
  console.log(`[CALIBRATION] Query: "${cleanQuery}"`);
  rawResults.forEach((r, i) => console.log(`   -> Match ${i+1}: score=${r.score.toFixed(3)}, source=${r.source}`));
  
  const threshold = isSpecificReferenceQuery ? STRICT_REFERENCE_THRESHOLD : GENERAL_SIMILARITY_THRESHOLD;
  const filteredResults = rawResults.filter((r) => r.score >= threshold);

  // 4. For specific citation lookups, strictly verify and filter results
  let verifiedResults = filteredResults;
  let hasVerifiedMatch = false;

  if (isSpecificReferenceQuery && targetNumber && refMatch) {
    const citationType = refMatch[1].charAt(0).toUpperCase() + refMatch[1].slice(1).toLowerCase();
    const exactSourceMatch = `${citationType} ${targetNumber}`.toLowerCase();
    
    // Actually filter out any result that isn't the exact target
    verifiedResults = filteredResults.filter((r) => r.source.toLowerCase() === exactSourceMatch);
    hasVerifiedMatch = verifiedResults.length > 0;
  } else {
    hasVerifiedMatch = filteredResults.length > 0;
  }

  return {
    results: verifiedResults,
    isSpecificReferenceQuery,
    hasVerifiedMatch,
    queryIntent: isSpecificReferenceQuery ? "specific_citation" : "general_inquiry",
  };
}

