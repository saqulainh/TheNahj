import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { fetchGeminiWithFailover } from "@/lib/gemini";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(10, "Provide at least 10 characters of text for AI processing"),
  type: z.enum(["reflection_questions", "action_steps", "seo_description", "full_enhancement"]).default("full_enhancement"),
});

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `ai:generate:${ip}`, limit: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many AI generation requests" }, { status: 429 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const validation = requestSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.format() }, { status: 400 });
    }

    const { title, text } = validation.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are an expert Islamic scholar and content editor for TheNahj platform (focusing on Imam Ali's wisdom for youth and students).
Given the following text:
Title: ${title || "Untitled"}
Content: ${text}

Generate a JSON object with:
1. "reflection_questions": array of 3 deep, personal reflection questions for a modern student/youth.
2. "action_steps": array of 3 practical, daily actionable habits based on this wisdom.
3. "seo_description": concise summary under 160 characters for SEO.
4. "youth_relevance": 2 sentences explaining why this matters to young Muslims today.

Return ONLY valid JSON matching this schema:
{"reflection_questions": [...], "action_steps": [...], "seo_description": "...", "youth_relevance": "..."}`;

        const rawText = await fetchGeminiWithFailover(prompt, apiKey, {
          temperature: 0.3,
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
        });

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, provider: "gemini", result: parsed });
        }
      } catch (geminiErr) {
        console.warn("Gemini generation failed, using heuristic fallback:", geminiErr);
      }
    }

    const summaryText = text.slice(0, 150).replace(/\s+/g, " ").trim();

    const fallbackResult = {
      reflection_questions: [
        `How can you apply the core principle of "${title || "this wisdom"}" in your daily routine?`,
        "What internal distraction or habit currently stops you from embodying this teaching?",
        "How would your character and relationships change if you practiced this consistently for 30 days?",
      ],
      action_steps: [
        "Take 5 minutes every morning to set an intention aligned with this teaching.",
        "Identify one specific action today where you choose patience and self-discipline over impulse.",
        "Share this wisdom with a friend or write down a personal journal reflection about it.",
      ],
      seo_description: `${title ? title + ": " : ""}${summaryText}... Discover Islamic wisdom and reflections for modern youth on TheNahj.`,
      youth_relevance: `In a world of constant digital distraction, ${title || "this teaching"} provides timeless clarity for navigating pressure and maintaining inner focus.`,
    };

    return NextResponse.json({
      success: true,
      provider: apiKey ? "api_fallback" : "heuristic_fallback",
      result: fallbackResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate AI content" }, { status: 500 });
  }
}
