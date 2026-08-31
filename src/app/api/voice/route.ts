import { NextResponse } from "next/server";
import { fetchGeminiWithFailover } from "@/lib/gemini";
import { getAllWisdom } from "@/lib/wisdom";
import { searchRAGContextWithConfidence } from "@/lib/rag/retrieval";

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

    // 1. Fetch Wisdom and perform RAG search with confidence thresholding
    let allWisdom: Awaited<ReturnType<typeof getAllWisdom>> = [];
    let ragPayload: Awaited<ReturnType<typeof searchRAGContextWithConfidence>> = {
      results: [],
      isSpecificReferenceQuery: false,
      hasVerifiedMatch: false,
      queryIntent: "general_inquiry",
    };
    try {
      const results = await Promise.all([
        getAllWisdom(),
        searchRAGContextWithConfidence(message, 3)
      ]);
      allWisdom = results[0];
      ragPayload = results[1];
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

    const contextSnippets: string[] = [];
    if (ragPayload.isSpecificReferenceQuery && !ragPayload.hasVerifiedMatch) {
      contextSnippets.push(
        `[SYSTEM ALERT]: The user asked for a specific sermon/letter/hadith that is NOT found in our verified collection. Explicitly say this reference is not available; DO NOT guess or fabricate.`
      );
    } else {
      contextSnippets.push(
        ...ragPayload.results.map((r) => `[RAG Citation - ${r.source}]: "${r.content}"`),
        ...relevantWisdom.map((w) => `[Wisdom Card - ${w.source}]: Arabic: "${w.arabic_text || 'N/A'}" | Urdu: "${w.urdu_translation || 'N/A'}" | English: "${w.english_translation}"`)
      );
    }

    const systemPrompt = `You are a conversational, warm, and natural Voice AI Assistant representing "TheNahj".
A user is speaking to you: "${message}".

GOAL & CONVERSATIONAL STYLE:
1. Answer directly and naturally (max 2-4 sentences suitable for speech). Do NOT give long generic preambles.
2. ZERO-HALLUCINATION: Never fabricate or guess sermon numbers or quotes. If a requested specific reference is not found in our verified collection, politely state it is not available. DO NOT add external meta-facts about the collection (like total number of sermons) when refusing. When citing, you MUST explicitly state the exact source and number (e.g. "Sermon 31") as provided.
3. If the user asks about a person, historical event, or concept, explain it directly and accurately.
4. If the user shares a struggle (stress, sadness, exams, focus), offer compassionate encouragement and, if relevant, one short authentic quote from Imam Ali (AS) or Ahlulbayt.
5. Language: Match the language and dialect the user speaks in (English, Urdu, or Roman Urdu/Hindi).
6. If providing an Arabic/Urdu quote, include the Arabic, Urdu translation, and English translation cleanly so it sounds natural.
7. Plain text only: Do NOT use markdown symbols, asterisks, or bullet points so the text-to-speech engine speaks smoothly.

VERIFIED CONTEXT:
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "No specific local database entries matched."}`;

    const replyText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.6,
      maxOutputTokens: 500,
    });

    return NextResponse.json({ success: true, reply: replyText.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
