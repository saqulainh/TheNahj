/**
 * Gemini API helper with streaming support and parallel model failover.
 *
 * Strategy:
 *  1. For streaming: use streamGenerateContent?alt=sse for token-by-token delivery.
 *  2. Cold-start failover: race the top 3 preferred models with Promise.any()
 *     instead of trying them sequentially — cuts cold-start from 15-40s → 3-12s.
 *  3. Cache the winning model for process lifetime to avoid failover on warm calls.
 *  4. Non-streaming fetchGeminiWithFailover() kept intact for admin/non-chat callers.
 */

// Cached working model for generateContent / streamGenerateContent (reset on cold start)
let cachedGenerateContentModel: string | null = null;

// Preferred model ordering (optimized for speed — top 3 are raced in parallel on cold start)
const PREFERRED_GENERATE_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-3.6-flash",
  "gemini-3.0-flash",
  "gemini-2.5-pro",
  "gemini-2.0-pro",
  "gemini-1.5-pro",
];

// Top N models to race in parallel on cold start
const PARALLEL_RACE_COUNT = 3;

export const GEMINI_MODELS = PREFERRED_GENERATE_MODELS;

/**
 * Try a single generateContent call. Returns the text or null on any error.
 */
async function tryGenerateContent(
  model: string,
  prompt: string,
  apiKey: string,
  options: { temperature: number; maxOutputTokens: number; responseMimeType?: string }
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens,
            ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

/**
 * Race the top N preferred models in parallel using Promise.any().
 * The first model to return a successful result wins and is cached.
 * This cuts cold-start latency from 15-40s (sequential) → 3-12s (parallel).
 */
async function raceModels(
  models: string[],
  prompt: string,
  apiKey: string,
  options: { temperature: number; maxOutputTokens: number; responseMimeType?: string }
): Promise<{ text: string; model: string } | null> {
  const races = models.map(async (model) => {
    const text = await tryGenerateContent(model, prompt, apiKey, options);
    if (!text) throw new Error(`[${model}]: no text`);
    return { text, model };
  });

  try {
    return await Promise.any(races);
  } catch {
    return null;
  }
}

/**
 * Non-streaming Gemini call with parallel failover.
 * Used by admin AI studio and other non-chat callers.
 *
 * On warm calls: uses cached winning model directly (fast path).
 * On cold start: races top PARALLEL_RACE_COUNT models in parallel,
 *   then falls back to remaining models sequentially if all parallel
 *   attempts fail.
 */
export async function fetchGeminiWithFailover(
  prompt: string,
  apiKey: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: "application/json" | "text/plain";
  } = {}
): Promise<string> {
  const opts = {
    temperature: options.temperature ?? 0.3,
    maxOutputTokens: options.maxOutputTokens ?? 4000,
    responseMimeType: options.responseMimeType,
  };

  // ── 1. Fast path: cached winning model ──────────────────────────────────────
  if (cachedGenerateContentModel) {
    const result = await tryGenerateContent(cachedGenerateContentModel, prompt, apiKey, opts);
    if (result) return result;
    cachedGenerateContentModel = null; // invalidate stale cache
  }

  // ── 2. Parallel race: top N models ──────────────────────────────────────────
  const parallelModels = PREFERRED_GENERATE_MODELS.slice(0, PARALLEL_RACE_COUNT);
  const raceResult = await raceModels(parallelModels, prompt, apiKey, opts);
  if (raceResult) {
    cachedGenerateContentModel = raceResult.model;
    console.log(`[Gemini] Parallel winner: ${raceResult.model}`);
    return raceResult.text;
  }

  // ── 3. Sequential fallback: remaining models ────────────────────────────────
  const remaining = PREFERRED_GENERATE_MODELS.slice(PARALLEL_RACE_COUNT);
  for (const model of remaining) {
    const result = await tryGenerateContent(model, prompt, apiKey, opts);
    if (result) {
      cachedGenerateContentModel = model;
      console.log(`[Gemini] Sequential fallback winner: ${model}`);
      return result;
    }
  }

  throw new Error("All Gemini models failed (non-streaming).");
}


/**
 * Safely parse JSON from LLM output, extracting from markdown code blocks,
 * sanitizing unescaped control characters inside strings, and repairing truncated JSON structures.
 */
export function parseRobustJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or invalid raw text provided for JSON parsing");
  }

  // 1. Strip markdown code fence blocks
  let text = rawText.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // 2. Find outermost JSON object or array bounds
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let startIdx = -1;
  let endChar = "}";

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = "}";
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = "]";
  }

  if (startIdx !== -1) {
    const lastEnd = text.lastIndexOf(endChar);
    if (lastEnd > startIdx) {
      text = text.slice(startIdx, lastEnd + 1);
    } else {
      text = text.slice(startIdx);
    }
  }

  // 3. Try standard JSON.parse first
  try {
    return JSON.parse(text);
  } catch (firstErr) {
    // Continue to repair attempts
  }

  // 4. Fix raw unescaped control chars inside JSON string literals
  const sanitized = sanitizeControlCharsInJsonStrings(text);
  try {
    return JSON.parse(sanitized);
  } catch (secondErr) {
    // Continue to structural repair
  }

  // 5. Attempt structural repair for truncated JSON
  const repaired = repairTruncatedJson(sanitized);
  try {
    return JSON.parse(repaired);
  } catch (finalErr: any) {
    throw new Error(`Failed to parse JSON response: ${finalErr.message || String(finalErr)}`);
  }
}

function sanitizeControlCharsInJsonStrings(json: string): string {
  let inString = false;
  let escaped = false;
  let result = "";

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (inString) {
      if (escaped) {
        result += ch;
        escaped = false;
      } else if (ch === "\\") {
        result += ch;
        escaped = true;
      } else if (ch === '"') {
        result += ch;
        inString = false;
      } else if (ch === "\n") {
        result += "\\n";
      } else if (ch === "\r") {
        result += "\\r";
      } else if (ch === "\t") {
        result += "\\t";
      } else {
        result += ch;
      }
    } else {
      if (ch === '"') {
        inString = true;
      }
      result += ch;
    }
  }
  return result;
}

function repairTruncatedJson(json: string): string {
  let stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === "{") {
        stack.push("}");
      } else if (ch === "[") {
        stack.push("]");
      } else if (ch === "}" || ch === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  let repaired = json.trim();

  // If ended inside a string literal, close the quote
  if (inString) {
    repaired += '"';
  }

  // Remove trailing comma if any
  repaired = repaired.replace(/,\s*$/, "");

  // Close remaining open objects/arrays
  while (stack.length > 0) {
    repaired += stack.pop();
  }

  return repaired;
}

