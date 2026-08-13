import { NextResponse } from "next/server";
import { fetchGeminiWithFailover, parseRobustJson } from "@/lib/gemini";
import { verifyAdminToken } from "@/lib/auth";
import { z } from "zod";

// Zod Schema to strictly validate the 7 Master Sections
const MasterWisdomCardSchema = z.object({
  basicInfo: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    excerpt: z.string().min(1),
    category: z.string().default("Youth Corner"),
    status: z.string().default("Published"),
    schedule: z.string().default("Immediate"),
    taxonomyMapping: z.string().default("Required"),
    theme: z.string().default("Gold Luxe"),
    topic: z.string().min(1),
    audienceMapping: z.string().default("Youth"),
    tags: z.array(z.string()).default([]),
  }),
  originalWisdom: z.object({
    arabicText: z.string().min(1),
    urduTranslation: z.string().min(1),
    englishTranslation: z.string().min(1),
    source: z.string().default("Nahjul Balagha"),
    sourceNumber: z.string().default("Saying"),
    bookName: z.string().default("Nahjul Balagha"),
    sourceNote: z.string().optional().default(""),
  }),
  explanationArea: z.object({
    mainExplanation: z.string().min(1),
    detailedExplanation: z.string().min(1),
    tafseer: z.string().min(1),
    historicalContext: z.string().min(1),
  }),
  relatedNarrations: z.array(
    z.object({
      arabicText: z.string().optional().default(""),
      urduTranslation: z.string().optional().default(""),
      englishTranslation: z.string().optional().default(""),
      narrator: z.string().default("Prophet Muhammad (SAW)"),
      source: z.string().default("Authentic Source"),
      explanation: z.string().optional().default(""),
    })
  ).default([]),
  modernRelevance: z.object({
    currentIssues: z.string().min(1),
    youthRelevance: z.string().min(1),
    studentRelevance: z.string().min(1),
    practicalApplication: z.string().min(1),
  }),
  reflection: z.object({
    reflectionQuestions: z.string().min(1),
    actionSteps: z.string().min(1),
    personalReflection: z.string().min(1),
  }),
  conclusion: z.object({
    summary: z.string().min(1),
    closingReflection: z.string().min(1),
  }),
});

