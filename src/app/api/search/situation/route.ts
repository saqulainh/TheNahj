import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { situation } = await request.json();

    if (!situation || typeof situation !== "string" || situation.trim().length === 0) {
      return NextResponse.json({ error: "Situation is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
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

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          ...(apiKey.startsWith("AQ.") ? { "Authorization": `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to process situation" }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) throw new Error("No text generated");

    const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
