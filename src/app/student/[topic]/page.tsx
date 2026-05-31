export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { studentTopics } from "@/data/mock";
import { getWisdomByCornerTopic, getArticlesByCornerTopic } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { topic } = await params;
  const item = studentTopics.find((t) => t.slug === topic);
  return { title: item?.title ?? "Student Topic" };
}

export default async function StudentTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const item = studentTopics.find((t) => t.slug === topic);
  if (!item) notFound();

  const [wisdom, articles] = await Promise.all([
    getWisdomByCornerTopic(topic),
    getArticlesByCornerTopic(topic),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <Link href="/student" className="text-sm text-muted hover:text-gold-light">
        ← Student Corner
      </Link>
      <h1 className="mt-8 text-3xl font-medium text-foreground">{item.title}</h1>
      <p className="mt-4 text-muted">{item.description}</p>

      {wisdom.length > 0 && (
        <section className="mt-12 space-y-8">
          <h2 className="text-sm uppercase tracking-wider text-gold-muted">Wisdom</h2>
          {wisdom.map((w, i) => (
            <WisdomCard key={w.id} wisdom={w} index={i} />
          ))}
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-sm uppercase tracking-wider text-gold-muted">Articles</h2>
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block rounded-xl border border-border/80 bg-surface p-5 hover:border-gold/30"
              >
                <h3 className="font-medium text-foreground">{article.title}</h3>
                <p className="mt-2 text-sm text-muted">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {wisdom.length === 0 && articles.length === 0 && (
        <p className="mt-12 text-center text-muted">More content for this topic is coming soon.</p>
      )}
    </section>
  );
}
