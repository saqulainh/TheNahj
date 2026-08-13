import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { getAllWisdom } from "@/lib/wisdom";
import { searchRAGContext } from "@/lib/rag/retrieval";
import { fetchGeminiWithFailover } from "@/lib/gemini";

const NAHJUL_BALAGHA_CORPUS = `
## KEY SERMONS OF IMAM ALI (AS) FROM NAHJUL BALAGHA

### Sermon 1 (Khutba-e-Shiqshiqiyya – The Sermon of Complaint)
In which he speaks about the caliphate and those who preceded him.

### Sermon 3 (Khutba-e-Jihadiyya – On Jihad)
"I swear by Allah that the son of Abu Talib is more accustomed to death than an infant is to the breast of its mother."

### Sermon 18 (On Warning Against the World)
"O people! This world is a passage while the next is the permanent abode. So take from the passage for the permanent abode."
"Do not let the worldly life deceive you, for it is treacherous."

### Sermon 40 (On the Value of Knowledge)
"Knowledge is the most superior form of wealth. It protects you while you protect material wealth."

### Sermon 87 (On Patience and Gratitude)
"Patience is of two kinds: patience over what pains you, and patience against what you covet."
"Gratitude is the adornment of prosperity, and patience is the adornment of adversity."

### Sermon 110 (On the Piety – Khutba Muttaqeen)
The famous sermon describing the qualities of the God-fearing (Muttaqeen):
"Their walk is modest, their speech gentle, they lower their gaze from what is forbidden, they dedicate their hearing to beneficial knowledge."

### Sermon 193 (On the World – Khutba Qasi'a)
"Beware, the world is deceitful and treacherous. It gives and takes back, clothes and strips."

## KEY LETTERS OF IMAM ALI (AS)

### Letter 31 (To His Son Imam Hasan – The Greatest Advice)
"My dear son, understand that the One who controls death also controls life."
"Make yourself the judge between yourself and others. Wish for others what you wish for yourself."
"Do not enslave yourself to another person, for Allah has made you free."

### Letter 53 (To Malik al-Ashtar – On Governance)
"Remember that people are of two kinds: either your brother in faith or your equal in humanity."
"Let mercy and compassion and love for your subjects be your distinguishing quality."

## FAMOUS SHORT SAYINGS (HIKAM) OF IMAM ALI (AS)

### On Self-Knowledge
"One who knows himself knows his Lord." (Saying 149)
"Your remedy is within you, but you do not sense it." (Saying 108)

### On Knowledge & Education
"Knowledge is the most superior wealth." (Saying 147)
"People are enemies of what they do not know." (Saying 172)

### On Patience & Hardship
"Do not let your difficulties fill you with anxiety — after all, it is in the darkest nights that stars shine most brightly."
"The one who has patience will never be deprived of success, even though it may take a long time."

### On Character & Relationships
"The tongue is a beast: if it is let loose, it devours." (Saying 60)
"Associate with people in such a way that when you die they weep for you, and when you are alive they long for your company." (Saying 10)

### On Time & Action
"Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)
"The value of every person is in what he does well." (Saying 81)
"Lost wealth can be replaced by effort, but lost time can never be recovered."

### On Justice & Leadership
"Fear the sighs of the oppressed, for they go straight to Allah."

### On Spiritual Growth
"Asceticism is not that you own nothing; it is that nothing owns you."
"The sin that grieves you is better in the sight of God than the good deed that makes you vain."
`;

// ─── Topic Mapping for Better Search ─────────────────────────────────────────
const TOPIC_KEYWORDS: Record<string, string[]> = {
  anxiety: ["anxiety", "worry", "stress", "tension", "fear", "panic", "nervous", "overwhelm", "anxious"],
  patience: ["patience", "sabr", "endure", "hardship", "suffering", "difficulty", "persevere", "wait"],
  knowledge: ["knowledge", "study", "learn", "education", "school", "exam", "college", "university", "student", "teacher"],
  focus: ["focus", "distraction", "attention", "concentrate", "phone", "social media", "procrastinate", "lazy", "procrastination", "dopamine"],
  purpose: ["purpose", "meaning", "life", "goal", "ambition", "career", "future", "direction", "lost", "confused"],
  relationships: ["friend", "friendship", "family", "parents", "marriage", "love", "loneliness", "lonely", "toxic", "relationship"],
  justice: ["justice", "fairness", "oppression", "rights", "wrong", "injustice", "equality"],
  character: ["character", "anger", "ego", "pride", "humility", "honest", "lying", "gossip", "backbiting", "arrogant", "humble"],
  time: ["time", "time management", "productive", "productivity", "wasting time", "busy", "schedule"],
  spiritual: ["spiritual", "prayer", "dua", "faith", "iman", "taqwa", "sin", "repentance", "forgiveness", "god", "allah", "quran"],
  leadership: ["leadership", "leader", "responsibility", "authority", "power", "influence"],
  discipline: ["discipline", "self-control", "habit", "willpower", "routine", "consistency", "motivation"],
};

