const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\r\n]+)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  console.log('Checking Supabase connection to:', urlMatch[1]);
  const { count, error } = await supabase.from('wisdom_embeddings').select('*', { count: 'exact', head: true });
  console.log('wisdom_embeddings row count:', count, 'Error:', error?.message || 'none');

  const { data: sample, error: sampleErr } = await supabase.from('wisdom_embeddings').select('id, content, metadata').limit(3);
  console.log('Sample rows:', sample, 'Error:', sampleErr?.message || 'none');

  const { count: wisdomCount, error: wErr } = await supabase.from('wisdom').select('*', { count: 'exact', head: true });
  console.log('wisdom table row count:', wisdomCount, 'Error:', wErr?.message || 'none');
}

check().catch(console.error);
