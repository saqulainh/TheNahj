// ─── RAG Embedding Generator Utility ─────────────────────────────────────────

export interface VectorChunk {
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

/**
 * Generate text embedding vector using Gemini Text Embedding API
 * Defaults to 768 dimensions.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const cleanText = text.replace(/\n+/g, " ").trim();
  if (!cleanText) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[RAG Embedding CRITICAL] GEMINI_API_KEY is not configured in environment.");
    return null;
  }

  const candidateModels = [
    "models/gemini-embedding-001",
    "models/gemini-embedding-2"
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model,
            content: {
              parts: [{ text: cleanText }],
            },
            outputDimensionality: 768,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const values = data?.embedding?.values;
        if (Array.isArray(values) && values.length === 768) {
          return values;
        }
      } else {
        const errBody = await response.text();
        console.error(`[RAG Embedding ERROR] Model ${model} returned ${response.status}:`, errBody);
      }
    } catch (err) {
      console.error(`[RAG Embedding NETWORK ERROR] Failed fetching from ${model}:`, err);
    }
  }

  console.error("[RAG Embedding FATAL] All Gemini embedding model attempts failed. Vector search unavailable for this turn.");
  return null;
}

/**
 * Local 768-dimensional pseudo-embedding fallback when API key is missing
 */
function generateLocalPseudoEmbedding(text: string): number[] {
  const dims = 768;
  const vector = new Array(dims).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dims;
    vector[idx] += 1;
  }

  // L2 normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
}

/**
 * Chunk long text blocks into smaller semantically cohesive paragraphs
 */
export function chunkText(text: string, maxChars = 600): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length <= maxChars) {
      current = current ? `${current}\n\n${para}` : para;
    } else {
      if (current) chunks.push(current);
      current = para;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
