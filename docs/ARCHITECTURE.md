# ARCHITECTURE.md

## System Architecture
The platform now follows a Unified Content Engine architecture built on Next.js App Router.

All editorial sections (Imam Ali Says, Student Corner, Youth Corner, Nahjul Balagha, Articles, Audio Reflections) are treated as content categories inside one shared publishing engine, not separate systems.

```mermaid
graph TD
    User[User/Admin] --> Frontend[Next.js Frontend]
    Frontend --> SupabaseAuth[Supabase Auth]
    Frontend --> ContentAPI[/api/content]
    Frontend --> MediaAPI[/api/media]
    ContentAPI --> RateLimit[Rate Limit Layer]
    MediaAPI --> RateLimit
    ContentAPI --> SupabaseDB[(PostgreSQL articles_unified)]
    MediaAPI --> SupabaseStorage[Supabase Storage or Local Fallback]
    RateLimit --> Upstash[(Upstash Redis optional)]
    
    subgraph "Next.js App"
        Components[Components]
        AppRouter[App Router Pages]
        Studio[Unified Content Studio]
        Lib[lib content-schema/content services]
    end
```

## Layer Structure
- **Presentation Layer (src/components):**
    - `layout/`: Global shell, adaptive navbar, theme toggle.
    - `articles/`: Immersive reading surfaces and editorial components.
    - `wisdom/`: Cinematic cards and reflection interactions.
- **Application Layer (src/app):**
    - Public routes: homepage, category pages, immersive article pages.
    - Admin routes: one unified Content Studio (`/admin/studio`) with redirects from legacy section editors.
    - APIs: `/api/content` (unified publishing), `/api/media` (asset management).
- **Domain Layer (src/lib):**
    - `content-schema.ts`: category + block schemas (Zod).
    - `content.ts`: unified article retrieval + fallback conversion.
    - `stores/contentStudioStore.ts`: persisted draft state (Zustand).
    - `rate-limit.ts`: distributed (Upstash) or memory fallback throttling.
- **Data Layer (supabase/schema.sql + src/data):**
    - Primary model: `articles_unified` + `article_revisions`.
    - Supporting models: uploads, bookmarks, reflections, SEO metadata, activity logs.

## Data Flow
1. **Studio Authoring:** Admin edits in Content Studio -> React Hook Form + Zod validation -> autosave + optimistic mutation via TanStack Query -> `/api/content` upsert.
2. **Public Reading:** Dynamic article route requests unified content -> renders immersive article layout with block-based multilingual renderer.
3. **Media Handling:** Studio uploads file -> `/api/media` validation + storage write (Supabase bucket if available, local fallback otherwise) -> reusable asset URL injected into cards/hero/sidebar/blocks.
4. **Theme Adaptation:** CSS variable tokens + theme toggle drive all surfaces/cards/typography in both light and dark modes.
5. **Caching + SEO:** Tag-based content cache revalidation runs after writes; article metadata and JSON-LD are generated automatically from unified content fields.

## Module Structure
- `/src/app/admin/studio`: Unified editorial workspace.
- `/src/app/api/content`: Unified content write/read endpoint.
- `/src/app/api/media`: Media upload/gallery endpoint.
- `/src/components/articles/ImmersiveArticle.tsx`: Premium article experience.
- `/src/lib/content-schema.ts`: Block/category contract for whole platform.
- `/src/lib/content.ts`: Unified retrieval with legacy fallback.
- `/supabase/schema.sql`: Unified article and editorial support models.
