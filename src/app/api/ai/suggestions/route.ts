export const runtime = "edge";
import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// ─── Large rotating pool of curated questions ─────────────────────────────────
// 30+ questions across all major topics. Shuffled on every request.
export const QUESTION_POOL = [
  // Anxiety & Stress
  "How to deal with exam anxiety and stress?",
  "I feel overwhelmed — what does Islamic wisdom say?",
  "How do I calm my mind before sleeping?",
  "What is the Islamic way to handle panic attacks?",
  // Patience & Hardship
  "What does Imam Ali say about patience in hardship?",
  "How to stay patient when everything goes wrong?",
  "What is the wisdom behind suffering in Islam?",
  "How to deal with failure and not lose hope?",
  // Knowledge & Learning
  "What did Imam Ali teach about seeking knowledge?",
  "How to stay focused while studying?",
  "What is the Islamic view on education and learning?",
  "How to build a habit of reading and learning daily?",
  // Self-Discipline & Laziness
  "Overcoming laziness and building self-discipline",
  "How to stop procrastinating from an Islamic perspective?",
  "What does Nahjul Balagha say about willpower?",
  "How to wake up for Fajr consistently?",
  // Time & Productivity
  "Imam Ali's advice on time management",
  "How to manage time wisely as a Muslim?",
  "What does Islam say about wasting time?",
  "How to balance dunya and deen in daily life?",
  // Relationships & Friends
  "What did Imam Ali say about true friendship?",
  "How to deal with a toxic friend in Islam?",
  "Islamic advice for improving family relationships?",
  "What is Imam Ali's wisdom on marriage?",
  // Character & Ego
  "How to control anger according to Imam Ali?",
  "What is the cure for arrogance and pride in Islam?",
  "How to develop humility and good character?",
  "What did Imam Ali say about the tongue and speech?",
  // Purpose & Goals
  "How do I find my purpose in life?",
  "What is the Islamic view on ambition and goals?",
  "I feel lost and don't know my direction — help?",
  // Spirituality & Dua
  "Which Dua should I recite for anxiety and stress?",
  "How to strengthen my connection with Allah?",
  "What does Imam Ali say about Tawakkul (trust in Allah)?",
  "How to make my prayers more meaningful?",
  // Justice & Leadership
  "What did Imam Ali teach about justice and fairness?",
  "Imam Ali's letter to Malik al-Ashtar — key lessons?",
  "How to be a good leader according to Islamic wisdom?",
];

export async function GET() {
  try {
    // 1. Try Supabase for real trending questions
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc("get_trending_questions", {
        limit_count: 8,
      });

      if (!error && Array.isArray(data) && data.length >= 3) {
        // Return top 8 trending so frontend can pick 3 and rotate
        return NextResponse.json({
          source: "trending",
          questions: data.map((q: any) => q.query_text),
        });
      }
    }
  } catch (err) {
    console.warn("[Suggestions] Supabase trending query failed:", err);
  }

  // 2. Fallback: shuffle the pool and return 8 for rotation
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  return NextResponse.json({
    source: "pool",
    questions: shuffled.slice(0, 8),
  });
}
