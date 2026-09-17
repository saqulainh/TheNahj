export const runtime = "edge";
import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { searchRAGContextWithConfidence, type RAGSearchResult } from "@/lib/rag/retrieval";
import { streamGeminiWithFailover } from "@/lib/gemini";
import { sanitizeAIResponse } from "@/lib/sanitizeAIResponse";
import { getCachedResponse, setCachedResponse } from "@/lib/rag/cache";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// ⏱ Time budgets for each pipeline stage. These guarantee that a hung
// retrieval / embedding / generation step can NEVER hold a request open
// forever, even if the underlying Supabase or Gemini call never responds.
const RETRIEVAL_TIMEOUT_MS = 15000;   // getAllWisdom + RAG search + embeddings
const GENERATION_TIMEOUT_MS = 30000;  // total budget for the whole chat request

// Reject a promise if it does not settle within `ms`. Used as a hard safety
// net around RAG retrieval (which can hang on Supabase/embedding calls that
// have no built-in timeout).
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`[${label}] timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ─── Pipeline status messages sent as SSE events ──────────────────────────────
// These drive the dynamic progress indicator in the frontend.
const STATUS = {
  CACHE_CHECK:  "cache_check",
  RETRIEVING:   "retrieving",         // "Searching Nahjul Balagha..."
  COMPOSING:    "composing",          // "Composing response..."
  DONE:         "done",               // carries metadata (widget, relatedWisdom, topics)
  ERROR:        "error",
} as const;

// ─── Static knowledge corpus (inline, no I/O cost) ────────────────────────────
const NAHJUL_BALAGHA_CORPUS = `
KEY TEACHINGS OF IMAM ALI (AS) FROM NAHJUL BALAGHA:

SERMONS:
- Sermon 18: "O people! This world is a passage while the next is the permanent abode."
- Sermon 40: "Knowledge is the most superior form of wealth."
- Sermon 87: "Patience is of two kinds: patience over what pains you, and patience against what you covet."
- Sermon 110: Describes qualities of the God-fearing (Muttaqeen).
- Sermon 193: "Beware, the world is deceitful and treacherous."

LETTERS:
- Letter 31 (To Imam Hasan): "Make yourself the judge between yourself and others."
- Letter 53 (To Malik al-Ashtar): "People are of two kinds: either your brother in faith or your equal in humanity."

