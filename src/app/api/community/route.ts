import { NextResponse } from "next/server";

// In-memory mock database for Community Reflections (resets on server restart)
// In production, this would map to a Supabase "community_reflections" table.
let reflections = [
  {
    id: "ref_1",
    text: "Patience isn't just about waiting; it's about how you behave while waiting. Imam Ali's words saved me today.",
    topic: "Patience",
    inspiredCount: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ref_2",
    text: "I was comparing my grades to others, but reading 'there is no wealth like wisdom' completely shifted my mindset.",
    topic: "Comparison & Envy",
    inspiredCount: 34,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ref_3",
    text: "Whenever I feel lonely, I remember that Imam Ali (AS) found comfort in his connection with the Creator.",
    topic: "Loneliness",
    inspiredCount: 8,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

export async function GET() {
  // Sort newest first
  const sorted = [...reflections].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, reflections: sorted });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === "inspire") {
      // Increment inspired count
      const ref = reflections.find(r => r.id === body.id);
      if (ref) {
        ref.inspiredCount += 1;
        return NextResponse.json({ success: true, reflection: ref });
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Otherwise, post new reflection
    const { text, topic } = body;
    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Reflection too short" }, { status: 400 });
    }

    const newReflection = {
      id: `ref_${Date.now()}`,
      text: text.slice(0, 200), // Max 200 chars
      topic: topic || "General Reflection",
      inspiredCount: 0,
      createdAt: new Date().toISOString(),
    };

    reflections.push(newReflection);

    return NextResponse.json({ success: true, reflection: newReflection });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
