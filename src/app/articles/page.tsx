export const revalidate = 300;

import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllArticles } from "@/lib/wisdom";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Articles & Reflections",
  description: "Thoughtful reflections and practical guidance rooted in the wisdom of Imam Ali (AS).",
  path: "/articles",
});

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-muted">
        <Link href="/" className="transition-colors hover:text-gold-light">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gold-muted">Articles</span>
      </nav>

      <SectionHeading
        eyebrow="Read"
        title="Articles & reflections"
        description="Guidance for everyday questions, drawn from the wisdom of Imam Ali (AS)."
      />

      {articles.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-surface/50 px-6 py-14 text-center">
          <p className="text-sm text-muted">New reflections are on the way.</p>
          <Link href="/wisdom" className="mt-4 inline-flex text-sm font-medium text-gold-muted transition-colors hover:text-gold-light">
            Explore Imam Ali’s wisdom <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
