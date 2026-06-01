import Link from "next/link";
import type { Metadata } from "next";
import { searchDiscoveryContent } from "@/lib/discovery";

interface PageProps {
  searchParams: Promise<{ q?: string; section?: string; limit?: string }>;
}

export const metadata: Metadata = {
  title: "Search | TheNahj",
  description: "Search wisdom cards, articles, and related wisdom across TheNahj.",
};

function resultHref(kind: string, slug: string) {
  return kind === "article" ? `/articles/${slug}` : `/wisdom/${slug}`;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", section, limit } = await searchParams;
  const data = q.trim()
    ? await searchDiscoveryContent(q, {
        section: section || null,
        limit: Number(limit || "12") || 12,
      })
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <Link href="/wisdom" className="text-xs uppercase tracking-[0.22em] text-gold-muted hover:text-gold-light">
            ← Back to Wisdom
          </Link>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Search</p>
            <h1 className="text-3xl font-light tracking-tight text-foreground md:text-5xl">Discover related wisdom across sections</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-secondary/80">
              Search spans the unified card and article index, ranking exact topic matches first, then theme, section, tags, and audience affinity.
            </p>
          </div>
        </header>

        <form action="/search" className="grid gap-3 rounded-[1.5rem] border border-border/20 bg-surface/60 p-4 md:grid-cols-[1fr_220px_120px]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by topic, theme, source, or phrase"
            className="rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground outline-none"
          />
          <input
            type="text"
            name="section"
            defaultValue={section || ""}
            placeholder="Optional section"
            className="rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground outline-none"
          />
          <button type="submit" className="rounded-xl bg-gold/15 px-4 py-3 text-sm font-medium text-gold-light hover:bg-gold/25">
            Search
          </button>
        </form>

        {data ? (
          <>
            <section className="grid gap-3 rounded-[1.5rem] border border-border/20 bg-surface/55 p-4 text-sm text-secondary/85 md:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Matched</p>
                <p className="mt-1 text-2xl text-foreground">{data.observability.matched}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Candidates</p>
                <p className="mt-1 text-2xl text-foreground">{data.observability.totalCandidates}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Tokens</p>
                <p className="mt-1 text-2xl text-foreground">{data.observability.tokenCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Sources</p>
                <p className="mt-1 text-sm text-foreground">Wisdom {data.observability.sourceCounts.wisdom} / Article {data.observability.sourceCounts.article}</p>
              </div>
            </section>

            <section className="space-y-4">
              {data.results.length > 0 ? (
                data.results.map((item, index) => (
                  <Link
                    key={`${item.kind}:${item.slug}`}
                    href={resultHref(item.kind, item.slug)}
                    className="block rounded-[1.5rem] border border-border/20 bg-surface/60 p-5 transition-colors hover:border-gold/30 hover:bg-surface/75"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                      <span className="rounded-full border border-border/20 px-2.5 py-1 text-foreground/80">#{index + 1}</span>
                      <span className="rounded-full border border-border/20 px-2.5 py-1">{item.kind}</span>
                      <span className="rounded-full border border-border/20 px-2.5 py-1">{item.section}</span>
                      {item.theme && <span className="rounded-full border border-border/20 px-2.5 py-1">{item.theme}</span>}
                      {item.topic && <span className="rounded-full border border-border/20 px-2.5 py-1">{item.topic}</span>}
                    </div>
                    <h2 className="mt-3 text-xl font-medium text-foreground">{item.title}</h2>
                    <p className="mt-2 max-w-4xl text-sm leading-relaxed text-secondary/80">{item.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-gold/80">
                      {item.reasons.slice(0, 4).map((reason) => (
                        <span key={reason} className="rounded-full border border-border/20 px-2.5 py-1">
                          {reason.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-border/20 bg-surface/55 p-8 text-sm text-secondary/80">
                  No results yet. Try a section name, a topic like Focus & Productivity, or a source term.
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-border/20 bg-surface/55 p-8 text-sm text-secondary/80">
            Enter a query to search across the unified wisdom index.
          </div>
        )}
      </div>
    </main>
  );
}