HIKAM (Sayings):
- "One who knows himself knows his Lord." (149)
- "Your remedy is within you." (108)
- "The tongue is a beast: if it is let loose, it devours." (60)
- "Opportunity passes away like a cloud." (21)
- "The value of every person is in what he does well." (81)
- "Contentment is an unexhausted capital." (57)
- "Do not let difficulties fill you with anxiety — stars shine brightest in darkest nights."
- "Anger begins with madness and ends with regret." (255)
`;

// ─── Topic Mapping for Better Search ──────────────────────────────────────────
const TOPIC_KEYWORDS: Record<string, string[]> = {
  anxiety: ["anxiety", "worry", "stress", "tension", "fear", "panic", "nervous", "overwhelm", "anxious"],
  patience: ["patience", "sabr", "endure", "hardship", "suffering", "difficulty", "persevere", "wait"],
  knowledge: ["knowledge", "study", "learn", "education", "school", "exam", "college", "university", "student", "teacher"],
  focus: ["focus", "distraction", "attention", "concentrate", "phone", "social media", "procrastinate", "lazy", "procrastination", "dopamine"],
  purpose: ["purpose", "meaning", "life", "goal", "ambition", "career", "future", "direction", "lost", "confused"],
  relationships: ["friend", "friendship", "family", "parents", "marriage", "love", "loneliness", "lonely", "toxic", "relationship"],
  justice: ["justice", "fairness", "oppression", "rights", "wrong", "injustice", "equality"],
  character: ["character", "anger", "ego", "pride", "humility", "honest", "lying", "gossip", "backbiting", "arrogant", "humble"],
  time: ["time", "time management", "productive", "productivity", "wasting time", "busy", "schedule"],
  spiritual: ["spiritual", "prayer", "dua", "faith", "iman", "taqwa", "sin", "repentance", "forgiveness", "god", "allah", "quran"],
  leadership: ["leadership", "leader", "responsibility", "authority", "power", "influence"],
  discipline: ["discipline", "self-control", "habit", "willpower", "routine", "consistency", "motivation"],
};

function detectTopics(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(topic);
    }
  }
  return detected.length > 0 ? detected : ["general"];
}

// ─── Widget Detection ──────────────────────────────────────────────────────────
const QUIZ_BANK = [
  {
    topic: "knowledge",
    question: "According to Imam Ali (AS), what is the greatest form of wealth?",
    options: ["Material Gold", "Knowledge & Wisdom", "Social Status", "Physical Strength"],
    correctIndex: 1,
    explanation: "Imam Ali (AS) taught: 'Knowledge is the most superior wealth.' (Saying 147)",
  },
  {
    topic: "patience",
    question: "How did Imam Ali (AS) describe the relationship between Patience (Sabr) and Faith (Iman)?",
    options: [
      "Patience is half of faith",
      "Patience is to faith what the head is to the body",
      "Patience comes after faith",
      "Patience is separate from faith",
    ],
    correctIndex: 1,
    explanation: "Imam Ali (AS) said: 'Patience is to faith what the head is to the body; a body has no good in it without a head.' (Saying 82)",
  },
  {
    topic: "time",
    question: "According to Imam Ali (AS), how fast does opportunity pass away?",
    options: ["Like water in a river", "Like a cloud", "Like a shadow", "Like the wind"],
    correctIndex: 1,
    explanation: "Imam Ali (AS) taught: 'Opportunity passes away like a cloud, so make use of good opportunities.' (Saying 21)",
  },
  {
    topic: "anger",
    question: "What did Imam Ali (AS) describe as the beginning of anger and its end?",
    options: [
      "Beginning is passion, end is victory",
      "Beginning is madness, end is regret",
      "Beginning is fire, end is ashes",
      "Beginning is strength, end is weakness",
    ],
    correctIndex: 1,
    explanation: "Imam Ali (AS) said: 'Anger begins with madness and ends with regret.' (Saying 255)",
  },
  {
    topic: "friendship",
    question: "Who did Imam Ali (AS) consider the most helpless of all people?",
    options: [
      "The one who has no wealth",
      "The one who cannot gain friends, and even more helpless is one who loses them",
      "The one who has no health",
      "The one who lives in isolation",
    ],
    correctIndex: 1,
    explanation: "Imam Ali (AS) said: 'The most helpless person is one who cannot acquire friends, and more helpless is the one who loses those he has.' (Saying 12)",
  },
  {
    topic: "ego",
    question: "What did Imam Ali (AS) identify as the greatest obstacle to learning & wisdom?",
    options: ["Lack of books", "Self-conceit and vanity (Ujb)", "Poverty", "Old age"],
    correctIndex: 1,
    explanation: "Imam Ali (AS) taught: 'Self-conceit (vanity) is an obstacle to progress and wisdom.' (Saying 212)",
  },
  {
    topic: "tongue",
    question: "How did Imam Ali (AS) describe the human tongue?",
    options: [
      "A sharp sword",
      "A wild beast; if left free, it devours",
      "A mirror of the heart",
      "A vessel of speech",
    ],
    correctIndex: 1,
    explanation: "Imam Ali (AS) said: 'The tongue is a beast; if it is let loose, it devours.' (Saying 60)",
  },
  {
    topic: "justice",
    question: "How did Imam Ali (AS) define Justice compared to Generosity?",
    options: [
      "Generosity is higher because it gives more",
      "Justice puts things in their proper place; generosity takes them out",
      "Justice and generosity are identical",
      "Generosity is for leaders, justice for common people",
    ],
    correctIndex: 1,
    explanation: "Imam Ali (AS) explained: 'Justice puts things in their proper places, while generosity takes them out of their places. Therefore, justice is superior.' (Saying 437)",
  },
  {
    topic: "contentment",
    question: "What did Imam Ali (AS) call the capital that never diminishes?",
    options: ["Gold coins", "Contentment (Qana'ah)", "Land property", "Inheritance"],
    correctIndex: 1,
    explanation: "Imam Ali (AS) taught: 'Contentment is an unexhaustible capital.' (Saying 57)",
  },
  {
    topic: "forgiveness",
    question: "When you gain power over your enemy, what did Imam Ali (AS) advise as gratitude for that power?",
    options: ["To demand tribute", "To pardon and forgive him", "To banish him", "To imprison him"],
    correctIndex: 1,
    explanation: "Imam Ali (AS) said: 'When you gain power over your adversary, pardon him as a way of offering thanks for having gained power over him.' (Saying 11)",
  },
];

function buildWidget(lowerMsg: string): any {
  if (lowerMsg.includes("breath") || lowerMsg.includes("anxiety") || lowerMsg.includes("stress") || lowerMsg.includes("panic")) {
    return { type: "breathing", title: "4-7-8 De-Stress & Reflection Breathing" };
  }
  if (lowerMsg.includes("quiz") || lowerMsg.includes("test") || lowerMsg.includes("knowledge check")) {
    const matched = QUIZ_BANK.filter((q) => lowerMsg.includes(q.topic));
    const selected = matched.length > 0
      ? matched[Math.floor(Math.random() * matched.length)]
      : QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
    return {
      type: "quiz",
      question: selected.question,
      options: selected.options,
      correctIndex: selected.correctIndex,
      explanation: selected.explanation,
    };
  }
  if (lowerMsg.includes("reflect") || lowerMsg.includes("meditate") || lowerMsg.includes("silence")) {
    return { type: "reflection", prompt: "Close your eyes and reflect deeply on Imam Ali's words for 60 seconds." };
  }
  return undefined;
}

// ─── Fallback response (no API key) ───────────────────────────────────────────
const FALLBACK_RESPONSES: Record<string, string> = {
  anxiety: `Peace be upon you, dear friend. I understand the weight of anxiety you carry.\n\nIslamic wisdom teaches us: "Do not let your heart be troubled by that which is destined and cannot be averted."\n\nThe Quran assures us: "Verily, in the remembrance of Allah do hearts find rest" (13:28).\n\nSteps for today:\n1. Take 5 slow breaths and recite "La hawla wa la quwwata illa billah"\n2. Write down 3 things within your control and focus only on those\n3. Before sleep, reflect on one blessing you received today`,
  focus: `Peace be upon you! We are taught: "Opportunity passes away like a cloud, so make use of good opportunities."\n\nAlso: "Lost wealth can be replaced by effort, but lost time can never be recovered."\n\nSteps for today:\n1. Put your phone in another room for 45 minutes while studying\n2. Set one clear intention for what you want to accomplish\n3. Remember to focus your energy on what you do well.`,
  patience: `Peace be upon you. Authentic wisdom teaches: "Patience is of two kinds: patience over what pains you, and patience against what you covet."\n\nAlso: "The one who has patience will never be deprived of success, even though it may take a long time."\n\nSteps for today:\n1. When frustration arises, pause and say "Inna lillahi wa inna ilayhi rajioon"\n2. Journal one lesson this hardship is teaching you\n3. Remember that stars shine brightest in the darkest nights`,
  time: `Peace be upon you! Profound wisdom about time management reminds us:\n\n"Opportunity passes away like a cloud, so make use of good opportunities."\n\n"Lost wealth can be replaced by effort, but lost time can never be recovered."\n\nSteps for today:\n1. Prioritize your most important task first thing in the morning\n2. Block distractions for focused work periods of 45 minutes\n3. Before sleeping, plan tomorrow's 3 most important tasks`,
  general: `Peace be upon you, dear friend!\n\nIslamic teachings remind us to: "Make yourself the judge between yourself and others. Wish for others what you wish for yourself."\n\nAlso: "Your remedy is within you, but you do not sense it."\n\nSteps for today:\n1. Take a moment of quiet reflection — even 2 minutes of stillness\n2. Identify one small good deed you can do before the day ends\n3. Seek out beneficial knowledge and let it guide your actions today`,
};

