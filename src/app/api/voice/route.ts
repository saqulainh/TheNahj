import { NextResponse } from "next/server";
import { fetchGeminiWithFailover } from "@/lib/gemini";
import { getAllWisdom } from "@/lib/wisdom";
import { searchRAGContext } from "@/lib/rag/retrieval";

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

    // 1. Fetch Wisdom and perform RAG search
    let allWisdom: Awaited<ReturnType<typeof getAllWisdom>> = [];
    let ragResults: Awaited<ReturnType<typeof searchRAGContext>> = [];
    try {
      allWisdom = await getAllWisdom();
      ragResults = await searchRAGContext(message, 3, allWisdom);
    } catch (e) {
      console.error("[Voice API] RAG retrieval failed:", e);
    }

    const searchTerms = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const relevantWisdom = allWisdom
      .filter((w) => {
        const text = `${w.english_translation} ${w.source} ${(w.corner_topics || []).join(" ")}`.toLowerCase();
        return searchTerms.some((term: string) => text.includes(term));
      })
      .slice(0, 2);

    const contextSnippets = [
      ...ragResults.map((r) => `[RAG Citation - ${r.source}]: "${r.content}"`),
      ...relevantWisdom.map((w) => `[Wisdom Card - ${w.source}]: Arabic: "${w.arabic_text || 'N/A'}" | Urdu: "${w.urdu_translation || 'N/A'}" | English: "${w.english_translation}"`),
    ];

    const systemPrompt = `You are an empathetic, conversational Voice AI Assistant representing "TheNahj".
A user is speaking to you using their voice: "${message}".

Your goal is to provide a very short, comforting, and spoken-friendly response (max 2-3 sentences).
Do not use bullet points, bold text, markdown, or emojis. Speak like a wise human mentor.
Always include one short quote from Imam Ali (AS) relevant to their problem in your response.

MATCHING WISDOM FROM OUR DATABASE (Use this if relevant):
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "No exact match found in local database."}

CRITICAL RULES:
1. When you quote an Ayah, Hadith, saying of Imam Ali, or a Dua, YOU MUST ALWAYS provide it in three languages in this exact order: 
   First: Original Arabic text
   Second: Urdu translation
   Third: English translation
2. Do not use quotes or special characters that sound weird when spoken by a Text-to-Speech engine. Keep it plain text.

Example response format:
I hear you. It is completely normal to feel stressed about your exams. Remember the words of Imam Ali:
الصبر مفتاح الفرج
صبر ہر مشکل کی کنجی ہے۔
Patience is the key to relief. 
Take a deep breath, do your best, and leave the rest to the Almighty.`;

    const replyText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.6,
      maxOutputTokens: 500,
    });

    return NextResponse.json({ success: true, reply: replyText.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
