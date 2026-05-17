-- TheNahj Authentic Seed Data Migration
-- Paste and run this script in your Supabase SQL Editor

-- 1. SEEDING WISDOM CARDS (Imam Ali AS Sayings)
INSERT INTO wisdom (
  slug, arabic_text, urdu_translation, english_translation, 
  short_reflection, deep_reflection, simple_meaning, why_today, 
  reflection_questions, action_steps, source, category_id, 
  tags, corner_topics, featured, trending
) VALUES
(
  'value-of-youth-and-health',
  'يَا بْنَ آدَمَ، إِنَّمَا أَنْتَ أَيَّامٌ، كُلَّمَا ذَهَبَ يَوْمٌ ذَهَبَ بَعْضُكَ.',
  'اے ابن آدم! تو صرف چند دنوں کا مجموعہ ہے۔ جب ایک دن گزر جاتا ہے تو تیرا ایک حصہ ختم ہو جاتا ہے۔',
  'O son of Adam! You are but a collection of days. When one day passes, a part of you has gone forever.',
  'Your youth and health are not guaranteed. Every scroll steals a day you cannot buy back.',
  'Imam Ali (AS) reminds us that our existence is measured in days, not years of procrastination. Each morning is a deposit; each night is a withdrawal you cannot reverse. For students drowning in doomscrolling, this is not guilt — it is clarity. The algorithm will always want more of your hours. Your soul wants fewer, but deeper, days.',
  'Life is counted in days that never return. Waste fewer of them on what does not build you.',
  'Gen Z loses hours daily to infinite feeds. This wisdom names the loss before it becomes regret.',
  '["Which app took the most of my yesterday?", "If today were my last productive day this month, what would I protect?", "What is one hour I can reclaim for something that matters?"]'::jsonb,
  '["Delete one app from your home screen for 24 hours.", "Set a 25-minute focus block before opening social media.", "Write three things you want this week to remember about you."]'::jsonb,
  'Nahjul Balagha',
  (SELECT id FROM categories WHERE slug = 'time' LIMIT 1),
  '{"time", "youth", "focus"}',
  '{"time-management", "social-media-addiction", "dopamine-distraction", "focus-productivity"}',
  true, true
),
(
  'knowledge-seeks-the-eager',
  'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ.',
  'ہر انسان کی قیمت وہ ہنر اور علم ہے جسے وہ بہترین انداز میں جانتا ہے۔',
  'The value of every person is in what they do well (their knowledge and skill).',
  'Laziness is not a personality — it is a habit you can break one small session at a time.',
  'Knowledge in the school of Ali (AS) is not hoarding facts for exams alone. It is sharpening the soul to see truth, resist injustice, and serve others. When you feel too tired to study, the shaytan whispers that you are not capable. Imam Ali (AS) teaches the opposite: effort invites divine help. Start ugly. Start small. Start now.',
  'Learning is worship. Effort attracts help. Your worth is tied to your pursuit of excellence.',
  'Students compare themselves to highlight reels and freeze. This wisdom redirects comparison into action.',
  '["What is the smallest topic I can revise in 10 minutes?", "Am I avoiding study because I fear failure or because I lack a plan?"]'::jsonb,
  '["Open your notes and study one paragraph only.", "Tell a friend your 25-minute focus goal for accountability."]'::jsonb,
  'Nahjul Balagha, Saying 81',
  (SELECT id FROM categories WHERE slug = 'knowledge' LIMIT 1),
  '{"study", "knowledge", "excellence"}',
  '{"laziness", "focus-productivity", "exam-anxiety"}',
  true, true
),
(
  'silence-is-wisdom',
  'إِذَا تَمَّ الْعَقْلُ نَقَصَ الْكَلاَمُ.',
  'جب عقل مکمل ہو جاتی ہے تو گفتگو کم ہو جاتی ہے۔',
  'When the intellect becomes complete, speech becomes less.',
  'Before you text them at 1am, silence might be the stronger love — for yourself.',
  'Imam Ali (AS) valued measured speech. In an age of constant attachment and loneliness, we flood inboxes seeking proof we exist. Sometimes dignity is the message you do not send. True intellect filters out noise.',
  'Not every feeling needs to be sent. Speak only when it improves upon the silence.',
  'Impulsive messaging fuels haram attachment and regret. Youth need to reclaim the power of withholding speech.',
  '["Will this text heal or hook me?", "Am I seeking closure or validation?"]'::jsonb,
  '["Use Before You Text reflection before sending.", "Sleep on emotional messages until fajr."]'::jsonb,
  'Nahjul Balagha, Saying 71',
  (SELECT id FROM categories WHERE slug = 'character' LIMIT 1),
  '{"discipline", "character", "silence"}',
  '{"haram-relationships", "self-respect", "overthinking"}',
  false, true
)
ON CONFLICT (slug) DO NOTHING;


-- 2. SEEDING ARTICLES (Youth & Student Corner Long-form)
INSERT INTO articles (
  title, slug, excerpt, content, type, corner_topics, seo_description
) VALUES
(
  'Before You Open Instagram Again',
  'before-you-open-instagram',
  'A 60-second pause between impulse and scroll.',
  'You do not need more content. You need one breath.

**Pause.** Feel your feet. Ask: *What am I avoiding right now?*

Often it is revision, a difficult conversation, or silence we have forgotten how to sit in. Imam Ali (AS) taught that hearts rust — and scrolling polishes nothing inside. 

The digital algorithm is designed by the smartest engineers in the world to hijack your dopamine. Every time you open the app without intention, you are surrendering your most valuable asset: your attention.

**Try this:** put the phone in another room for one pomodoro session. Not as a punishment, but as a practice of reclaiming your spiritual sovereignty.',
  'student',
  '{"social-media-addiction", "dopamine-distraction"}',
  'Reflection on social media addiction and dopamine detox for Muslim students.'
),
(
  'When Loneliness Feels Like a Character Flaw',
  'loneliness-not-a-flaw',
  'You are not broken for wanting to be known.',
  'Loneliness is not a sign that faith is weak. It is a sign you are human in an age of performance.

Imam Ali (AS) spoke of the soul''s need for sincere companionship — not crowds. He said: *"A true friend is one who is honest with you, not one who only agrees with you."*

In the digital era, we are more connected yet more isolated than ever. We curate personas for audiences who do not truly know us. Start small: one dua for a true friend, one act of kindness without posting it online, one hour offline where you exist completely without an audience.',
  'youth',
  '{"loneliness", "identity-crisis"}',
  'Youth guidance on loneliness, true companionship, and digital identity.'
)
ON CONFLICT (slug) DO NOTHING;


-- 3. SEEDING AUDIO TRACKS (Reflections Player)
INSERT INTO audio_tracks (
  title, subtitle, category, duration, audio_url
) VALUES
(
  'Silence Over Clutter', 'Nahjul Balagha Series', 'Spiritual', '4:15', '/sounds/solitude.mp3'
),
(
  'Rain & Focus', 'Study Ambient', 'Focus', '10:00', '/sounds/rain.mp3'
);

-- Done. Check your Supabase tables!