// ─── Main Route Handler ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const REQUEST_START = Date.now();
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: \`ai:chat:\${ip}\`, limit: 15, windowMs: 60000 });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before asking another question." },
      { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } }
    );
  }

  try {
    const rawBody = await request.json();
    const message = rawBody.message || "";
    const history = rawBody.history || [];
    // Support both direct message and Vercel AI SDK message array format
    const messages = rawBody.messages;
    const userMessage = messages
      ? (messages[messages.length - 1]?.content || "")
      : message;

    const detectedTopics = detectTopics(userMessage);

    // ── Cache check: return instantly for repeated queries ──────────────────
    const cached = getCachedResponse(userMessage);
    if (cached) {
      console.log("[Chat] Cache hit for query:", userMessage.slice(0, 60));
      return NextResponse.json({
        success: true,
        reply: cached.reply,
        topics: cached.topics,
        relatedWisdom: cached.relatedWisdom,
        cached: true,
      });
    }

    const encoder = new TextEncoder();
    const apiKey = process.env.GEMINI_API_KEY;

    // Immediately start the stream so the client gets a connection.
    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          // Send retrieving status immediately
          controller.enqueue(
            encoder.encode(\`event: \${STATUS.RETRIEVING}\ndata: \${JSON.stringify({ status: "retrieving" })}\n\n\`)
          );

          const conversationHistory = (messages || history || [])
            .slice(-6)
            .map((m: any) => \`\${m.role === "user" ? "User" : "Assistant"}: \${m.content}\`)
            .join("\\n");

          let ragPayload: Awaited<ReturnType<typeof searchRAGContextWithConfidence>> = {
            results: [],
            isSpecificReferenceQuery: false,
            hasVerifiedMatch: false,
            queryIntent: "general_inquiry",
          };
          const retrievalStart = Date.now();
          
          try {
            ragPayload = await withTimeout(
              searchRAGContextWithConfidence(userMessage, 5), 
              RETRIEVAL_TIMEOUT_MS, 
              "searchRAGContextWithConfidence"
            );
            console.log(\`[Chat] ⏱ retrieval: total=\${Date.now() - retrievalStart}ms (topics=\${detectedTopics.join(",")}, specificRef=\${ragPayload.isSpecificReferenceQuery}, verified=\${ragPayload.hasVerifiedMatch})\`);
          } catch (retrievalErr) {
            console.warn("[Chat] Retrieval failed/timed out, continuing without RAG:", retrievalErr);
          }

          const contextSnippets: string[] = [];

          if (ragPayload.isSpecificReferenceQuery && !ragPayload.hasVerifiedMatch) {
            contextSnippets.push(
              \`• [SYSTEM ALERT — SPECIFIC REFERENCE NOT FOUND]: The user asked for a specific reference (Sermon/Letter/Ayah/Hadith) that is NOT found in our verified database. YOU MUST NOT FABRICATE OR GUESS. Explicitly inform the user that this specific reference is not found in our verified collection.\`
            );
          } else {
            contextSnippets.push(
              ...ragPayload.results.map((r) => \`• [RAG Citation — \${r.source}]: "\${r.content}"\${r.slug ? \` (Link: /wisdom/\${r.slug})\` : ""}\`)
            );
          }

          const relatedWisdomPayload = ragPayload.results.slice(0, 3).map((w) => ({
            title: w.source,
            slug: w.slug || "",
            quote: w.content.substring(0, 100) + "...",
            category: detectedTopics[0] || "General",
          }));

          // Send composing status
          controller.enqueue(
            encoder.encode(\`event: \${STATUS.COMPOSING}\ndata: \${JSON.stringify({ status: "composing" })}\n\n\`)
          );

          // ── Build system prompt ─────────────────────────────────────────────────
          const systemPrompt = \`You are an AI Guidance Assistant, a deeply knowledgeable, authentic, and empathetic AI assistant.

CORE PRINCIPLES — DIRECT, RELEVANT & CONVERSATIONAL:
1. Direct Answers First:
   - Always answer what the user asked directly without generic filler preambles, artificial greetings on every turn, or beating around the bush.
   - Vary your response structure to fit the user's specific intent. Do NOT force an identical robotic template onto every query.

2. ZERO-HALLUCINATION & CITATION INTEGRITY (STRICT THEOLOGICAL RULE):
   - NEVER invent, fabricate, or guess numbers, references, or quotes attributed to the Quran, or verified sources.
   - If the user asks for a specific reference that is not present in the verified context or does not exist, explicitly inform the user that this specific reference is not found in our verified collection. NEVER invent a quote to satisfy the request.
   - When explicitly refusing a specific reference, DO NOT add external meta-facts about the collection unless it is explicitly present in the verified context.
   - When citing, quote verbatim from the verified database context provided below. You MUST explicitly state the exact source and number in your response.

3. Intent-Specific Guidelines:
   - Personalities, Scholars & Leaders:
     Provide an accurate, detailed, and direct overview of who they are, their role, scholarship, key works, philosophy, and contributions. Do NOT divert into unrelated sources or force action steps unless the user asked for reading recommendations.
   - Life Challenges & Emotional Guidance:
     Provide compassionate, insightful, and practical advice grounded in wisdom and teachings on the soul and mind. Provide 2-3 realistic, gentle action steps.
   - Religion, Hadith & Duas:
     When quoting an Ayah, Hadith, or Dua, provide the authentic source/citation along with authentic text/translations. Only include quotes when they genuinely enrich the answer — do not force random verses into unrelated questions.
   - General Knowledge & Everyday Inquiries:
     Answer clearly, intelligently, and helpfully. Do not force a quote where it does not naturally belong.

4. Language Matching:
   - If the user writes in Roman Urdu/Hindi, respond naturally in the same language or clear bilingual Urdu/English.
   - If the user writes in English, Urdu script, or Arabic, respond accordingly.

5. FORMATTING RULES (STRICT):
   - NEVER use Markdown formatting of any kind (no **, no ##, no backticks, no --- dividers, no markdown bullet stars).
   - Write in flowing, natural prose with clean line breaks.
   - Standard numbered lists (1. 2. 3.) are acceptable when providing steps.
   - Arabic and Urdu scripts should appear inline cleanly in their authentic script.

MATCHING CONTEXT FROM DATABASE:
\${contextSnippets.length > 0 ? contextSnippets.join("\\n") : "No specific local database entries matched. Use your vast, authentic general knowledge without fabricating specific references."}

\${conversationHistory ? \`CONVERSATION HISTORY:\\n\${conversationHistory}\` : ""}\`;

          const fullPrompt = \`\${systemPrompt}\\n\\nUser: \${userMessage}\`;
          const estPromptTokens = Math.ceil(fullPrompt.length / 4);
          console.log(\`[Chat] 📦 prompt chars=\${fullPrompt.length}, estTokens≈\${estPromptTokens}\`);

          // ── No API key — use static fallback ───────────────────────────────────
          if (!apiKey) {
            const primaryTopic = detectedTopics[0] || "general";
            let fallbackReply = FALLBACK_RESPONSES[primaryTopic] || FALLBACK_RESPONSES.general;
            if (ragPayload.results.length > 0) {
              fallbackReply += \`\\n\\nFrom our collection, we found this insight: "\${ragPayload.results[0].content}" (\${ragPayload.results[0].source})\`;
            }
            controller.enqueue(
              encoder.encode(
                \`event: \${STATUS.DONE}\\ndata: \${JSON.stringify({
                  reply: fallbackReply,
                  topics: detectedTopics,
                  relatedWisdom: relatedWisdomPayload,
                  timedOut: false,
                })}\\n\\n\`
              )
            );
            controller.close();
            return;
          }

          // ── Standard Generation with Streaming ──────────────────────────────────
          const genStart = Date.now();
          console.log("[Chat] Requesting streaming generation");
          const stream = await withTimeout(
            streamGeminiWithFailover(fullPrompt, apiKey, {
              temperature: 0.7,
              maxOutputTokens: 1500,
            }),
            GENERATION_TIMEOUT_MS,
            "streamGeminiWithFailover"
          );
          const streamEstablishedMs = Date.now() - genStart;
          console.log(\`[Chat] ⏱ stream established in \${streamEstablishedMs}ms\`);

          const reader = stream.getReader();
          let fullText = "";
          const deadline = Date.now() + GENERATION_TIMEOUT_MS;
          let firstTokenAt: number | null = null;
          
          while (true) {
            const remaining = deadline - Date.now();
            if (remaining <= 0) {
              throw new Error("Generation exceeded time budget");
            }
            const readResult = await Promise.race([
              reader.read(),
              new Promise<{ done: boolean; value?: string }>((_, reject) => {
                setTimeout(() => reject(new Error("Stream stalled")), remaining);
              }),
            ]);
            const { done, value } = readResult as { done: boolean; value?: string };
            if (done) break;
            if (firstTokenAt === null) {
              firstTokenAt = Date.now();
            }
            if (value) {
              fullText += value;
              controller.enqueue(
                encoder.encode(\`event: chunk\\ndata: \${JSON.stringify({ text: value })}\\n\\n\`)
              );
            }
          }

          const sanitized = sanitizeAIResponse(fullText);
          const lowerMsg = (userMessage + " " + sanitized).toLowerCase();
          const widget = buildWidget(lowerMsg);

          console.log(\`[Chat] ⏱ TOTAL end-to-end: \${Date.now() - REQUEST_START}ms\`);

          setCachedResponse(userMessage, {
            reply: sanitized,
            topics: detectedTopics,
            relatedWisdom: relatedWisdomPayload,
          });

          // Fire-and-forget: log this query for trending suggestions (does not block stream)
          if (isSupabaseConfigured && supabase && userMessage.length < 300) {
            const topic = detectedTopics[0] || "general";
            supabase.rpc("upsert_chat_query", {
              p_query: userMessage,
              p_topic: topic,
            }).then(() => {}).catch(() => {}); // intentionally silent
          }

          controller.enqueue(
            encoder.encode(
              \`event: \${STATUS.DONE}\\ndata: \${JSON.stringify({
                reply: sanitized,
                topics: detectedTopics,
                widget,
                relatedWisdom: relatedWisdomPayload,
                timedOut: false,
              })}\\n\\n\`
            )
          );
          controller.close();
        } catch (streamErr: any) {
          console.warn("[Chat] Stream aborted or failed:", streamErr?.message);
          controller.enqueue(
            encoder.encode(
              \`event: \${STATUS.ERROR}\\ndata: \${JSON.stringify({
                error: streamErr?.message || "The response took too long. Please try again.",
                timedOut: true,
              })}\\n\\n\`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
