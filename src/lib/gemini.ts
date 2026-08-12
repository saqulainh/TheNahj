/**
 * Gemini API helper with dynamic model discovery.
 *
 * Strategy:
 *  1. Call ListModels (v1beta) to find models that support generateContent.
 *  2. Try them in preference order: flash > pro > lite variants.
 *  3. Cache the winning model name for the process lifetime.
 *
 * For the new Interactions API (v1beta2) only gemini-3.6-flash works.
 * We attempt it first; on failure we fall back to generateContent with a discovered model.
 */

// Cached working model for generateContent fallback (reset on cold start)
let cachedGenerateContentModel: string | null = null;

// Preferred model ordering for generateContent (newest / most capable first)
const PREFERRED_GENERATE_MODELS = [
  "gemini-3.6-flash",       // May support generateContent too
  "gemini-3.0-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

export const GEMINI_MODELS = PREFERRED_GENERATE_MODELS;

/**
 * Call the Gemini ListModels endpoint and return model names that
 * support generateContent, sorted by our preference order.
 */
async function discoverGenerateContentModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`,
      { headers: { "x-goog-api-key": apiKey } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const available: Set<string> = new Set();
    for (const m of data.models ?? []) {
      const supportedMethods: string[] = m.supportedGenerationMethods ?? [];
      if (supportedMethods.includes("generateContent")) {
        // Strip "models/" prefix
        const name: string = (m.name as string).replace(/^models\//, "");
        available.add(name);
      }
    }

    // Return preferred models that are actually available, then any remaining
    const ordered = PREFERRED_GENERATE_MODELS.filter((m) => available.has(m));
    for (const m of available) {
      if (!ordered.includes(m) && m.includes("gemini")) ordered.push(m);
    }
    return ordered;
  } catch {
    return [];
  }
}

/**
 * Try a single generateContent call. Returns the text or null.
 */
async function tryGenerateContent(
  model: string,
  prompt: string,
  apiKey: string,
  options: { temperature: number; maxOutputTokens: number; responseMimeType?: string }
): Promise<string | null> {
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
}

/**
 * Try the Interactions API (v1beta2) with gemini-3.6-flash.
 * Returns the text or null.
 */
async function tryInteractionsAPI(
  prompt: string,
  apiKey: string,
  options: { temperature: number; maxOutputTokens: number; responseMimeType?: string }
): Promise<string | null> {
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta2/interactions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: [{ type: "text", text: prompt }],
          config: {
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens,
            ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const modelStep = (data?.steps ?? []).find(
      (s: any) => s.type === "model_output" && s.status === "done"
    );
    const textPart = modelStep?.content?.find((c: any) => c.type === "text");
    return textPart?.text ?? data?.output_text ?? null;
  } catch {
    return null;
  }
}

/**
 * Main entry: try Interactions API first, then dynamically discover and
 * try generateContent models until one works.
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
  const errors: string[] = [];

  // ── 1. Try Interactions API ──────────────────────────────────────────────────
  const interactionsResult = await tryInteractionsAPI(prompt, apiKey, opts);
  if (interactionsResult) return interactionsResult;
  errors.push("[interactions/gemini-3.6-flash]: no result");

  // ── 2. If we have a cached working model, try it first ──────────────────────
  if (cachedGenerateContentModel) {
    try {
      const result = await tryGenerateContent(cachedGenerateContentModel, prompt, apiKey, opts);
      if (result) return result;
    } catch {
      cachedGenerateContentModel = null; // invalidate cache
    }
  }

  // ── 3. Discover available models and try them in order ──────────────────────
  const models = await discoverGenerateContentModels(apiKey);
  if (models.length === 0) {
    // Last resort: try hardcoded fallbacks
    models.push(...PREFERRED_GENERATE_MODELS);
  }

  for (const model of models) {
    try {
      const result = await tryGenerateContent(model, prompt, apiKey, opts);
      if (result) {
        cachedGenerateContentModel = model; // cache for next call
        console.log(`[Gemini] Using model: ${model}`);
        return result;
      } else {
        errors.push(`[${model}]: no text in response`);
      }
    } catch (err: any) {
      errors.push(`[${model}]: ${err.message}`);
    }
  }

  throw new Error(`All Gemini models failed. Errors: ${errors.join(" | ")}`);
}
