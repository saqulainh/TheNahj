import Link from "next/link";
import type { Metadata } from "next";
import { searchDiscoveryContent } from "@/lib/discovery";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";

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
              Search spans the unified card and article index with multilingual support for Arabic, Urdu, and English text.
            </p>
          </div>
        </header>

        <SmartSearchBar initialQuery={q} initialSection={section || ""} />

        <div className="pt-8">
          {!data ? (
            <div className="rounded-2xl border border-border/20 bg-surface/30 px-6 py-24 text-center">
              <p className="text-sm text-muted">Enter a keyword, topic, or phrase above to search.</p>
            </div>
          ) : data.results.length === 0 ? (
            <div className="rounded-2xl border border-border/20 bg-surface/30 px-6 py-24 text-center">
              <p className="text-sm text-muted">
                No results found for <span className="text-foreground">&quot;{q}&quot;</span>
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
                <span>{data.results.length} Results</span>
                <span>{data.observability.tokenCount} tokens searched</span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.results.map((result) => {
                  const href = resultHref(result.kind, result.slug);
                  // Highlight logic for RTL fields
                  const hasArabicMatch = result.reasons.includes("arabic-match");
                  const hasUrduMatch = result.reasons.includes("urdu-match");

                  return (
                    <Link
                      key={`${result.kind}-${result.id}`}
                      href={href}
                      className="group flex flex-col justify-between rounded-2xl border border-border/20 bg-surface/60 p-6 transition-colors hover:border-gold/30 hover:bg-surface/80"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-muted">
                          <span className="rounded bg-gold/10 px-1.5 py-0.5">{result.kind}</span>
                          <span>{result.section}</span>
                        </div>
                        
                        {hasArabicMatch && result.arabicText && (
                          <p className="text-xl font-arabic text-foreground text-right" dir="rtl">
                            {result.arabicText}
                          </p>
                        )}
                        
                        {hasUrduMatch && result.urduTranslation && (
                          <p className="text-sm font-urdu text-secondary/90 text-right" dir="rtl">
                            {result.urduTranslation}
                          </p>
                        )}
                        
                        <h3 className="font-medium leading-snug text-foreground group-hover:text-gold-light">
                          {result.title}
                        </h3>
                        
                        {result.excerpt && (
                          <p className="line-clamp-2 text-sm leading-relaxed text-secondary/80">
                            {result.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        {result.topic && (
                          <span className="rounded-full bg-border/20 px-2.5 py-1 text-[10px] font-medium text-muted">
                            {result.topic.replace(/-/g, " ")}
                          </span>
                        )}
                        {result.reasons.slice(0, 2).map((r) => (
                          <span key={r} className="rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold-muted">
                            {r.replace("-match", "")}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
