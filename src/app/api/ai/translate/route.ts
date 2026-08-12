import { NextResponse } from "next/server";
import { fetchGeminiWithFailover } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a professional translator specializing in Islamic texts and literature.
Translate the following English text accurately into ${targetLanguage}.
Ensure the tone is respectful, philosophical, and culturally appropriate.
Do not add any explanations or notes. Return ONLY the translated text.

TEXT TO TRANSLATE:
${text}`;

    const translatedText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.1,
      maxOutputTokens: 2000,
    });

    if (!translatedText) {
      throw new Error("Failed to generate translation");
    }

    return NextResponse.json({ success: true, translation: translatedText.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
