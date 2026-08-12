import { NextResponse } from "next/server";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";
import { getAllWisdom } from "@/lib/wisdom";
import { searchRAGContext } from "@/lib/rag/retrieval";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().max(1000).optional().default(""),
  image: z
    .object({
      mimeType: z.string(),
      data: z.string(), // base64 string
    })
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

// ─── Embedded Nahjul Balagha Knowledge Base ──────────────────────────────────
// Core sermons, letters, and sayings that the AI can reference even without
// an internet search. This gives the chatbot deep, authentic Islamic knowledge
// beyond just the website's wisdom cards.
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
"When night comes they stand on their feet praying, reciting the Quran slowly and with measured tone."
"During the day they are forbearing, learned, virtuous, and God-fearing."

### Sermon 193 (On the World – Khutba Qasi'a)
"Beware, the world is deceitful and treacherous. It gives and takes back, clothes and strips."
"Its pleasures do not last, its calamities do not end."

## KEY LETTERS OF IMAM ALI (AS)

### Letter 31 (To His Son Imam Hasan – The Greatest Advice)
"My dear son, understand that the One who controls death also controls life. The One who creates also destroys."
"I advise you to fear Allah, to adhere to His commands, to fill your heart with His remembrance."
"Develop in yourself the habit of patience. What an excellent trait is patience!"
"Make yourself the judge between yourself and others. Wish for others what you wish for yourself."
"Do not enslave yourself to another person, for Allah has made you free."

### Letter 47 (To His Governors – On Justice)
"Fear God in regard to the people and do not fear them in regard to God."
"The best thing for a ruler is justice, and the worst is tyranny."

### Letter 53 (To Malik al-Ashtar – On Governance)
The longest and most famous letter in Nahjul Balagha:
"Remember that people are of two kinds: either your brother in faith or your equal in humanity."
"Let mercy and compassion and love for your subjects be your distinguishing quality."
"The most beloved of God's servants is one who helps the poorest and neediest."
"Do not say 'I am in authority, I order and I am obeyed.' This corrupts the heart and weakens faith."

## FAMOUS SHORT SAYINGS (HIKAM) OF IMAM ALI (AS)

### On Self-Knowledge
"One who knows himself knows his Lord." (Saying 149)
"The greatest victory is self-conquest." (Saying 201)
"Your remedy is within you, but you do not sense it. Your sickness is from you, but you do not perceive it." (Saying 108)

### On Knowledge & Education
"Knowledge is the most superior wealth." (Saying 147)
"Ask me before you lose me, for by Allah, there is no verse in the Quran about which I do not know whether it was revealed at night or during the day."
"People are enemies of what they do not know." (Saying 172)
"An ignorant person is a prisoner of his tongue." (Saying 211)
"The learned lives after death; the ignorant is dead while still alive."

### On Patience & Hardship
"Patience is the fruit of faith." (Saying 244)
"Do not let your difficulties fill you with anxiety — after all, it is in the darkest nights that stars shine most brightly."
"The one who has patience will never be deprived of success, even though it may take a long time."
"Endure hardship with patience, for patience is a pillar of faith."

### On Character & Relationships
"The tongue is a beast: if it is let loose, it devours." (Saying 60)
"Associate with people in such a way that when you die they weep for you, and when you are alive they long for your company." (Saying 10)
"The most helpless person is one who cannot find a friend and more helpless than him is one who loses a friend he found."
"A true friend is one who speaks well of you behind your back."

### On Time & Action
"Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)
"The value of every person is in what he does well." (Saying 81)
"Lost wealth can be replaced by effort, but lost time can never be recovered."
"He who is slow in doing good hastens his own destruction."

### On Justice & Leadership
"Justice is putting things in their right place, while generosity is directing things away from their direction." (Saying 437)
"Fear the sighs of the oppressed, for they go straight to Allah."
"A ruler's best quality is justice; his worst quality is tyranny."
"Do not rule over people the way a master rules his slaves."

