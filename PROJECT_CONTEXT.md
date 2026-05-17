# PROJECT_CONTEXT.md

## Project Overview
**Name:** TheNahj
**Vision:** A modern digital platform inspired by Imam Ali (AS) that helps youth, students, and everyday people navigate modern life through wisdom, reflection, discipline, spirituality, and self-improvement.

## Core Positioning
“Helping modern youth navigate life through the wisdom of Imam Ali (AS).”

## Target Audience
- Muslim Gen Z youth
- Students & Young professionals
- Self-improvement seekers
- Shia youth

## Technology Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion
- **Backend/Database:** Supabase (PostgreSQL, Storage, Auth)
- **Deployment:** Vercel (Frontend), Supabase (Backend)
- **State Management:** React Hooks, Supabase Client

## Core Features
- **Home Page:** Hero, Daily Wisdom, Featured Reflection, Corner Previews.
- **Imam Ali Says:** Dynamic wisdom cards with Arabic, Urdu, and English translations.
- **Student Corner:** Focus & Productivity, Exam Anxiety, Social Media Addiction.
- **Youth Corner:** Emotional Guidance, Loneliness, Identity Crisis, Purpose.
- **Digital Diseases:** Addressing modern addictions (Instagram, Doomscrolling).
- **Deep Focus Mode:** Pomodoro timer with immersive UI and ambient sounds.
- **Admin Panel:** Content management for wisdom cards, articles, and categories.

## Key Flows
1. **Wisdom Consumption:** User lands on Home -> Sees Wisdom Card -> Clicks for Deep Reflection Page.
2. **Student/Youth Guidance:** User navigates to Corners -> Browses topics -> Reads articles/reflections.
3. **Focus Sessions:** User enters Focus Mode -> Sets Pomodoro -> Immersive environment starts.
4. **Content Creation:** Admin logs in -> Fills Wisdom Form -> Dynamic Card & Page generated.

## Dependencies (Current)
- `next`: ^14+
- `lucide-react`: For icons
- `@supabase/supabase-js`: Backend integration
- `framer-motion`: Animations
- `clsx`, `tailwind-merge`: Styling utilities
