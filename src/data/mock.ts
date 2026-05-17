import type { Article, Category, Wisdom } from "@/lib/types";

export const categories: Category[] = [
  { id: "1", name: "Discipline", slug: "discipline" },
  { id: "2", name: "Knowledge", slug: "knowledge" },
  { id: "3", name: "Time", slug: "time" },
  { id: "4", name: "Patience", slug: "patience" },
  { id: "5", name: "Leadership", slug: "leadership" },
  { id: "6", name: "Character", slug: "character" },
  { id: "7", name: "Friendship", slug: "friendship" },
  { id: "8", name: "Anger", slug: "anger" },
  { id: "9", name: "Spirituality", slug: "spirituality" },
  { id: "10", name: "Success", slug: "success" },
];

export const wisdomItems: Wisdom[] = [
  {
    id: "w1",
    slug: "value-of-youth-and-health",
    arabic_text: "يَا بْنَ آدَمَ إِنَّمَا أَنْتَ أَيَّامٌ",
    urdu_translation:
      "اے ابن آدم! تو صرف چند دنوں کا مالک ہے — جب یک دن گزر جائے تو ایک حصہ تیرے وجود کا ختم ہو جاتا ہے۔",
    english_translation:
      "O son of Adam! You are but a collection of days — when one day passes, a part of you has gone forever.",
    short_reflection:
      "Your youth and health are not guaranteed. Every scroll steals a day you cannot buy back.",
    deep_reflection: `Imam Ali (AS) reminds us that our existence is measured in days, not years of procrastination. Each morning is a deposit; each night is a withdrawal you cannot reverse.

For students drowning in doomscrolling, this is not guilt — it is clarity. The algorithm will always want more of your hours. Your soul wants fewer, but deeper, days.

**The modern trap:** We treat time like it renews automatically, like a subscription. It does not. Your focus, your salah, your revision, your sleep — all compete for the same finite days.`,
    simple_meaning:
      "Life is counted in days that never return. Waste fewer of them on what does not build you.",
    why_today:
      "Gen Z loses hours daily to infinite feeds. This wisdom names the loss before it becomes regret.",
    reflection_questions: [
      "Which app took the most of my yesterday?",
      "If today were my last productive day this month, what would I protect?",
      "What is one hour I can reclaim for something that matters?",
    ],
    action_steps: [
      "Delete one app from your home screen for 24 hours.",
      "Set a 25-minute focus block before opening social media.",
      "Write three things you want this week to remember about you.",
    ],
    source: "Nahjul Balagha, Sermon 42",
    category_id: "3",
    tags: ["time", "youth", "focus"],
    corner_topics: ["time-management", "social-media-addiction", "dopamine-distraction", "focus-productivity"],
    related_slugs: ["knowledge-seeks-the-eager", "patience-in-hardship"],
    created_at: "2025-01-15T08:00:00Z",
    featured_image: "/backgrounds/reflection-1.png",
    background_type: "cinematic",
    background_url: "/backgrounds/cinematic-1.jpg",
    featured: true,
    trending: true,
  },
  {
    id: "w2",
    slug: "knowledge-seeks-the-eager",
    arabic_text: "طَلَبُ الْعِلْمِ فَرِيضَةٌ",
    urdu_translation: "علم حاصل کرنا فرض ہے — اور جو علم کے لیے کوشش کرتا ہے اللہ اس کی مدد کرتا ہے۔",
    english_translation:
      "Seeking knowledge is an obligation — and whoever strives for it, Allah assists them on the path.",
    short_reflection:
      "Laziness is not a personality — it is a habit you can break one small session at a time.",
    deep_reflection: `Knowledge in the school of Ali (AS) is not hoarding facts for exams alone. It is sharpening the soul to see truth, resist injustice, and serve others.

When you feel too tired to study, the shaytan whispers that you are not capable. Imam Ali (AS) teaches the opposite: effort invites divine help. Start ugly. Start small. Start now.`,
    simple_meaning: "Learning is worship. Effort attracts help.",
    why_today:
      "Students compare themselves to highlight reels and freeze. This wisdom redirects comparison into action.",
    reflection_questions: [
      "What is the smallest topic I can revise in 10 minutes?",
      "Am I avoiding study because I fear failure or because I lack a plan?",
    ],
    action_steps: [
      "Open your notes and study one paragraph only.",
      "Tell a friend your 25-minute focus goal for accountability.",
    ],
    source: "Attributed teachings",
    category_id: "2",
    tags: ["study", "knowledge"],
    corner_topics: ["laziness", "focus-productivity", "exam-anxiety"],
    related_slugs: ["value-of-youth-and-health"],
    created_at: "2025-01-20T08:00:00Z",
    background_type: "abstract",
    background_url: "/backgrounds/abstract-1.png",
    trending: true,
  },
  {
    id: "w3",
    slug: "patience-in-hardship",
    arabic_text: "اصْبِرْ عَلَى مَا أَصَابَكَ",
    urdu_translation: "جو مصیبت تجھ پر آئی اس پر صبر کر — صبر کے بعد آسانی ہے۔",
    english_translation:
      "Be patient with what has befallen you — after patience comes ease that you could not see yet.",
    short_reflection:
      "Your overthinking is not preparation — it is borrowed pain from a future that may never come.",
    deep_reflection: `Patience in the wisdom of Ali (AS) is not passive suffering. It is disciplined trust while you do what you can.

Exam results, heartbreak, family pressure — the mind replays worst cases. Patience anchors you in the present duty: breathe, pray, act kindly, sleep.`,
    simple_meaning: "Endure with dignity. Ease follows steadfastness.",
    why_today:
      "Anxiety disorders spike among youth. This wisdom offers a spiritual frame without denying real struggle.",
    reflection_questions: [
      "What is in my control today versus what is not?",
      "Have I prayed about this before I spiraled about it?",
    ],
    action_steps: [
      "Write your worry on paper, then write one action step.",
      "Recite a short dua and set a 5-minute timer before revisiting the worry.",
    ],
    source: "Nahjul Balagha",
    category_id: "4",
    tags: ["patience", "anxiety"],
    corner_topics: ["exam-anxiety", "overthinking", "emotional-discipline"],
    created_at: "2025-02-01T08:00:00Z",
    featured: true,
    background_type: "architectural",
    background_url: "/backgrounds/architectural-1.jpg",
  },
  {
    id: "w4",
    slug: "control-your-anger",
    arabic_text: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ",
    urdu_translation: "جو طاقتور ہے وہ وہ نہیں جو کسی کو پچھاڑ دے — بلکہ وہ ہے جو اپنے غصے پر قابو رکھے۔",
    english_translation:
      "The strong one is not he who wrestles others down — but he who controls himself when anger rises.",
    short_reflection:
      "That reply you want to send in rage will still be there after maghrib. Your dignity might not.",
    deep_reflection: `Imam Ali (AS), known for unmatched bravery, defines strength as self-mastery. In group chats, comment sections, and relationships, anger offers a false sense of power.

Real strength is pause. Breathe. Leave the chat. Make wudu. Return only if words still need to be said — and how.`,
    simple_meaning: "Strength is self-control, not domination.",
    why_today:
      "Online outrage is performative. Youth need a model of power that protects peace.",
    reflection_questions: [
      "Will this message matter in three days?",
      "What am I really trying to prove?",
    ],
    action_steps: [
      "Type the angry reply in notes — do not send for one hour.",
      "Walk without your phone before responding.",
    ],
    source: "Hadith tradition",
    category_id: "8",
    tags: ["anger", "discipline"],
    corner_topics: ["emotional-discipline", "self-respect"],
    created_at: "2025-02-10T08:00:00Z",
    trending: true,
    background_type: "minimal",
  },
  {
    id: "w5",
    slug: "true-friendship",
    arabic_text: "صَدِيقُكَ مَنْ صَدَقَكَ لَا مَنْ صَدَّقَكَ",
    urdu_translation: "تیرا دوست وہ ہے جو تجھے سچ کہے — نہ وہ جو ہر بات پر ہاں کہے۔",
    english_translation:
      "Your true friend is one who is honest with you — not one who only agrees with you.",
    short_reflection:
      "Validation addiction makes us collect fans. Friendship asks for truth, even when it stings.",
    deep_reflection: `Loneliness in the digital age often comes surrounded by followers. Imam Ali (AS) distinguishes applause from companionship.

A friend who warns you about haram, about burnout, about your ego — that is mercy. Seek fewer voices, truer ones.`,
    simple_meaning: "Real friends tell the truth with love.",
    why_today:
      "Youth confuse attention with belonging. This wisdom reframes friendship as moral mirror.",
    reflection_questions: [
      "Who last corrected me gently for my own good?",
      "Do I surround myself with yes-people?",
    ],
    action_steps: [
      "Message one person you trust and ask for honest feedback on one habit.",
      "Be that honest friend to someone else today.",
    ],
    source: "Attributed teachings",
    category_id: "7",
    tags: ["friendship", "loneliness"],
    corner_topics: ["loneliness", "validation-addiction", "haram-relationships"],
    created_at: "2025-02-15T08:00:00Z",
  },
  {
    id: "w6",
    slug: "do-not-follow-every-desire",
    arabic_text: "اتَّبِعْ أَهْوَاءَكَ تُضَلَّ",
    urdu_translation: "ہر خواہش کے پیچھے مت چل — ورنہ گمراہ ہو جائے گا۔",
    english_translation: "Do not follow every desire — or you will be led astray without noticing.",
    short_reflection: "The feed is engineered to feel like desire. Not every impulse deserves your obedience.",
    deep_reflection: `Imam Ali (AS) warns that the nafs whispers faster than reason can speak. In youth, desires for attention, romance online, and instant comfort arrive packaged as freedom.

Freedom is not doing whatever you feel — it is choosing what dignifies you.`,
    simple_meaning: "Desire is not always direction.",
    why_today: "Algorithms feed desire. This wisdom restores choice.",
    reflection_questions: ["What desire am I feeding daily without noticing?", "Does this habit make salah easier or harder?"],
    action_steps: ["Delay one impulsive action by one hour.", "Replace one scroll session with ten minutes of Quran."],
    source: "Attributed teachings",
    category_id: "6",
    tags: ["discipline", "self-control"],
    corner_topics: ["haram-relationships", "dopamine-distraction", "validation-addiction"],
    created_at: "2025-02-20T08:00:00Z",
    trending: true,
  },
  {
    id: "w7",
    slug: "success-through-effort",
    arabic_text: "مَنْ جَدَّ وَجَدَ",
    urdu_translation: "جو कोशिश کرتا ہے وہ کامیابی پاتا ہے — سستی کبھی کسی کو اعلیٰ مقام پر نہیں پہنچاتی۔",
    english_translation: "Whoever strives, finds — laziness never carried anyone to honor.",
    short_reflection: "Career pressure hurts when you compare outcomes but not effort. Start where you are.",
    deep_reflection: `Students fear a future that has not arrived. Imam Ali (AS) ties honor to effort, not luck alone. Your CV is built in ordinary Tuesdays, not viral moments.

Trust the process Allah sees — revision, internships, kindness, consistency.`,
    simple_meaning: "Effort is the path. Comparisons are noise.",
    why_today: "Young professionals measure worth by titles. This wisdom returns agency to daily work.",
    reflection_questions: ["What is one effort I avoided this week?", "Am I comparing my chapter one to someone's chapter ten?"],
    action_steps: ["Send one professional email you have been avoiding.", "Study one skill for 20 minutes today."],
    source: "Attributed teachings",
    category_id: "10",
    tags: ["success", "study"],
    corner_topics: ["career-pressure", "laziness", "focus-productivity"],
    created_at: "2025-02-25T08:00:00Z",
  },
  {
    id: "w8",
    slug: "know-yourself",
    arabic_text: "مَنْ عَرَفَ نَفْسَهُ",
    urdu_translation: "جس نے اپنے نفس کو پہچانا وہ اپنے رب کو پہچاننے کے قریب ہوا۔",
    english_translation: "Whoever knows themselves draws nearer to knowing their Lord.",
    short_reflection: "Identity crisis fades when you stop performing and start observing who you are offline.",
    deep_reflection: `Youth curate personas — aesthetic, opinions, even piety for the camera. Imam Ali (AS) calls inward: what remains when the audience leaves?

Your worth is not a brand. It is a soul Allah already honored.`,
    simple_meaning: "Self-knowledge is spiritual foundation.",
    why_today: "Fake online identity exhausts Gen Z. This wisdom invites honesty.",
    reflection_questions: ["Who am I when no one is watching?", "What part of my online self do I not live in private?"],
    action_steps: ["Write three truths about yourself that need no likes.", "Spend one hour without posting anything."],
    source: "Attributed teachings",
    category_id: "9",
    tags: ["spirituality", "purpose"],
    corner_topics: ["identity-crisis", "purpose", "validation-addiction"],
    created_at: "2025-03-01T08:00:00Z",
    featured: true,
  },
  {
    id: "w9",
    slug: "silence-is-wisdom",
    arabic_text: "الصَّمْتُ حِكْمَةٌ",
    urdu_translation: "خاموشی بھی حکمت ہے — زیادہ بولنا انسان کو کمزور کر دیتا ہے۔",
    english_translation: "Silence is wisdom — excessive speech weakens a person.",
    short_reflection: "Before you text them at 1am, silence might be the stronger love — for yourself.",
    deep_reflection: `Imam Ali (AS) valued measured speech. In attachment and loneliness, we flood inboxes seeking proof we exist.

Sometimes dignity is the message you do not send.`,
    simple_meaning: "Not every feeling needs to be sent.",
    why_today: "Impulsive messaging fuels haram attachment and regret.",
    reflection_questions: ["Will this text heal or hook me?", "Am I seeking closure or validation?"],
    action_steps: ["Use Before You Text reflection before sending.", "Sleep on emotional messages until fajr."],
    source: "Attributed teachings",
    category_id: "6",
    tags: ["discipline", "character"],
    corner_topics: ["haram-relationships", "self-respect", "overthinking"],
    created_at: "2025-03-05T08:00:00Z",
  },
  {
    id: "w10",
    slug: "heart-is-the-kingdom",
    arabic_text: "قَلْبُ الْعَاقِلِ وَلِيُّهُ",
    urdu_translation: "عاقل کا دل اس کا ولی ہے — اسے محفوظ رکھو۔",
    english_translation: "The heart of the wise is their guardian — protect it fiercely.",
    short_reflection: "What you watch, follow, and replay shapes your heart faster than one Friday lecture.",
    deep_reflection: `Digital diseases are heart diseases. Doomscrolling, pornography, comparison — each leaves residue.

Imam Ali (AS) teaches guardianship: curate inputs like you curate friends.`,
    simple_meaning: "Protect your inner world.",
    why_today: "Attention destruction is spiritual erosion.",
    reflection_questions: ["What content do I consume on autopilot?", "Would I show my feed to someone I respect?"],
    action_steps: ["Unfollow ten accounts that drain you.", "Set a daily screen limit for one app."],
    source: "Nahjul Balagha",
    category_id: "9",
    tags: ["spirituality", "focus"],
    corner_topics: ["social-media-addiction", "dopamine-distraction", "emotional-discipline"],
    created_at: "2025-03-08T08:00:00Z",
    trending: true,
  },
];