function detectTopics(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(topic);
    }
  }
  return detected.length > 0 ? detected : ["general"];
}

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `ai:chat:${ip}`, limit: 15, windowMs: 60000 });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before asking another question." },
      { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } }
    );
  }

  try {
    const rawBody = await request.json();
    const message = rawBody.message || "";
    const history = rawBody.history || [];
    // Also support Vercel AI SDK message format
    const messages = rawBody.messages;
    const userMessage = messages
      ? (messages[messages.length - 1]?.content || "")
      : message;

    const detectedTopics = detectTopics(userMessage);

    // ── 1. Vector RAG Search & Context Retrieval ──
    const ragResults = await searchRAGContext(userMessage, 5);
    const allWisdom = await getAllWisdom();
    const searchTerms = userMessage.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const relevantWisdom = allWisdom
      .filter((w) => {
        const text = `${w.english_translation} ${w.source} ${(w.corner_topics || []).join(" ")}`.toLowerCase();
        return searchTerms.some((term: string) => text.includes(term)) || detectedTopics.some((t) => text.includes(t));
      })
      .slice(0, 3);

    const contextSnippets = [
      ...ragResults.map((r) => `• [RAG Citation — ${r.source}]: "${r.content}"${r.slug ? ` (Link: /wisdom/${r.slug})` : ""}`),
      ...relevantWisdom.map((w) => `• [Wisdom Card — ${w.source}]: "${w.english_translation}" (Read more: /wisdom/${w.slug})`),
    ];

    // ── 2. Build the comprehensive system prompt ──
    const conversationHistory = (messages || history || [])
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are "TheNahj AI Guidance Assistant", a deeply knowledgeable, compassionate, and authentic advisor grounded in the teachings of Imam Ali ibn Abi Talib (AS), Nahjul Balagha, and broader Islamic wisdom.

YOUR IDENTITY
- You are an expert Islamic scholar specializing in Nahjul Balagha (Peak of Eloquence).
- You guide modern youth and students through life challenges using Imam Ali's timeless wisdom.
- You speak warmly, with genuine care, as a wise mentor would speak to a young student.

YOUR KNOWLEDGE BASE
${NAHJUL_BALAGHA_CORPUS}

RESPONSE RULES
1. Always cite sources: When quoting, mention the source (e.g., "Sermon 87", "Saying 21").
2. Be practical: End with 1-3 concrete, actionable steps the person can take TODAY.
3. Be empathetic: Acknowledge the person's struggle before offering wisdom.
4. Be concise but rich: Keep answers under 300 words but pack them with genuine insight.
5. Use warm Islamic greetings: Begin responses appropriately (e.g., "Peace be upon you, dear friend").
6. Reference Quran when relevant: Imam Ali's wisdom is deeply rooted in the Quran.
7. Detected topics for this question: ${detectedTopics.join(", ")}

FORMATTING RULES — CRITICAL — YOU MUST FOLLOW THESE:
- NEVER use Markdown formatting of any kind in your response.
- Do NOT use # or ## or ### or #### for headings. Write section titles as plain text on their own line.
- Do NOT use ** or * for bold or italic text. Write all words normally.
- Do NOT use --- or *** or ___ for horizontal rules or dividers.
- Do NOT use __ or _ for underline or italic.
- Do NOT use backticks around words or phrases.
- Do NOT use > for blockquotes.
- Do NOT use Markdown tables.
- Numbered lists (1. 2. 3.) are acceptable and preferred for actionable steps.
- Write in flowing, polished editorial prose, as if composing a thoughtful letter or article.
- Your response must read like a wise human wrote it, not like a formatted document.
- Arabic and Urdu quotations should appear inline in their natural script without any decoration.

MATCHING WISDOM FROM OUR DATABASE
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "No exact match found in local database. Use your knowledge of Nahjul Balagha directly."}

${conversationHistory ? `CONVERSATION HISTORY\n${conversationHistory}` : ""}

