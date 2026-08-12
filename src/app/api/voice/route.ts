import { NextResponse } from "next/server";
import { fetchGeminiWithFailover } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an empathetic, conversational Voice AI Assistant representing "TheNahj".
A user is speaking to you using their voice: "${message}".

Your goal is to provide a very short, comforting, and spoken-friendly response (max 2-3 sentences).
Do not use bullet points, bold text, markdown, or emojis. Speak like a wise human mentor.
Always include one short quote from Imam Ali (AS) relevant to their problem in your response.

Example response format:
"I hear you. It is completely normal to feel stressed about your exams. Remember the words of Imam Ali: 'Patience is of two kinds: patience over what pains you, and patience against what you covet.' Take a deep breath, do your best, and leave the rest to the Almighty."`;

    const replyText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.6,
      maxOutputTokens: 250,
    });

    return NextResponse.json({ success: true, reply: replyText.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