export const articles: Article[] = [
  {
    id: "a1",
    title: "Before You Open Instagram Again",
    slug: "before-you-open-instagram",
    excerpt: "A 60-second pause between impulse and scroll.",
    content: `You do not need more content. You need one breath.

**Pause.** Feel your feet. Ask: *What am I avoiding right now?*

Often it is revision, a difficult conversation, or silence we have forgotten how to sit in.

Imam Ali (AS) taught that hearts rust — and scrolling polishes nothing inside.

Try this: put the phone in another room for one pomodoro. Not punishment — practice.`,
    seo_description: "Reflection on social media addiction for Muslim students.",
    type: "student",
    corner_topics: ["social-media-addiction", "dopamine-distraction"],
    created_at: "2025-03-01T08:00:00Z",
  },
  {
    id: "a2",
    title: "When Loneliness Feels Like a Character Flaw",
    slug: "loneliness-not-a-flaw",
    excerpt: "You are not broken for wanting to be known.",
    content: `Loneliness is not a sign that faith is weak. It is a sign you are human in an age of performance.

Imam Ali (AS) spoke of the soul's need for sincere companionship — not crowds.

Start small: one dua for a true friend, one act of kindness without posting it, one hour offline where you exist without an audience.`,
    seo_description: "Youth guidance on loneliness and identity.",
    type: "youth",
    corner_topics: ["loneliness", "identity-crisis"],
    created_at: "2025-03-05T08:00:00Z",
  },
  {
    id: "a3",
    title: "The Night Before Exams",
    slug: "night-before-exams",
    excerpt: "Sleep is not betrayal of ambition — it is part of tawakkul.",
    content: `Anxiety whispers that one more hour will save you. Wisdom whispers that a clear mind remembers what a tired mind crams and loses.

Revise what you can. Pray. Sleep. Trust.

Imam Ali (AS) valued preparation and trust in Allah together — not panic masquerading as piety.`,
    seo_description: "Student reflection on exam anxiety.",
    type: "student",
    corner_topics: ["exam-anxiety", "focus-productivity"],
    created_at: "2025-03-10T08:00:00Z",
  },
  {
    id: "a4",
    title: "Career Pressure Is Not Your Identity",
    slug: "career-pressure-identity",
    excerpt: "Grades and offers are milestones — not the whole map.",
    content: `Imam Ali (AS) taught that honor follows effort and character, not titles alone.

When everyone posts internships and acceptances, your timeline lies. Compare yourself to who you were last month.

**One step:** list three skills you can build this week — not three people to envy.`,
    seo_description: "Youth and student guidance on career comparison.",
    type: "student",
    corner_topics: ["career-pressure"],
    created_at: "2025-03-12T08:00:00Z",
  },
  {
    id: "a5",
    title: "Self Respect in the Age of Situationships",
    slug: "self-respect-situationships",
    excerpt: "You are not desperate for crumbs of attention.",
    content: `Imam Ali (AS) defined strength as mastery over impulse — including the impulse to text when dignity says wait.

Halal love is patient. Haram attachment is urgent. Notice which feeling drives your thumb.

**Before you text:** visit /before-you-text and answer honestly.`,
    seo_description: "Youth guidance on self respect and relationships.",
    type: "youth",
    corner_topics: ["self-respect", "haram-relationships"],
    created_at: "2025-03-14T08:00:00Z",
  },
  {
    id: "a6",
    title: "Finding Purpose Without Going Viral",
    slug: "purpose-without-viral",
    excerpt: "Purpose is built in private long before it is seen.",
    content: `Purpose is not a aesthetic reel. It is salah on time, parents honored, skills learned, community served.

Imam Ali (AS) led nations but began with inner discipline.

Ask: *What would still matter if no one clapped?*`,
    seo_description: "Reflection on purpose and identity for Muslim youth.",
    type: "youth",
    corner_topics: ["purpose", "identity-crisis"],
    created_at: "2025-03-16T08:00:00Z",
  },
];

