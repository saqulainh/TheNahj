import { NextResponse } from "next/server";
import { fetchGeminiWithFailover, parseRobustJson } from "@/lib/gemini";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/rag/embeddings";

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

    // 1. Vector Search (RAG)
    let contextText = "";
    if (isSupabaseConfigured && supabase) {
      const embedding = await generateEmbedding(situation);
      if (embedding) {
        const { data, error } = await supabase.rpc("match_wisdom_embeddings", {
          query_embedding: embedding,
          match_threshold: 0.2, // lowered threshold for broader matching
          match_count: 3
        });
        
        if (!error && data && data.length > 0) {
          contextText = "Here are some relevant authentic wisdom pieces from our database:\n";
          data.forEach((doc: any, i: number) => {
            contextText += `\n[Reference ${i+1}] Source: ${doc.metadata?.source || "Nahjul Balagha"}\nContent: ${doc.content}\n`;
          });
        }
      }
    }

    const systemPrompt = `You are a highly empathetic Islamic scholar representing "TheNahj". 
A user has submitted a real-life situation they are struggling with: "${situation}".

${contextText ? `IMPORTANT CONTEXT:\n${contextText}\nUse the references above to find a highly accurate quote.` : "Provide a deeply relevant piece of wisdom from Imam Ali (AS) or Nahjul Balagha."}

Your task is to analyze their situation and provide a deeply relevant piece of wisdom.

Return a JSON object with this exact structure:
{
  "empathyMessage": "A short, 1-2 sentence empathetic validation of their struggle.",
  "recommendedWisdom": {
    "topic": "e.g., Patience, Jealousy, Focus",
    "arabicText": "Arabic text of the quote (if available)",
    "englishTranslation": "English translation",
    "source": "e.g., Saying 42"
  },
  "practicalAdvice": "A short 2-3 sentence practical advice on how to apply this quote to their exact situation.",
  "suggestedSearchLink": "A short URL-friendly slug based on the topic, e.g., 'patience-under-stress'"
}

Return ONLY the raw JSON object. Do not wrap in markdown \`\`\`json.`;

    const rawText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.3,
      maxOutputTokens: 1500,
      responseMimeType: "application/json",
    });

    const parsedData = parseRobustJson(rawText);

    // Verify if suggestedSearchLink matches an actual article or fallback to search query
    let matchingSlug: string | null = null;
    if (parsedData?.suggestedSearchLink && isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("wisdom_cards")
        .select("slug")
        .eq("slug", parsedData.suggestedSearchLink)
        .maybeSingle();
      if (data?.slug) {
        matchingSlug = data.slug;
      }
    }

    return NextResponse.json({ 
      success: true, 
      result: {
        ...parsedData,
        matchingSlug
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
