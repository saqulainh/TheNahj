# Implementation Plan: RAG Overhaul (Ponytail Mode)

## Overview
Re-architecting the RAG pipeline using the laziest, most native solutions that actually work. We will cut out hypothetical LLM calls (HyDE), complex custom BM25 algorithms, and custom chunkers. Instead, we lean on the platform (Postgres) and standard upgrades.

## Architecture Decisions (Ponytail Ladder Applied)
- **Upgrade to `text-embedding-004`**: Simple one-line config change. Replaces legacy model.
- **Postgres Metadata Filtering vs Post-Retrieval Regex**: We already have Postgres. Instead of vector-searching everything and regex-filtering the results locally, we pass the extracted sermon/letter number directly to a Postgres `where` clause. Less code, 100% accurate.
- **Postgres Full-Text Search (FTS) vs Custom BM25**: Skipped writing a custom TF-IDF/BM25 in TypeScript. Postgres natively supports FTS. We will use a Supabase RPC that combines pgvector and FTS.
- **HyDE (Query Expansion)**: *YAGNI*. Skipped. Adding an LLM call before the embedding call adds latency and complexity. Wait until users actually complain about poor recall on obscure topics before adding LLM preprocessing.
- **Semantic Chunking**: *YAGNI*. Skipped. Paragraph `\n\n` chunking works fine. A custom parser to align Arabic/English is over-engineering unless we have a specific bug report proving it breaks the app.

## Task List
*See `tasks/todo.md` for specific implementable tasks.*

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Vector DB re-indexing | High | Only necessary if dimension changes, but both are 768. We can avoid re-indexing if model embeddings are compatible, or just re-embed via a quick background script. |

## Open Questions
- Do we need to re-embed the entire database when switching to `text-embedding-004`, or is starting fresh acceptable?
