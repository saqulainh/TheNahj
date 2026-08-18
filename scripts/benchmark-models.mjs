// Direct per-model streaming benchmark for Gemini.
// Measures: headers latency, time-to-first-text, total stream time, chars,
// and reports any 429 (rate-limit) / 5xx responses.
import fs from "fs";

// Match dotenv semantics: strip surrounding matching quotes.
function dotenvValue(raw) {
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

const apiKey = dotenvValue(fs.readFileSync(".env.local", "utf8").match(/GEMINI_API_KEY=(.*)/)?.[1] ?? "");
if (!apiKey) {
  console.error("No GEMINI_API_KEY in .env.local");
  process.exit(1);
}
console.log(`Loaded key: ${apiKey.slice(0, 6)}…${apiKey.slice(-3)} (len ${apiKey.length})`);

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

const SYSTEMS = ["warm", "cold"];
const ROUNDS_PER_MODEL = 2;

// Representative real user prompt (same shape as the chat system prompt, trimmed)
const PROMPT = `You are a helpful AI advisor grounded in Nahjul Balagha.
Answer the user briefly with practical steps.
User: How to deal with exam anxiety & stress?`;

async function runOnce(model, round) {
  const fetchStart = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );
  const headersMs = Date.now() - fetchStart;

  if (!res.ok || !res.body) {
    console.log(`[${model}] r${round} → HTTP ${res.status} headers ${headersMs}ms`);
    return { model, round, status: res.status, headersMs, ttft: null, totalMs: null, chars: 0 };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstTextMs = null;
  let text = "";
  const t0 = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          const t = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (t) {
            if (firstTextMs === null) firstTextMs = Date.now() - t0;
            text += t;
          }
        } catch { /* skip */ }
      }
    }
  }
  const totalMs = Date.now() - t0;
  console.log(
    `[${model}] r${round} → HTTP ${res.status}, headers ${headersMs}ms, TTFT ${firstTextMs === null ? "N/A" : firstTextMs + "ms"}, total ${totalMs}ms, chars ${text.length}`
  );
  return { model, round, status: res.status, headersMs, ttft: firstTextMs, totalMs, chars: text.length };
}

async function main() {
  console.log(`=== Gemini model benchmark (${SYSTEMS.join("/")}, ${ROUNDS_PER_MODEL} rounds each) ===`);
  let rateLimited = false;
  for (const model of MODELS) {
    for (let i = 0; i < ROUNDS_PER_MODEL; i++) {
      const r = await runOnce(model, i + (model === MODELS[0] ? 0 : 0));
      if (r.status === 429) rateLimited = true;
      // small delay between calls to be gentle on rate limits
      await new Promise((res) => setTimeout(res, 400));
    }
  }
  console.log(rateLimited ? "⚠️ Saw 429 responses in this run." : "No 429 responses observed.");
}

main().catch((e) => { console.error(e); process.exit(1); });