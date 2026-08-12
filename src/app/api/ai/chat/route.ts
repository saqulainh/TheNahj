import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { getAllWisdom } from "@/lib/wisdom";
import { searchRAGContext } from "@/lib/rag/retrieval";
import { z } from "zod";
import { NextResponse } from "next/server";

const NAHJUL_BALAGHA_CORPUS = `
## KEY SERMONS OF IMAM ALI (AS) FROM NAHJUL BALAGHA
### Sermon 1 (Khutba-e-Shiqshiqiyya) - Speaks about the caliphate.
### Sermon 3 (Khutba-e-Jihadiyya) - "I swear by Allah that the son of Abu Talib is more accustomed to death than an infant is to the breast of its mother."
### Sermon 40 (On the Value of Knowledge) - "Knowledge is the most superior form of wealth."
### Sermon 110 (On the Piety) - Describes the qualities of the God-fearing.
## KEY LETTERS
### Letter 31 (To His Son) - "Make yourself the judge between yourself and others. Wish for others what you wish for yourself."
### Letter 53 (To Malik al-Ashtar) - "People are of two kinds: either your brother in faith or your equal in humanity."
## FAMOUS SAYINGS
"Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)
"The value of every person is in what he does well." (Saying 81)
"Do not let your heart be troubled by that which is destined and cannot be averted."
`;

export async function POST(req: Request) {
  const ip = getRequestClientIp(req);
  const rl = await consumeRateLimit({ key: `ai:chat:stream:${ip}`, limit: 30, windowMs: 60000 });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before asking another question." },
      { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } }
    );
  }

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // 1. Context Retrieval (RAG & Local Wisdom)
    const ragResults = await searchRAGContext(lastUserMessage, 5);
    const allWisdom = await getAllWisdom();
    const searchTerms = lastUserMessage.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const relevantWisdom = allWisdom
      .filter((w) => {
        const text = `${w.english_translation} ${w.source} ${(w.corner_topics || []).join(" ")}`.toLowerCase();
        return searchTerms.some((term: string) => text.includes(term));
      })
      .slice(0, 3);

    const contextSnippets = [
      ...ragResults.map((r) => `• [RAG]: "${r.content}"`),
      ...relevantWisdom.map((w) => `• [Wisdom]: "${w.english_translation}" (Source: ${w.source})`),
    ];

    const systemPrompt = `You are "TheNahj AI Guidance Assistant", a deeply knowledgeable, compassionate advisor grounded in the teachings of Imam Ali ibn Abi Talib (AS) and broader Islamic wisdom.

## KNOWLEDGE BASE
${NAHJUL_BALAGHA_CORPUS}

## RESPONSE RULES
1. Draw from Imam Ali (AS), the Prophet (PBUH), and science (priority: imamandscience.com).
2. You have access to Google Search. USE IT if the user asks factual, historical, or scientific questions.
3. Keep answers under 300 words. Be empathetic.
4. End with 1-2 actionable steps.
5. Use tools to trigger interactive widgets if the user needs to breathe, reflect, or be quizzed.

## LOCAL CONTEXT FOR THIS QUERY
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "Use your general knowledge and tools."}`;

    const result = streamText({
      model: google("gemini-2.5-flash", { useSearchGrounding: true }),
      messages,
      system: systemPrompt,
      tools: {
        triggerBreathingWidget: tool({
          description: "Trigger a breathing exercise widget for the user if they feel anxious, stressed, or overwhelmed.",
          parameters: z.object({
            title: z.string().describe("The title of the breathing exercise, e.g. '4-7-8 Calm Breathing'"),
          }),
          execute: async ({ title }) => {
            return { triggered: true, type: "breathing", title };
          },
        }),
        triggerReflectionWidget: tool({
          description: "Trigger a reflection timer widget for the user if they need to pause and think.",
          parameters: z.object({
            prompt: z.string().describe("The prompt to reflect upon."),
          }),
          execute: async ({ prompt }) => {
            return { triggered: true, type: "reflection", prompt };
          },
        }),
        triggerQuizWidget: tool({
          description: "Trigger a knowledge quiz for the user.",
          parameters: z.object({
            question: z.string(),
            options: z.array(z.string()).length(4),
            correctIndex: z.number().min(0).max(3),
            explanation: z.string(),
          }),
          execute: async (params) => {
            return { triggered: true, type: "quiz", ...params };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[Chat Stream Error]", error);
    return NextResponse.json({ error: error.message || "Failed to process chat stream" }, { status: 500 });
  }
}
