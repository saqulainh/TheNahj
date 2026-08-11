# 📂 Project Structure & Architecture Guide — TheNahj

This document describes the professional directory arrangement of **TheNahj** Next.js codebase.

---

## 📁 Root Directory Layout

```text
empty-window/
├── docs/                        # Project Documentation & Specifications
│   ├── ARCHITECTURE.md
│   ├── ARCHITECTURE_CONTRACT.md
│   ├── CODING_RULES.md
│   ├── FEATURE_LOG.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PROJECT_CONTEXT.md
│   ├── PUBLISH_VALIDATION_CHECKLIST.md
│   └── SETUP.md
├── public/                      # Static Assets (Images, Icons, Audios)
├── scripts/                     # Helper Scripts & Scaffolding Utilities
│   └── scaffold-admin.js
├── src/                         # Application Source Code
│   ├── app/                     # Next.js App Router (Pages, Layouts, APIs)
│   ├── components/              # Modular UI Components
│   ├── data/                    # App Data & CMS Configuration
│   ├── lib/                     # Utilities, Database Clients & Helpers
│   └── middleware.ts            # Route Security & Protection Middleware
├── supabase/                    # Database Migrations & Schemas
│   └── schema.sql
├── .env.example                 # Environment Variables Template
├── .env.local                   # Local Secrets (Git Ignored)
├── next.config.ts               # Next.js Configuration
├── package.json                 # Project Dependencies & NPM Scripts
└── tailwind.config.ts           # Tailwind CSS Theme & Styling Config
```

---

## 🧩 Source Code Structure (`src/`)

### 1. `src/app/` — Routing Layer (Next.js App Router)
- **`(public)` pages**: `/`, `/wisdom`, `/student`, `/youth`, `/nahjul-balagha`, `/audio`, `/focus`, `/daily`, `/digital-diseases`, `/before-you-text`
- **`admin/`**: CMS Studio and Management Dashboard
- **`api/`**: Backend Endpoints (`/api/content`, `/api/media`, `/api/tags`, `/api/auth`)

### 2. `src/components/` — UI Layer (Domain Driven)
- **`ui/`**: Low-level reusable UI primitives (Buttons, Cards, Modals, PrismaHero)
- **`layout/`**: Structural header, footer, navigation
- **`wisdom/`**: Wisdom Cards, Reflection practice, Reading progress
- **`home/`**: Homepage specific sections (Hero, StruggleSelector, Newsletter)
- **`admin/`**: CMS Studio panels, editors, and sidebars
- **`focus/`**: Focus timer & audio tools

### 3. `src/lib/` — Business & Data Layer
- **`supabase.ts`**: Supabase Client & DB connection
- **`wisdom.ts`**: Content retrieval & caching logic
- **`auth.ts`**: Admin session & verification
- **`cms.ts`**: Configuration loading and theme management

---

## 🔒 Ignored & Generated Folders
The following directories are automatically managed or created by IDEs/AI tools and ignored in Git:
- `.next/`, `node_modules/`
- `.kilo/`, `.qodo/`, `.vscode/`
- `agent-transcripts/`, `canvases/`, `narration/`, `terminals/`, `mcps/`
