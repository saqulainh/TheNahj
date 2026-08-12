// Primary model for the new Interactions API (v1beta2)
const INTERACTIONS_MODEL = "gemini-3.6-flash";

// Fallback models for the legacy generateContent API (v1beta)
const GENERATE_CONTENT_MODELS = [
  "gemini-2.5-flash-lite",
];

export const GEMINI_MODELS = [INTERACTIONS_MODEL, ...GENERATE_CONTENT_MODELS];

/**
 * Try the new Interactions API first (gemini-3.6-flash on v1beta2),
 * then fall back to generateContent (gemini-2.5-flash-lite on v1beta).
 */
export async function fetchGeminiWithFailover(
  prompt: string,
  apiKey: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: "application/json" | "text/plain";
  } = {}
) {
  const { temperature = 0.3, maxOutputTokens = 4000, responseMimeType } = options;
  const errors: string[] = [];

  // ── 1. Try the Interactions API (v1beta2) with gemini-3.6-flash ──
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/interactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: INTERACTIONS_MODEL,
          input: [{ type: "text", text: prompt }],
          config: {
            temperature,
            maxOutputTokens,
            ...(responseMimeType ? { responseMimeType } : {}),
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Interactions API returns steps → find the model_output step
      const steps = data?.steps ?? [];
      const modelStep = steps.find(
        (s: any) => s.type === "model_output" && s.status === "done"
      );
      if (modelStep) {
        const textPart = modelStep.content?.find((c: any) => c.type === "text");
        if (textPart?.text) return textPart.text;
      }
      // Also try output_text convenience field
      if (data?.output_text) return data.output_text;
    } else {
      const errText = await response.text();
      errors.push(`[interactions/${INTERACTIONS_MODEL}]: ${errText}`);
      console.warn(`Interactions API failed, falling back to generateContent:`, errText);
    }
  } catch (err: any) {
    const errMsg = err.message || String(err);
    errors.push(`[interactions/${INTERACTIONS_MODEL}]: ${errMsg}`);
    console.warn(`Interactions API exception:`, errMsg);
  }

  // ── 2. Fallback to legacy generateContent API (v1beta) ──
  for (const model of GENERATE_CONTENT_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens,
              ...(responseMimeType ? { responseMimeType } : {}),
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return rawText;
      } else {
        const errText = await response.text();
        errors.push(`[${model}]: ${errText}`);
        console.warn(`Gemini model ${model} failed, trying failover:`, errText);
      }
    } catch (err: any) {
      const errMsg = err.message || String(err);
      errors.push(`[${model}]: ${errMsg}`);
      console.warn(`Gemini model ${model} fetch exception:`, errMsg);
    }
  }

  throw new Error(`All Gemini models failed. Errors: ${errors.join(" | ")}`);
}