IMPORTANT: You must provide genuine, sourced wisdom. Never make up quotes.`;

    // ── 3. Call Gemini API ──
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
        const reply = await fetchGeminiWithFailover(fullPrompt, apiKey, {
          temperature: 0.7,
          maxOutputTokens: 8192,
        });

        if (reply) {
          let widget: any = undefined;
          const lowerMsg = (userMessage + " " + reply).toLowerCase();

          if (lowerMsg.includes("breath") || lowerMsg.includes("anxiety") || lowerMsg.includes("stress") || lowerMsg.includes("panic")) {
            widget = { type: "breathing", title: "4-7-8 De-Stress & Reflection Breathing" };
          } else if (lowerMsg.includes("quiz") || lowerMsg.includes("test") || lowerMsg.includes("question") || lowerMsg.includes("knowledge check")) {
            const QUIZ_BANK = [
              {
                topic: "knowledge",
                question: "According to Imam Ali (AS), what is the greatest form of wealth?",
                options: ["Material Gold", "Knowledge & Wisdom", "Social Status", "Physical Strength"],
                correctIndex: 1,
                explanation: "Imam Ali (AS) taught: 'Knowledge is the most superior wealth.' (Saying 147)",
              },
              {
                topic: "patience",
                question: "How did Imam Ali (AS) describe the relationship between Patience (Sabr) and Faith (Iman)?",
                options: [
                  "Patience is half of faith",
                  "Patience is to faith what the head is to the body",
                  "Patience comes after faith",
                  "Patience is separate from faith"
                ],
                correctIndex: 1,
                explanation: "Imam Ali (AS) said: 'Patience is to faith what the head is to the body; a body has no good in it without a head.' (Saying 82)",
              },
              {
                topic: "time",
                question: "According to Imam Ali (AS), how fast does opportunity pass away?",
                options: ["Like water in a river", "Like a cloud", "Like a shadow", "Like the wind"],
                correctIndex: 1,
                explanation: "Imam Ali (AS) taught: 'Opportunity passes away like a cloud, so make use of good opportunities.' (Saying 21)",
              },
              {
                topic: "anger",
                question: "What did Imam Ali (AS) describe as the beginning of anger and its end?",
                options: [
                  "Beginning is passion, end is victory",
                  "Beginning is madness, end is regret",
                  "Beginning is fire, end is ashes",
                  "Beginning is strength, end is weakness"
                ],
                correctIndex: 1,
                explanation: "Imam Ali (AS) said: 'Anger begins with madness and ends with regret.' (Saying 255)",
              },
              {
                topic: "friendship",
                question: "Who did Imam Ali (AS) consider the most helpless of all people?",
                options: [
                  "The one who has no wealth",
                  "The one who cannot gain friends, and even more helpless is one who loses them",
                  "The one who has no health",
                  "The one who lives in isolation"
                ],
                correctIndex: 1,
                explanation: "Imam Ali (AS) said: 'The most helpless person is one who cannot acquire friends, and more helpless is the one who loses those he has.' (Saying 12)",
              },
              {
                topic: "ego",
                question: "What did Imam Ali (AS) identify as the greatest obstacle to learning & wisdom?",
                options: ["Lack of books", "Self-conceit and vanity (Ujb)", "Poverty", "Old age"],
                correctIndex: 1,
                explanation: "Imam Ali (AS) taught: 'Self-conceit (vanity) is an obstacle to progress and wisdom.' (Saying 212)",
              },
              {
                topic: "tongue",
                question: "How did Imam Ali (AS) describe the human tongue?",
                options: [
                  "A sharp sword",
                  "A wild beast; if left free, it devours",
                  "A mirror of the heart",
                  "A vessel of speech"
                ],
                correctIndex: 1,
                explanation: "Imam Ali (AS) said: 'The tongue is a beast; if it is let loose, it devours.' (Saying 60)",
              },
              {
                topic: "justice",
                question: "How did Imam Ali (AS) define Justice compared to Generosity?",
                options: [
                  "Generosity is higher because it gives more",
                  "Justice puts things in their proper place; generosity takes them out",
                  "Justice and generosity are identical",
                  "Generosity is for leaders, justice for common people"
                ],
                correctIndex: 1,
                explanation: "Imam Ali (AS) explained: 'Justice puts things in their proper places, while generosity takes them out of their places. Therefore, justice is superior.' (Saying 437)",
              },
              {
                topic: "contentment",
                question: "What did Imam Ali (AS) call the capital that never diminishes?",
                options: ["Gold coins", "Contentment (Qana'ah)", "Land property", "Inheritance"],
                correctIndex: 1,
                explanation: "Imam Ali (AS) taught: 'Contentment is an unexhaustible capital.' (Saying 57)",
              },
              {
                topic: "forgiveness",
                question: "When you gain power over your enemy, what did Imam Ali (AS) advise as gratitude for that power?",
                options: ["To demand tribute", "To pardon and forgive him", "To banish him", "To imprison him"],
                correctIndex: 1,
                explanation: "Imam Ali (AS) said: 'When you gain power over your adversary, pardon him as a way of offering thanks for having gained power over him.' (Saying 11)",
              }
            ];

            const matched = QUIZ_BANK.filter(q => lowerMsg.includes(q.topic));
            const selectedQuiz = matched.length > 0
              ? matched[Math.floor(Math.random() * matched.length)]
              : QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];

            widget = {
              type: "quiz",
              question: selectedQuiz.question,
              options: selectedQuiz.options,
              correctIndex: selectedQuiz.correctIndex,
              explanation: selectedQuiz.explanation,
            };
          } else if (lowerMsg.includes("reflect") || lowerMsg.includes("meditate") || lowerMsg.includes("silence")) {
            widget = { type: "reflection", prompt: "Close your eyes and reflect deeply on Imam Ali's words for 60 seconds." };
          }

          return NextResponse.json({
            success: true,
            reply,
            topics: detectedTopics,
            widget,
            relatedWisdom: relevantWisdom.slice(0, 3).map((w) => ({
              title: w.source,
              slug: w.slug,
              quote: w.english_translation,
              category: w.category?.name,
            })),
          });
        }
      } catch (chatErr) {
        console.warn("[Chat] Gemini call failed, using fallback:", chatErr);
      }
    }

    // ── 4. Enhanced Fallback (No API key) ──
    const topicResponses: Record<string, string> = {
      anxiety: `Peace be upon you, dear friend. I understand the weight of anxiety you carry.\n\nImam Ali (AS) reminds us in Nahjul Balagha: "Do not let your heart be troubled by that which is destined and cannot be averted." He also taught: "Contentment is the capital that never diminishes."\n\nThe Quran itself assures us: "Verily, in the remembrance of Allah do hearts find rest" (13:28).\n\n**Steps for today:**\n1. Take 5 slow breaths and recite "La hawla wa la quwwata illa billah"\n2. Write down 3 things within your control and focus only on those\n3. Before sleep, reflect on one blessing you received today`,
      focus: `Peace be upon you! Imam Ali (AS) said: "Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)\n\nHe also taught us: "Lost wealth can be replaced by effort, but lost time can never be recovered."\n\n**Steps for today:**\n1. Put your phone in another room for 45 minutes while studying\n2. Set one clear intention for what you want to accomplish\n3. Remember: "The value of every person is in what he does well" (Saying 81)`,
      patience: `Peace be upon you. Imam Ali (AS) said in Nahjul Balagha: "Patience is of two kinds: patience over what pains you, and patience against what you covet." (Sermon 87)\n\nHe also taught: "The one who has patience will never be deprived of success, even though it may take a long time."\n\n**Steps for today:**\n1. When frustration arises, pause and say "Inna lillahi wa inna ilayhi rajioon"\n2. Journal one lesson this hardship is teaching you\n3. Remember that stars shine brightest in the darkest nights`,
      time: `Peace be upon you! Imam Ali (AS) taught profound wisdom about time management:\n\n"Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)\n\n"Lost wealth can be replaced by effort, but lost time can never be recovered."\n\n"The value of every person is in what he does well." (Saying 81)\n\n**Steps for today:**\n1. Prioritize your most important task first thing in the morning\n2. Block distractions for focused work periods of 45 minutes\n3. Before sleeping, plan tomorrow's 3 most important tasks`,
      general: `Peace be upon you, dear friend!\n\nImam Ali (AS) taught us in his famous Letter 31 to his son Imam Hasan (AS): "Make yourself the judge between yourself and others. Wish for others what you wish for yourself."\n\nHe also said: "Your remedy is within you, but you do not sense it." (Saying 108)\n\n**Steps for today:**\n1. Take a moment of quiet reflection — even 2 minutes of stillness\n2. Identify one small good deed you can do before the day ends\n3. Read one saying of Imam Ali and let it guide your actions today`,
    };

    const primaryTopic = detectedTopics[0] || "general";
    const fallbackReply = topicResponses[primaryTopic] || topicResponses.general;

    let finalReply = fallbackReply;
    if (relevantWisdom.length > 0) {
      finalReply += `\n\nFrom our collection, Imam Ali (AS) also said: "${relevantWisdom[0].english_translation}" (${relevantWisdom[0].source})`;
    }

    return NextResponse.json({
      success: true,
      reply: finalReply,
      topics: detectedTopics,
      relatedWisdom: relevantWisdom.slice(0, 3).map((w) => ({
        title: w.source,
        slug: w.slug,
        quote: w.english_translation,
        category: w.category?.name,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