export const studentTopics = [
  { slug: "focus-productivity", title: "Focus & Productivity", description: "Build deep work in a distracted world.", icon: "target" },
  { slug: "exam-anxiety", title: "Exam Anxiety", description: "Calm the mind before the paper.", icon: "brain" },
  { slug: "social-media-addiction", title: "Social Media Addiction", description: "Reclaim hours the feed stole.", icon: "smartphone" },
  { slug: "laziness", title: "Laziness", description: "Break inertia with small wins.", icon: "zap" },
  { slug: "career-pressure", title: "Career Pressure", description: "Purpose beyond grades and titles.", icon: "briefcase" },
  { slug: "time-management", title: "Time Management", description: "Your days are numbered — spend wisely.", icon: "clock" },
  { slug: "dopamine-distraction", title: "Dopamine Distraction", description: "Understand the hijack, then heal.", icon: "activity" },
];

export const youthTopics = [
  { slug: "haram-relationships", title: "Haram Relationships", description: "Clarity before attachment deepens.", icon: "heart" },
  { slug: "loneliness", title: "Loneliness", description: "Belonging without performing.", icon: "users" },
  { slug: "identity-crisis", title: "Identity Crisis", description: "Who are you when the likes stop?", icon: "user" },
  { slug: "validation-addiction", title: "Validation Addiction", description: "Free yourself from the audience.", icon: "star" },
  { slug: "overthinking", title: "Overthinking", description: "When the mind will not rest.", icon: "cloud" },
  { slug: "purpose", title: "Purpose", description: "Find direction beyond trends.", icon: "compass" },
  { slug: "self-respect", title: "Self Respect", description: "Honor that does not need approval.", icon: "shield" },
  { slug: "emotional-discipline", title: "Emotional Discipline", description: "Feel fully, act wisely.", icon: "balance" },
];

