import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { wisdomItems } from "../src/data/mock.js";
import { generateEmbedding } from "../src/lib/rag/embeddings.js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function seed() {
  console.log("Seeding wisdom entries into Supabase pgvector...");
  const items = wisdomItems;
  console.log(`Found ${items.length} items to embed.`);

  let successCount = 0;

  for (let i = 0; i < items.length; i++) {
    const w = items[i];
    const textToEmbed = `[${w.source}] ${w.english_translation} ${w.urdu_translation || ""} ${w.category?.name || ""}`;
    
    console.log(`[${i + 1}/${items.length}] Generating embedding for: ${w.source}`);
    const embedding = await generateEmbedding(textToEmbed);

    if (!embedding) {
      console.error(`  -> Failed to generate embedding for ${w.source}`);
      continue;
    }

    const { error } = await supabase.from("wisdom_embeddings").upsert({
      id: "a0000000-0000-0000-0000-" + String(i + 1).padStart(12, '0'),
      content: `[${w.source}]: "${w.english_translation}"\nUrdu: "${w.urdu_translation || ""}"`,
      metadata: {
        source: w.source,
        slug: w.slug,
        category: w.category?.name,
        arabic_text: w.arabic_text,
      },
      embedding: embedding,
    });

    if (error) {
      console.error(`  -> Supabase insert error for ${w.source}:`, error.message);
    } else {
      successCount++;
      console.log(`  -> Inserted into wisdom_embeddings (${embedding.length} dims).`);
    }

    // Small delay to be polite to API
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nSeeding complete! Successfully embedded and stored ${successCount}/${items.length} entries in Supabase.`);
}

seed().catch(console.error);
