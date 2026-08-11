import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { getAllWisdom } from "@/lib/wisdom";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `ai:chat:${ip}`, limit: 15, windowMs: 60000 });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before asking another question." },
      { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } }
    );
  }

  try {
    const rawBody = await request.json();
    const validation = chatSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.format() }, { status: 400 });
    }

    const { message } = validation.data;

    // Search local wisdom cards for relevant context match
    const allWisdom = await getAllWisdom();
    const searchTerms = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    const relevantWisdom = allWisdom
      .filter((w) => {
        const text = `${w.english_translation} ${w.urdu_translation} ${w.source} ${w.category?.name || ""}`.toLowerCase();
        return searchTerms.some((term) => text.includes(term));
      })
      .slice(0, 3);

    const contextSnippets = relevantWisdom.map(
      (w) => `• [${w.source} (${w.category?.name || "Wisdom"})]: "${w.english_translation}" (Slug: ${w.slug})`
    );

    const systemPrompt = `You are "TheNahj AI Guidance Assistant", a compassionate, wise, and respectful advisor grounded in the teachings of Imam Ali (AS), Nahjul Balagha, and Islamic wisdom for youth and students.
Your goal is to help modern students and young people navigate emotional struggles (anxiety, focus, relationships, purpose, discipline) through the lens of Imam Ali's teachings.

Rules:
1. Speak warmly, respectfully, and thoughtfully (use terms like "My dear friend" or "Peace be upon you").
2. Reference Imam Ali (AS) or Nahjul Balagha whenever relevant.
3. Keep answers concise (under 200 words), encouraging, and practical with 1-2 actionable steps.
4. If relevant wisdom cards are provided below, mention them naturally and quote them.

Context from site wisdom database:
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "No specific exact match found; rely on general teachings of Imam Ali (AS)."}
`;

    // Attempt Gemini API if key is set
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser Question: ${message}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return NextResponse.json({
            success: true,
            reply,
            relatedWisdom: relevantWisdom.map((w) => ({ title: w.source, slug: w.slug, quote: w.english_translation })),
          });
        }
      }
    }

    // Heuristic Fallback Advisor Response if API key is not configured
    let fallbackReply = `Peace be upon you! Imam Ali (AS) teaches us that "The value of every person is according to what he excels in."\n\nWhen dealing with challenges like "${message}", remember that patience (Sabr) and intentional action build true inner strength. Take a deep breath, dedicate a few minutes to quiet reflection, and break your task into small, manageable steps.`;

    if (relevantWisdom.length > 0) {
      fallbackReply = `Peace be upon you! Regarding your question, Imam Ali (AS) reminds us: "${relevantWisdom[0].english_translation}" (from ${relevantWisdom[0].source}).\n\nFocus on what is within your control today. Practice patience, guard your time, and remember that consistent small efforts lead to great wisdom.`;
    }

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      relatedWisdom: relevantWisdom.map((w) => ({ title: w.source, slug: w.slug, quote: w.english_translation })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