export const platformTopics = [
  { slug: "self-discipline", title: "Self Discipline", description: "Small choices that compound into character." },
  { slug: "spirituality", title: "Spirituality", description: "Living faith beyond performance." },
  { slug: "leadership", title: "Leadership", description: "Serve before you seek to be seen." },
  { slug: "justice", title: "Justice", description: "Stand firm when comfort says stay silent." },
  { slug: "family", title: "Family", description: "Mercy and boundaries under one roof." },
  { slug: "society", title: "Society", description: "Be the citizen your community needs." },
  { slug: "self-control", title: "Self Control", description: "Master the nafs in a hyper-stimulated age." },
  { slug: "purpose", title: "Purpose", description: "Why you were given this life, today." },
];

export const digitalDiseases = [
  {
    slug: "instagram-addiction",
    title: "Instagram Addiction",
    description: "Comparison dressed as inspiration.",
    href: "/student/social-media-addiction",
  },
  {
    slug: "doomscrolling",
    title: "Doomscrolling",
    description: "Consuming catastrophe without action.",
    href: "/articles/before-you-open-instagram",
  },
  {
    slug: "validation-addiction",
    title: "Validation Addiction",
    description: "Likes as a substitute for self-worth.",
    href: "/youth/validation-addiction",
  },
  {
    slug: "fake-online-identity",
    title: "Fake Online Identity",
    description: "Performing a self you do not live offline.",
    href: "/youth/identity-crisis",
  },
  {
    slug: "dopamine-overload",
    title: "Dopamine Overload",
    description: "When nothing real feels exciting enough.",
    href: "/student/dopamine-distraction",
  },
  {
    slug: "attention-destruction",
    title: "Attention Destruction",
    description: "The slow loss of depth.",
    href: "/student/focus-productivity",
  },
];

export const beforeYouTextPrompts = [
  { id: "1", question: "Am I texting from loneliness or from clarity?", category: "loneliness" },
  { id: "2", question: "Will this message protect my dignity or trade it for a reply?", category: "self-respect" },
  { id: "3", question: "Is this relationship moving toward halal or away from it?", category: "haram-relationships" },
  { id: "4", question: "Have I made dua about this, or only drafted messages?", category: "spirituality" },
  { id: "5", question: "If they never reply, will I still respect myself tomorrow?", category: "toxic-attachment" },
];