import { NextResponse } from "next/server";
import { fetchGeminiWithFailover } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { situation } = await request.json();

    if (!situation || typeof situation !== "string" || situation.trim().length === 0) {
      return NextResponse.json({ error: "Situation is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a highly empathetic Islamic scholar representing "TheNahj". 
A user has submitted a real-life situation they are struggling with: "${situation}".
Your task is to analyze their situation and provide a deeply relevant piece of wisdom from Imam Ali (AS) or Nahjul Balagha.

Return a JSON object with this exact structure:
{
  "empathyMessage": "A short, 1-2 sentence empathetic validation of their struggle.",
  "recommendedWisdom": {
    "topic": "e.g., Patience, Jealousy, Focus",
    "arabicText": "Arabic text of the quote",
    "englishTranslation": "English translation",
    "source": "e.g., Saying 42"
  },
  "practicalAdvice": "A short 2-3 sentence practical advice on how to apply this quote to their exact situation.",
  "suggestedSearchLink": "A short URL-friendly slug based on the topic, e.g., 'patience-under-stress'"
}

Return ONLY the raw JSON object. Do not wrap in markdown \`\`\`json.`;

    const rawText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.3,
      maxOutputTokens: 800,
      responseMimeType: "application/json",
    });

    const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
