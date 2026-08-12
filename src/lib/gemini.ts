export const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

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

  for (const model of GEMINI_MODELS) {
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
