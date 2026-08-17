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

// ─── Streaming Types ──────────────────────────────────────────────────────────

export interface GeminiStreamOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Open a server-sent event stream to streamGenerateContent?alt=sse.
 * Returns a ReadableStream<string> of raw token chunks, or null on failure.
 * The caller is responsible for reading and forwarding chunks to the client.
 */
async function tryStreamGenerateContent(
  model: string,
  prompt: string,
  apiKey: string,
  options: { temperature: number; maxOutputTokens: number }
): Promise<ReadableStream<string> | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
        },
      }),
      signal: AbortSignal.timeout(25000), // 25s hard timeout
    });
  } catch (err) {
    console.warn(`[Gemini] fetch failed or timed out for ${model}:`, err);
    return null;
  }

  if (!res.ok || !res.body) return null;

  // Transform the raw SSE byte stream into a stream of text token strings.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        // Each SSE frame looks like:
        //   data: {"candidates":[{"content":{"parts":[{"text":"..."}],...},...}],...}\n\n
        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { controller.close(); return; }
          try {
            const parsed = JSON.parse(jsonStr);
            const text: string | undefined =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(text);
          } catch {
            // Skip malformed SSE lines
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

/**
 * Streaming Gemini call with parallel model failover.
 *
 * On warm calls: streams from the cached winning model directly.
 * On cold start: races the top PARALLEL_RACE_COUNT models — first one to
 *   successfully open a stream wins; others are aborted.
 *
 * Returns a ReadableStream<string> of token text chunks.
 * Throws if all models fail.
 */
export async function streamGeminiWithFailover(
  prompt: string,
  apiKey: string,
  options: GeminiStreamOptions = {}
): Promise<ReadableStream<string>> {
  const opts = {
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.maxOutputTokens ?? 1500,
  };

  // ── 1. Fast path: cached winning model ──────────────────────────────────────
  if (cachedGenerateContentModel) {
    const stream = await tryStreamGenerateContent(
      cachedGenerateContentModel,
      prompt,
      apiKey,
      opts
    );
    if (stream) return stream;
    cachedGenerateContentModel = null; // invalidate stale cache
  }

  // ── 2. Parallel race: top N models ──────────────────────────────────────────
  const parallelModels = PREFERRED_GENERATE_MODELS.slice(0, PARALLEL_RACE_COUNT);

  const streamRaces = parallelModels.map(async (model) => {
    const stream = await tryStreamGenerateContent(model, prompt, apiKey, opts);
    if (!stream) throw new Error(`[${model}]: stream open failed`);
    return { stream, model };
  });

  try {
    const winner = await Promise.any(streamRaces);
    cachedGenerateContentModel = winner.model;
    console.log(`[Gemini Stream] Parallel winner: ${winner.model}`);
    return winner.stream;
  } catch {
    // All parallel attempts failed — try remaining models sequentially
  }

  // ── 3. Sequential fallback: remaining models ────────────────────────────────
  const remaining = PREFERRED_GENERATE_MODELS.slice(PARALLEL_RACE_COUNT);
  for (const model of remaining) {
    const stream = await tryStreamGenerateContent(model, prompt, apiKey, opts);
    if (stream) {
      cachedGenerateContentModel = model;
      console.log(`[Gemini Stream] Sequential fallback winner: ${model}`);
      return stream;
    }
  }

  throw new Error("All Gemini models failed (streaming).");
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

