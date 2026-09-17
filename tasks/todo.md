## Task 1: Upgrade to text-embedding-004

**Description:** Switch the embedding model from gemini-embedding-001 to text-embedding-004 in `embeddings.ts`.

**Acceptance criteria:**
- [x] `generateEmbedding` uses `models/text-embedding-004`.
- [x] Fallback legacy models are removed to reduce code bloat.

**Verification:**
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: Search still works in the app.

**Dependencies:** None

**Files likely touched:**
- `src/lib/rag/embeddings.ts`

**Estimated scope:** XS

---

## Task 2: Implement Postgres FTS & Metadata Pre-Filtering

**Description:** Refactor `retrieval.ts` and the Supabase RPC call to pass the extracted sermon/letter number directly to the database as a metadata filter (`source = '...'`), eliminating the need for complex post-retrieval threshold hacking.

**Acceptance criteria:**
- [x] If `SPECIFIC_REFERENCE_REGEX` matches, pass the number to Supabase.
- [x] Update the RPC call `match_wisdom_embeddings` to accept a filter parameter.

**Verification:**
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: Searching for "Sermon 12" exactly returns Sermon 12.

**Dependencies:** Task 1

**Files likely touched:**
- `src/lib/rag/retrieval.ts`
- Supabase SQL Migration / Function definition

**Estimated scope:** M

---

## Checkpoint: Foundation
- [x] Search works end-to-end.
- [x] Exact citations bypass semantic thresholding reliably.
- [x] Review with human before proceeding.
