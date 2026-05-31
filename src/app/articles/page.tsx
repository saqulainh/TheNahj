export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllArticles } from "@/lib/wisdom";

export const metadata = {
  title: "Articles",
  description: "Reflections, stories, and guidance for students and youth.",
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Articles</h1>
      <p className="mt-4 text-muted">Longer reflections for when you need more than a card.</p>

      <section className="mt-12 space-y-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block rounded-xl border border-border/80 bg-surface p-6 transition-all hover:border-gold/30"
          >
            <span className="text-xs uppercase tracking-wider text-gold-muted">{article.type}</span>
            <h2 className="mt-2 text-xl font-medium text-foreground">{article.title}</h2>
            <p className="mt-2 text-sm text-muted">{article.excerpt}</p>
          </Link>
        ))}
      </section>
    </section>
  );
}