// Helper to enforce plain-text code block formatting for numbered lists
function ensureCodeBlockFormatting(text: string): string {
  if (!text) return "";
  if (text.includes("```text") || text.includes("```")) {
    return text;
  }
  // Wrap list inside ```text codeblock
  return "```text\n" + text.trim() + "\n```";
}

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not configured" }, { status: 500 });
    }

    const systemPrompt = `You are "TheNahj Master AI Studio", a top-tier Senior Islamic Scholar & Editorial Content Creator specialized in Nahjul Balagha and authentic teachings of the Ahlulbayt (AS).

Your task is to generate a COMPLETE, HIGHLY DETAILED, and COMPREHENSIVE publication-ready Wisdom Card for the topic: "${topic}".

YOU MUST STRICTLY FOLLOW THIS MASTER STRUCTURE AND ALL 18 WRITING/FORMATTING RULES BELOW:

### MASTER RULES:
1. Content MUST be 100% publication-ready.
2. Main Explanation, Detailed Explanation, Tafseer, Historical Context, Modern Relevance, Personal Reflection, Summary, and Closing Reflection MUST be EXTENSIVELY DETAILED (minimum 3-4 deep, flowing paragraphs each). DO NOT write brief summaries. Provide deep theological, spiritual, and practical analysis.
3. DO NOT use Markdown auto-numbering.
4. ANY numbered list (Current Issues, Practical Application, Reflection Questions, Action Steps) MUST BE WRITTEN INSIDE PLAIN-TEXT CODE BLOCKS (\`\`\`text ... \`\`\`) with explicit "1. ", "2. ", "3. " text so that numbers are literal copyable text.
5. Provide 8 to 10 highly introspective and deeply probing Reflection Questions inside plain-text code blocks.
6. Provide 5 to 7 highly actionable, realistic, and specific Action Steps inside plain-text code blocks.
7. Original wisdom and modern interpretation MUST be clearly distinguished. Never claim Imam Ali (AS) directly spoke about modern devices/apps unless authentic.
8. Related Narrations MUST include exactly 3 to 5 distinct narrations. ALL FIELDS MUST BE FILLED (Arabic Text, Urdu, English, Narrator, Source, and Explanation). Do NOT leave Arabic or Urdu empty. Use preferred order: Prophet Muhammad (SAW) -> Imam Ali (AS) -> Imam Sajjad (AS) -> Other Imams. DO NOT invent narrations. Use authentic, properly attributed narrations.
9. Include genuine, highly detailed student & youth practical application.

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
    "mainExplanation": "Extensive flowing editorial paragraphs of deep explanation...",
    "detailedExplanation": "Extensive deeper explanation linking to youth/student real life...",
    "tafseer": "Extensive spiritual & moral lessons and theological breakdown...",
    "historicalContext": "Detailed historical background and context of the narration..."
  },
  "relatedNarrations": [
    {
      "arabicText": "Full Arabic text here",
      "urduTranslation": "Full Urdu translation here",
      "englishTranslation": "Full English translation here",
      "narrator": "Prophet Muhammad (SAW)",
      "source": "Book citation (e.g., Bihar al-Anwar)",
      "explanation": "Brief context or explanation of how this relates"
    },
    {
      "arabicText": "Full Arabic text here",
      "urduTranslation": "Full Urdu translation here",
      "englishTranslation": "Full English translation here",
      "narrator": "Imam Ali (AS)",
      "source": "Book citation",
      "explanation": "Brief context or explanation of how this relates"
    },
    {
      "arabicText": "Full Arabic text here",
      "urduTranslation": "Full Urdu translation here",
      "englishTranslation": "Full English translation here",
      "narrator": "Imam Sadiq (AS)",
      "source": "Book citation",
      "explanation": "Brief context or explanation of how this relates"
    }
  ],
  "modernRelevance": {
    "currentIssues": "\`\`\`text\\n1. Deeply analyzed issue 1\\n\\n2. Deeply analyzed issue 2\\n\\n3. Deeply analyzed issue 3\\n\\n4. Deeply analyzed issue 4\\n\`\`\`",
    "youthRelevance": "Extensive flowing paragraphs linking to young people's modern challenges...",
    "studentRelevance": "Extensive flowing paragraphs linking to academic & student daily life...",
    "practicalApplication": "\`\`\`text\\n1. Highly specific practical step 1\\n\\n2. Highly specific practical step 2\\n\\n3. Highly specific practical step 3\\n\\n4. Highly specific practical step 4\\n\`\`\`"
  },
  "reflection": {
    "reflectionQuestions": "\`\`\`text\\n1. Deep Question 1?\\n\\n2. Deep Question 2?\\n\\n3. Deep Question 3?\\n\\n4. Deep Question 4?\\n\\n5. Deep Question 5?\\n\\n6. Deep Question 6?\\n\\n7. Deep Question 7?\\n\\n8. Deep Question 8?\\n\`\`\`",
    "actionSteps": "\`\`\`text\\n1. Specific action step 1.\\n\\n2. Specific action step 2.\\n\\n3. Specific action step 3.\\n\\n4. Specific action step 4.\\n\\n5. Specific action step 5.\\n\`\`\`",
    "personalReflection": "Extensive, deeply emotional & spiritual editorial paragraphs..."
  },
  "conclusion": {
    "summary": "Complete and extensive takeaway in proper flowing paragraphs...",
    "closingReflection": "Deep closing reflection connecting wisdom to present life..."
  }
}

Return ONLY the raw JSON object. Do not include markdown code block formatting (like \`\`\`json) outside the JSON object itself.`;

    const rawText = await fetchGeminiWithFailover(systemPrompt, apiKey, {
      temperature: 0.3,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    });

    const parsedRaw = parseRobustJson(rawText);

    // Validate Schema with Zod
    const validatedCard = MasterWisdomCardSchema.parse(parsedRaw);

    // Enforce Rule #4: Auto-correct code block formatting for all numbered lists
    validatedCard.modernRelevance.currentIssues = ensureCodeBlockFormatting(validatedCard.modernRelevance.currentIssues);
    validatedCard.modernRelevance.practicalApplication = ensureCodeBlockFormatting(validatedCard.modernRelevance.practicalApplication);
    validatedCard.reflection.reflectionQuestions = ensureCodeBlockFormatting(validatedCard.reflection.reflectionQuestions);
    validatedCard.reflection.actionSteps = ensureCodeBlockFormatting(validatedCard.reflection.actionSteps);

    return NextResponse.json({
      success: true,
      topic,
      card: validatedCard,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate master wisdom card" }, { status: 500 });
  }
}
