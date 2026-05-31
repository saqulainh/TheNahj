export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { studentTopics } from "@/data/mock";
import { getWisdomByCornerTopic, getArticlesByCornerTopic } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { topicExperienceBySlug } from "@/lib/content-experience";

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
  const exp = topicExperienceBySlug[topic];
  const relatedTopics = (exp?.relatedTopics || []).filter((slug) => slug !== topic);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Link href="/student" className="text-sm text-muted hover:text-gold-light">
        ← Student Corner
      </Link>

      <div className="mt-6 rounded-3xl border border-border/30 bg-[linear-gradient(150deg,_hsl(var(--surface-elevated)/0.72),_hsl(var(--surface)/0.5))] p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-muted">Topic Hub</p>
        <h1 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-muted">{exp?.intro || item.description}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/30 bg-surface/55 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Why This Matters Today</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{exp?.whyMattersToday || item.description}</p>
        </article>
        <article className="rounded-2xl border border-border/30 bg-surface/55 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Current Challenges</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {(exp?.currentChallenges || ["Inconsistent routine", "Attention fragmentation", "Stress and comparison"]).map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/30 bg-background/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Student Relevance</p>
          <p className="mt-3 text-sm text-muted">{exp?.studentRelevance || "This topic supports better learning systems, discipline, and exam confidence."}</p>
        </article>
        <article className="rounded-2xl border border-border/30 bg-background/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Youth Relevance</p>
          <p className="mt-3 text-sm text-muted">{exp?.youthRelevance || "It also shapes identity, emotional regulation, and long-term personal growth."}</p>
        </article>
      </div>

      {wisdom.length > 0 && (
        <section className="mt-12 space-y-8">
          <h2 className="text-sm uppercase tracking-wider text-gold-muted">Wisdom Collection</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {wisdom.map((w, i) => (
              <WisdomCard key={w.id} wisdom={w} index={i} />
            ))}
          </div>
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

      <section className="mt-12">
        <h2 className="text-sm uppercase tracking-wider text-gold-muted">Related Topics</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {relatedTopics.length > 0 ? relatedTopics.map((slug) => (
            <Link key={slug} href={`/student/${slug}`} className="rounded-full border border-border/40 bg-background/70 px-3 py-1.5 text-xs text-muted hover:border-gold/30 hover:text-foreground">
              {slug.replace(/-/g, " ")}
            </Link>
          )) : studentTopics.filter((t) => t.slug !== topic).slice(0, 4).map((t) => (
            <Link key={t.slug} href={`/student/${t.slug}`} className="rounded-full border border-border/40 bg-background/70 px-3 py-1.5 text-xs text-muted hover:border-gold/30 hover:text-foreground">
              {t.title}
            </Link>
          ))}
        </div>
      </section>

      {wisdom.length === 0 && articles.length === 0 && (
        <p className="mt-12 text-center text-muted">More content for this topic is coming soon.</p>
      )}
    </section>
  );
}
