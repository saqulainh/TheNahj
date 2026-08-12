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

    const isOAuth = apiKey.startsWith("AQ.");
    const url = isOAuth
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isOAuth ? { Authorization: `Bearer ${apiKey}` } : { "x-goog-api-key": apiKey }),
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
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
