Migration helper: narrations

This folder contains a small Node script to help convert legacy `narration` values
in `articles_unified.narrations` into the new shape (`translation` and `arabic`).

Prerequisites
- Set the environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service role key required for updates).
- Install dependency:

```bash
npm install @supabase/supabase-js
```

Dry run

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-narrations.js --dry
```

Apply changes

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-narrations.js
```

Notes
- The script is safe to run multiple times; it generates ids for migrated entries when missing.
- Always run a dry-run first and back up your DB before applying to production.
