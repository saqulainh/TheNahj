import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { fetchGeminiWithFailover } from "@/lib/gemini";

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
Rules: Use deep, publication-ready flowing editorial paragraphs. If generating lists, wrap inside \`\`\`text ... \`\`\`.

Return ONLY a valid JSON object containing the refreshed data for "${sectionKey}".`;

    const rawText = await fetchGeminiWithFailover(prompt, apiKey, {
      temperature: 0.5,
      maxOutputTokens: 1500,
      responseMimeType: "application/json",
    });

    const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      sectionKey,
      data: parsedData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to regenerate section" }, { status: 500 });
  }
}
