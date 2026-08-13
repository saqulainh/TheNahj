import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { fetchGeminiWithFailover, parseRobustJson } from "@/lib/gemini";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split("; ").find((r) => r.trim().startsWith("thenahj-admin="))?.split("=")[1];
  const isAuth = await verifyAdminToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { topic, sectionKey, currentWisdom } = await request.json();

    if (!topic || !sectionKey) {
      return NextResponse.json({ error: "Topic and sectionKey are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const prompt = `You are "TheNahj Master AI Studio". 
Topic: "${topic}"
Quote Context: "${currentWisdom || topic}"

Regenerate ONLY the section: "${sectionKey}".
Rules: 
1. Use extremely deep, extensively detailed, publication-ready flowing editorial paragraphs. Provide profound theological, spiritual, and practical analysis. DO NOT write short summaries.
2. If generating lists (like Reflection Questions or Action Steps), provide 8-10 deeply probing questions or 5-7 highly specific action steps. Wrap these lists strictly inside \`\`\`text ... \`\`\` code blocks.
3. If regenerating narrations, ensure ALL fields (Arabic, Urdu, English, Narrator, Source, Explanation) are fully populated and authentic.

Return ONLY a valid JSON object containing the refreshed data for "${sectionKey}".`;

    const rawText = await fetchGeminiWithFailover(prompt, apiKey, {
      temperature: 0.5,
      maxOutputTokens: 2500,
      responseMimeType: "application/json",
    });

    const parsedData = parseRobustJson(rawText);

    return NextResponse.json({
      success: true,
      sectionKey,
      data: parsedData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to regenerate section" }, { status: 500 });
  }
}
