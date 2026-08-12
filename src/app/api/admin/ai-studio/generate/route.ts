import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split("; ").find((r) => r.trim().startsWith("thenahj-admin="))?.split("=")[1];
  const isAuth = await verifyAdminToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not configured" }, { status: 500 });
    }

    const systemPrompt = `You are "TheNahj Master AI Studio", a top-tier Islamic Scholar & Editorial Content Creator specialized in Nahjul Balagha and authentic teachings of the Ahlulbayt (AS).

Your task is to generate a COMPLETE, publication-ready Wisdom Card for the topic: "${topic}".

YOU MUST STRICTLY FOLLOW THIS MASTER STRUCTURE AND ALL 18 WRITING/FORMATTING RULES BELOW:

### MASTER RULES:
1. Content MUST be 100% publication-ready.
2. Main Explanation, Detailed Explanation, Tafseer, Historical Context, Modern Relevance, Personal Reflection, Summary, and Closing Reflection MUST use proper flowing editorial paragraphs. DO NOT use fragmented 1-sentence lines.
3. DO NOT use Markdown auto-numbering.
4. ANY numbered list (Current Issues, Practical Application, Reflection Questions, Action Steps) MUST BE WRITTEN INSIDE PLAIN-TEXT CODE BLOCKS (\`\`\`text ... \`\`\`) with explicit "1. ", "2. ", "3. " text so that numbers are literal copyable text.
5. Provide 8 to 10 thoughtful Reflection Questions inside plain-text code blocks.
6. Provide 4 to 5 realistic Action Steps inside plain-text code blocks.
7. Original wisdom and modern interpretation MUST be clearly distinguished. Never claim Imam Ali (AS) directly spoke about modern devices/apps unless authentic.
8. Related Narrations should follow preferred order: Prophet Muhammad (SAW) -> Imam Ali (AS) -> Imam Sajjad (AS) -> Other Imams. DO NOT invent narrations. Use authentic, properly attributed narrations.
9. Include genuine student & youth practical application.

OUTPUT MUST BE A VALID JSON OBJECT WITH EXACTLY THIS SCHEMA:

{
  "basicInfo": {
    "title": "Title of the card",
    "slug": "url-friendly-slug",
    "excerpt": "Short 1-2 sentence compelling summary",
    "category": "Youth Corner",
    "status": "Published",
    "schedule": "Immediate",
    "taxonomyMapping": "Required",
    "theme": "Gold Luxe",
    "topic": "${topic}",
    "audienceMapping": "Youth",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "originalWisdom": {
    "arabicText": "Arabic text here with harakat",
    "urduTranslation": "Urdu translation here",
    "englishTranslation": "English translation here",
    "source": "Nahjul Balagha",
    "sourceNumber": "Saying / Sermon / Letter Number",
    "bookName": "Nahjul Balagha",
    "sourceNote": "Authenticity note or book context"
  },
  "explanationArea": {
    "mainExplanation": "Flowing editorial paragraphs...",
    "detailedExplanation": "Deeper explanation linking to youth/student real life...",
    "tafseer": "Deeper spiritual & moral lessons...",
    "historicalContext": "Historical background..."
  },
  "relatedNarrations": [
    {
      "arabicText": "Arabic text",
      "urduTranslation": "Urdu text",
      "englishTranslation": "English text",
      "narrator": "Prophet Muhammad (SAW) / Imam Ali (AS)",
      "source": "Book citation",
      "explanation": "Brief explanation"
    }
  ],
  "modernRelevance": {
    "currentIssues": "\`\`\`text\\n1. Issue One\\n\\n2. Issue Two\\n\\n3. Issue Three\\n\\n4. Issue Four\\n\`\`\`",
    "youthRelevance": "Flowing paragraphs linking to young people's lives...",
    "studentRelevance": "Flowing paragraphs linking to academic & student daily life...",
    "practicalApplication": "\`\`\`text\\n1. Practical Step One\\n\\n2. Practical Step Two\\n\\n3. Practical Step Three\\n\\n4. Practical Step Four\\n\`\`\`"
  },
  "reflection": {
    "reflectionQuestions": "\`\`\`text\\n1. Question 1?\\n\\n2. Question 2?\\n\\n3. Question 3?\\n\\n4. Question 4?\\n\\n5. Question 5?\\n\\n6. Question 6?\\n\\n7. Question 7?\\n\\n8. Question 8?\\n\`\`\`",
    "actionSteps": "\`\`\`text\\n1. Action step one.\\n\\n2. Action step two.\\n\\n3. Action step three.\\n\\n4. Action step four.\\n\\n5. Action step five.\\n\`\`\`",
    "personalReflection": "Flowing emotional & spiritual editorial paragraphs..."
  },
  "conclusion": {
    "summary": "Complete takeaway in proper flowing paragraphs...",
    "closingReflection": "Closing reflection connecting wisdom to present life..."
  }
}

Return ONLY the raw JSON object. Do not include markdown code block formatting (like \`\`\`json) outside the JSON object itself.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Failed to generate wisdom card content" }, { status: 500 });
    }

    const cleanJsonText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsedCard = JSON.parse(cleanJsonText);

    return NextResponse.json({
      success: true,
      topic,
      card: parsedCard,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate master wisdom card" }, { status: 500 });
  }
}
