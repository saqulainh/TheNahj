# CODING_RULES.md

## General Principles
- **Clean Code:** Write self-documenting code. Use descriptive variable and function names.
- **Separation of Concerns:** Keep UI logic, business logic, and data fetching separate.
- **DRY (Don't Repeat Yourself):** Abstract common logic into hooks or utility functions.

## Naming Conventions
- **Components:** PascalCase (e.g., `WisdomCard.tsx`).
- **Files/Folders:** kebab-case (e.g., `digital-diseases/page.tsx`).
- **Functions/Variables:** camelCase (e.g., `fetchWisdomData`).
- **CSS Classes:** Tailwind utility classes.

## Patterns
- **Next.js App Router:** Use Server Components by default. Use `'use client'` only when necessary (interactivity, hooks).
- **Data Fetching:** Prefer server-side fetching for SEO and performance.
- **Components:** Use Functional Components with TypeScript.
- **Styles:** Use Tailwind CSS for all styling. Follow the "Cinematic Minimalism" design system.

## Design System Tokens (Tailwind)
- **Colors:** 
  - Background: `bg-black` (default), `bg-zinc-950` (matte).
  - Accents: `text-amber-500` or `text-yellow-600` (Gold).
  - Surfaces: `bg-zinc-900/50` with backdrop-blur.
- **Typography:**
  - Headings: Elegant serif/sans-serif mix.
  - Body: Modern sans-serif (Inter/Roboto).
  - Arabic: Traditional elegant script.

## Rules for AI Assistant
1. **Always reference engineering docs:** Check PROJECT_CONTEXT.md and ARCHITECTURE.md before generating code.
2. **Follow existing patterns:** Look at existing components for style and logic consistency.
3. **Commit after stable features:** Suggest committing changes after implementing a discrete feature.
4. **Refactor continuously:** Don't let technical debt accumulate.
