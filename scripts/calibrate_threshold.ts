
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "../src/lib/rag/embeddings.js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const TEST_QUERIES = [
  "Khutba 42",
  "Letter 53 to Malik Ashtar",
  "Saying 82 patience and faith",
  "Khutba 999",
  "Letter 205",
  "Saying 900 about airplanes",
];

async function runCalibration() {
  console.log("Starting Threshold Calibration...\n");

  for (const query of TEST_QUERIES) {
    const vector = await generateEmbedding(query);
    if (!vector) {
        console.log("NO VECTOR FOR ", query);
        continue;
    }

    const { data, error } = await supabase.rpc("match_wisdom_embeddings", {
      query_embedding: vector,
      match_threshold: 0.1,
      match_count: 3,
    });

    console.log(`Query: "${query}"`);
    if (data && data.length > 0) {
      data.forEach((match: any, i: number) => {
        console.log(`  [${i+1}] Score: ${match.similarity.toFixed(4)} | Source: ${match.metadata?.source || match.id}`);
      });
    } else {
      console.log(`  No matches returned by RPC. Error: ${error?.message || "none"}`);
    }
    console.log("---");
  }
}

runCalibration().catch(console.error);

