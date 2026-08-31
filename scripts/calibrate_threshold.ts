import { config } from "dotenv";
import { wisdomItems } from "../src/data/mock.js";
import { generateEmbedding } from "../src/lib/rag/embeddings.js";

config({ path: ".env.local" });

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const TEST_CASES = [
  {
    category: "1. EXACT RELEVANT MATCH (Target should score HIGH)",
    query: "O son of Adam! You are but a collection of days",
    expectedTarget: "value-of-youth-and-health"
  },
  {
    category: "2. TOPICAL / THEMATIC RELEVANT (Target should score GOOD)",
    query: "How to deal with anger and self control",
    expectedTarget: "mastery-over-anger"
  },
  {
    category: "3. LOW-CONFIDENCE / UNRELATED (Should score LOW)",
    query: "Quantum physics, nuclear fusion and semiconductor microchips",
    expectedTarget: null
  },
  {
    category: "4. FAKE REFERENCE (Should score LOW against all items)",
    query: "Khutba 999 regarding mechanical airplanes and spacecraft",
    expectedTarget: null
  },
  {
    category: "5. OUT-OF-DOMAIN GENERAL (Should score LOW)",
    query: "Latest stock market crypto trading bitcoin price forecast",
    expectedTarget: null
  }
];

async function runCalibration() {
  console.log("=================================================================");
  console.log("   EMPIRICAL RAG SIMILARITY CALIBRATION (gemini-embedding-001)   ");
  console.log("=================================================================\n");

  console.log("1. Generating real 768-dim embeddings for 10 corpus wisdom items...");
  const corpusVectors: { item: any; vector: number[] }[] = [];

  for (const item of wisdomItems) {
    const text = `[${item.source}] ${item.english_translation} ${item.urdu_translation || ""} ${item.category?.name || ""}`;
    const vec = await generateEmbedding(text);
    if (vec) {
      corpusVectors.push({ item, vector: vec });
    }
  }
  console.log(`? Generated ${corpusVectors.length} real corpus vectors (dim=${corpusVectors[0].vector.length}).\n`);

  console.log("2. Testing query score distributions...\n");

  for (const test of TEST_CASES) {
    console.log(`[TEST] ${test.category}`);
    console.log(`Query: "${test.query}"`);
    
    const queryVec = await generateEmbedding(test.query);
    if (!queryVec) {
      console.error("  FATAL: Query vector generation failed!");
      continue;
    }

    const scored = corpusVectors.map(({ item, vector }) => ({
      source: item.source,
      slug: item.slug,
      quote: item.english_translation.substring(0, 60) + "...",
      similarity: cosineSimilarity(queryVec, vector),
    })).sort((a, b) => b.similarity - a.similarity);

    console.log(`  Top 3 Closest Matches:`);
    scored.slice(0, 3).forEach((s, idx) => {
      console.log(`    ${idx + 1}. [Score: ${s.similarity.toFixed(4)}] ${s.source} (${s.slug}) -> "${s.quote}"`);
    });
    console.log(`  Highest Cosine Similarity = ${scored[0].similarity.toFixed(4)}`);
    console.log("-----------------------------------------------------------------");
  }
}

runCalibration().catch(console.error);
