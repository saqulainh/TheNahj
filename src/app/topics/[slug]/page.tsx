export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { platformTopics } from "@/data/mock";
import { getCategories, getWisdomByCategory } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { themeExperienceBySlug } from "@/lib/content-experience";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  const topic = platformTopics.find((t) => t.slug === slug);
  return { title: cat?.name ?? topic?.title ?? "Topic" };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  const platformTopic = platformTopics.find((t) => t.slug === slug);

  if (!category && !platformTopic) notFound();

  const wisdom = category ? await getWisdomByCategory(slug) : [];
  const experience = themeExperienceBySlug[slug];
  const heading = category?.name ?? platformTopic?.title ?? "Theme";
  const intro = experience?.intro || platformTopic?.description || `Explore core wisdom under ${heading}.`;
  const whyItMatters = experience?.whyItMatters || "This theme offers practical guidance for modern life while staying rooted in authentic tradition.";
  const relatedTopics = experience?.relatedTopics || [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Link href="/topics" className="text-sm text-muted hover:text-gold-light">
        ← Themes
      </Link>

      <div className="mt-6 rounded-3xl border border-border/30 bg-[linear-gradient(160deg,_hsl(var(--surface-elevated)/0.7),_hsl(var(--surface)/0.45))] p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-muted">Theme</p>
        <h1 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">{heading}</h1>
        <p className="mt-4 max-w-3xl text-muted">{intro}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/30 bg-surface/55 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Why It Matters</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{whyItMatters}</p>
        </article>
        <article className="rounded-2xl border border-border/30 bg-surface/55 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Related Topics</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedTopics.length > 0 ? relatedTopics.map((topic) => (
              <Link key={topic} href={`/topics/${topic}`} className="rounded-full border border-border/40 bg-background/70 px-3 py-1.5 text-xs text-muted hover:border-gold/30 hover:text-foreground">
                {topic.replace(/-/g, " ")}
              </Link>
            )) : <p className="text-sm text-muted">Topics will appear as this theme grows.</p>}
          </div>
        </article>
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.2em] text-gold-muted">Wisdom Collection</h2>
          <Link href="/wisdom" className="text-xs text-muted hover:text-gold-light">See all wisdom →</Link>
        </div>
        {wisdom.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {wisdom.map((w, i) => (
              <WisdomCard key={w.id} wisdom={w} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Wisdom for this theme will appear as content grows. Explore <Link href="/wisdom" className="text-gold-light">all wisdom</Link>.
          </p>
        )}
      </section>
    </section>
  );
}
