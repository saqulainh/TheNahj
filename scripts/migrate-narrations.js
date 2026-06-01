#!/usr/bin/env node
/*
Migration script: convert legacy `narration` -> `translation` in `articles_unified.narrations`.
Usage:
  1) Install: npm install @supabase/supabase-js
  2) Run dry-run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-narrations.js --dry
  3) Apply:    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-narrations.js

Caution: run on a backup or review diffs before applying in production.
*/

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry') || args.includes('--dry-run');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  console.log('Fetching articles with narrations...');
  const { data, error } = await supabase
    .from('articles_unified')
    .select('id, slug, narrations')
    .not('narrations', 'is', null);

  if (error) {
    console.error('Error fetching rows:', error.message || error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No rows with narrations found. Nothing to do.');
    return;
  }

  console.log(`Found ${data.length} rows. Processing...`);

  let changed = 0;

  for (const row of data) {
    const original = row.narrations;
    if (!Array.isArray(original) || original.length === 0) continue;

    const mapped = original.map((n) => {
      if (typeof n === 'string') {
        // legacy string entry -> translation
        return { id: `narr-migrated-${Date.now()}`, translation: n };
      }
      if (n && typeof n === 'object') {
        const copy = { ...n };
        if (typeof copy.narration === 'string' && !copy.translation && !copy.arabic) {
          copy.translation = copy.narration;
        }
        delete copy.narration;
        // ensure an id exists
        if (!copy.id) copy.id = `narr-migrated-${Date.now()}`;
        return copy;
      }
      return n;
    });

    // detect if any change
    const needsUpdate = JSON.stringify(mapped) !== JSON.stringify(original);
    if (!needsUpdate) continue;

    changed++;
    console.log(`Row ${row.id} (${row.slug}) will be updated.`);
    if (dryRun) continue;

    const { error: upErr } = await supabase.from('articles_unified').update({ narrations: mapped }).eq('id', row.id);
    if (upErr) {
      console.error(`Failed to update ${row.id}:`, upErr.message || upErr);
    } else {
      console.log(`Updated ${row.id}`);
    }
  }

  console.log(`Done. Rows changed: ${changed}. Dry run: ${dryRun}`);
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
