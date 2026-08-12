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

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: {
              parts: [{ text: cleanText }],
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const values = data?.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          return values;
        }
      }
    } catch (err) {
      console.warn("[RAG Embedding] Gemini API error, falling back:", err);
    }
  }

  // Fallback: Generate a normalized deterministic pseudo-embedding vector (768-dim) based on word frequency
  return generateLocalPseudoEmbedding(cleanText);
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