### On Anxiety, Fear & Peace of Mind
"Do not let your heart be troubled by that which is destined and cannot be averted."
"The world is like a serpent, soft to the touch but full of venom within."
"Greed is permanent slavery." (Saying 180)
"Contentment is the capital that never diminishes."
"Man's worth lies in his aspirations." (Saying 47)
"A coward dies a thousand deaths; the brave only one."

### On Spiritual Growth
"Whoever puts himself as a leader of people must begin by educating himself before educating others."
"The sin that grieves you is better in the sight of God than the good deed that makes you vain."
"Asceticism is not that you own nothing; it is that nothing owns you."

### On Youth & Students
"The hearts of the young are like uncultivated land: whatever seeds are sown will be accepted."
"Teach your children well, for they are born for a time different from yours."
"The greatest wealth is wisdom; the greatest poverty is ignorance."

## QURAN REFERENCES IMAM ALI FREQUENTLY CITED
- Surah Al-Asr (103): "By time, indeed mankind is in loss, except those who believe and do righteous deeds."
- Surah Al-Hashr (59:18): "O you who believe! Fear Allah and let every soul look to what it has prepared for tomorrow."
- Surah Ar-Ra'd (13:28): "Verily, in the remembrance of Allah do hearts find rest."
- Surah Al-Baqarah (2:153): "O you who believe! Seek help through patience and prayer."
- Surah Al-Inshirah (94:5-6): "Indeed with hardship comes ease. Indeed with hardship comes ease."
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
    const validation = chatSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.format() }, { status: 400 });
    }

    const { message, image, history } = validation.data;
    const detectedTopics = detectTopics(message);

    // ── 1. Vector RAG Search & Context Retrieval ──
    const ragResults = await searchRAGContext(message, 5);
    
    // Also perform local fallback wisdom match for extra metadata/slug linking
    const allWisdom = await getAllWisdom();
    const searchTerms = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const relevantWisdom = allWisdom
      .filter((w) => {
        const text = `${w.english_translation} ${w.source} ${(w.corner_topics || []).join(" ")}`.toLowerCase();
        return searchTerms.some((term) => text.includes(term)) || detectedTopics.some((t) => text.includes(t));
      })
      .slice(0, 3);

    const contextSnippets = [
      ...ragResults.map((r) => `• [RAG Citation — ${r.source}]: "${r.content}"${r.slug ? ` (Link: /wisdom/${r.slug})` : ""}`),
      ...relevantWisdom.map((w) => `• [Wisdom Card — ${w.source}]: "${w.english_translation}" (Read more: /wisdom/${w.slug})`),
    ];

    // ── 2. Build the comprehensive system prompt ──
    const conversationContext =
      history && history.length > 0
        ? "\n\nPrevious conversation:\n" +
          history
            .slice(-6) // keep last 6 messages for context window
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n")
        : "";

    const systemPrompt = `You are "TheNahj AI Guidance Assistant", a deeply knowledgeable, compassionate, and authentic advisor grounded in the teachings of Imam Ali ibn Abi Talib (AS), Nahjul Balagha, and broader Islamic wisdom.

## YOUR IDENTITY
- You are an expert Islamic scholar specializing in Nahjul Balagha (Peak of Eloquence).
- You guide modern youth and students through life challenges using Imam Ali's timeless wisdom.
- You speak warmly, with genuine care, as a wise mentor would speak to a young student.

## YOUR KNOWLEDGE BASE
You have deep knowledge of:
1. **Nahjul Balagha** — All 241 sermons, 79 letters, and 489 sayings of Imam Ali (AS)
2. **Global Islamic Sources** — Complete knowledge of the Quran, Tafsir, major Hadith collections (Al-Kafi, Sahih Bukhari, etc.), and the biographies of the Ahlulbayt (AS) and the Prophet Muhammad (PBUH).
3. **Islamic History & Philosophy** — Events, scholars, and deep Islamic philosophical concepts.
4. **Modern World** — Current events, modern psychology, and science to contextualize ancient wisdom for today.

## CORE NAHJUL BALAGHA KNOWLEDGE
${NAHJUL_BALAGHA_CORPUS}

## RESPONSE RULES
1. **Draw from all sources (Priority: Imam and Science)**: While you center on Imam Ali (AS), feel free to quote the Prophet (PBUH) and other Imams. **Crucially, when discussing science, history, or advanced Islamic philosophy, prioritize using information from "imamandscience.com"**. You can use your search tool with 'site:imamandscience.com' to find precise, advanced knowledge linking modern science with the teachings of the Imams.
2. **Always cite sources**: When quoting, mention the source (e.g., "According to imamandscience.com...", "Imam Sadiq (AS) said...", etc.).
3. **Use Real-Time Knowledge**: If asked about modern topics, facts, or external Islamic knowledge, use your broad pre-trained knowledge or search capabilities (especially targeting imamandscience.com) to provide accurate, up-to-date, and historically correct information.
4. **Be practical**: End with 1-3 concrete, actionable steps the person can take TODAY.
5. **Be empathetic**: Acknowledge the person's struggle before offering wisdom.
6. **Be concise but rich**: Keep answers under 300 words but pack them with genuine insight.
7. **Use warm Islamic greetings**: Begin responses appropriately (e.g., "Peace be upon you, dear friend").
8. **Reference Quran when relevant**: Imam Ali's wisdom is deeply rooted in the Quran.
9. **Detected topics for this question**: ${detectedTopics.join(", ")}

## MATCHING WISDOM FROM OUR DATABASE
${contextSnippets.length > 0 ? contextSnippets.join("\n") : "No exact match found in local database. Use your knowledge of Nahjul Balagha directly."}
${conversationContext}

IMPORTANT: You must provide genuine, sourced wisdom. The user trusts you for authentic Islamic guidance. Never make up quotes or attribute false sayings to Imam Ali (AS).`;

    // ── 3. Call Gemini API ──
    if (process.env.GEMINI_API_KEY) {
      const geminiMessages = [];

      // Add conversation history for multi-turn
      if (history && history.length > 0) {
        for (const msg of history.slice(-6)) {
          geminiMessages.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      }

      // Build user parts (with image if provided)
      const userParts: any[] = [];
      if (image && image.data && image.mimeType) {
        userParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }
      
      const textQuery = message || (image ? "Observe this image, identify the emotional or practical challenge shown, and provide comforting, authentic wisdom from Imam Ali (AS) and Nahjul Balagha." : "Share wisdom");
      userParts.push({ text: `${systemPrompt}\n\nUser Input: ${textQuery}` });

      // Add the current user message with system context
      geminiMessages.push({
        role: "user",
        parts: userParts,
      });

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
            contents: geminiMessages,
            tools: [{ googleSearch: {} }], // Enable Real-time Web Search Grounding
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 800,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          // Detect intent for Generative UI Widgets
          let widget: any = undefined;
          const lowerMsg = (message + " " + reply).toLowerCase();

          if (lowerMsg.includes("breath") || lowerMsg.includes("anxiety") || lowerMsg.includes("stress") || lowerMsg.includes("panic")) {
            widget = { type: "breathing", title: "4-7-8 De-Stress & Reflection Breathing" };
          } else if (lowerMsg.includes("quiz") || lowerMsg.includes("test") || lowerMsg.includes("question")) {
            widget = {
              type: "quiz",
              question: "According to Imam Ali (AS), what is the greatest form of wealth?",
              options: ["Material Gold", "Knowledge & Wisdom", "Social Status", "Physical Strength"],
              correctIndex: 1,
              explanation: "Imam Ali (AS) taught: 'Knowledge is the most superior wealth. It protects you while you must protect material wealth.' (Saying 147)",
            };
          } else if (lowerMsg.includes("reflect") || lowerMsg.includes("meditate") || lowerMsg.includes("silence") || lowerMsg.includes("pause")) {
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
      }
    }

    // ── 4. Enhanced Fallback (No API key) ──
    const topicResponses: Record<string, string> = {
      anxiety: `Peace be upon you, dear friend. I understand the weight of anxiety you carry.\n\nImam Ali (AS) reminds us in Nahjul Balagha: "Do not let your heart be troubled by that which is destined and cannot be averted." He also taught: "Contentment is the capital that never diminishes."\n\nThe Quran itself assures us: "Verily, in the remembrance of Allah do hearts find rest" (13:28).\n\n**Steps for today:**\n1. Take 5 slow breaths and recite "La hawla wa la quwwata illa billah"\n2. Write down 3 things within your control and focus only on those\n3. Before sleep, reflect on one blessing you received today`,
      focus: `Peace be upon you! Imam Ali (AS) said: "Opportunity passes away like a cloud, so make use of good opportunities." (Saying 21)\n\nHe also taught us: "Lost wealth can be replaced by effort, but lost time can never be recovered."\n\nIn our age of endless notifications, this 1400-year-old wisdom cuts deeper than ever.\n\n**Steps for today:**\n1. Put your phone in another room for 45 minutes while studying\n2. Set one clear intention for what you want to accomplish before Maghrib\n3. Remember: "The value of every person is in what he does well" (Saying 81)`,
      patience: `Peace be upon you. Imam Ali (AS) said in Nahjul Balagha: "Patience is of two kinds: patience over what pains you, and patience against what you covet." (Sermon 87)\n\nHe also taught: "The one who has patience will never be deprived of success, even though it may take a long time."\n\nThe Quran reminds us: "Indeed with hardship comes ease. Indeed with hardship comes ease." (94:5-6)\n\n**Steps for today:**\n1. When frustration arises, pause and say "Inna lillahi wa inna ilayhi rajioon"\n2. Journal one lesson this hardship is teaching you\n3. Remember that stars shine brightest in the darkest nights`,
      knowledge: `Peace be upon you, dear student! Imam Ali (AS) valued knowledge above all: "Knowledge is the most superior wealth. It protects you while you protect material wealth."\n\nHe famously said: "People are enemies of what they do not know." (Saying 172) And: "The learned lives after death; the ignorant is dead while still alive."\n\n**Steps for today:**\n1. Dedicate 30 focused minutes to your most challenging subject\n2. Teach one concept you learned today to someone else — this deepens understanding\n3. Before studying, set a clear niyyah (intention) that this knowledge serves a higher purpose`,
      relationships: `Peace be upon you. Imam Ali (AS) gave beautiful guidance on relationships: "Associate with people in such a way that when you die they weep for you, and when you are alive they long for your company." (Saying 10)\n\nHe also warned: "The tongue is a beast: if it is let loose, it devours." (Saying 60)\n\n**Steps for today:**\n1. Send a kind message to someone you've been distant from\n2. Practice listening more than speaking in your next conversation\n3. Before reacting to someone's behavior, ask yourself: "Would Imam Ali respond this way?"`,
      general: `Peace be upon you, dear friend!\n\nImam Ali (AS) taught us in his famous Letter 31 to his son Imam Hasan (AS): "Make yourself the judge between yourself and others. Wish for others what you wish for yourself."\n\nHe also said: "Your remedy is within you, but you do not sense it. Your sickness is from you, but you do not perceive it." (Saying 108)\n\nWhatever challenge you face today, remember that Imam Ali faced immense trials yet remained the most just, wise, and compassionate leader in history.\n\n**Steps for today:**\n1. Take a moment of quiet reflection — even 2 minutes of stillness\n2. Identify one small good deed you can do before the day ends\n3. Read one saying of Imam Ali and let it guide your actions today`,
    };

    const primaryTopic = detectedTopics[0] || "general";
    const fallbackReply = topicResponses[primaryTopic] || topicResponses.general;

    // Enhance with local wisdom if available
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
