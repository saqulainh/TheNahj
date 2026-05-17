import Link from "next/link";
import { notFound } from "next/navigation";
import { platformTopics } from "@/data/mock";
import { getCategories, getWisdomByCategory } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

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

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <Link href="/topics" className="text-sm text-muted hover:text-gold-light">
        ← Topics
      </Link>
      <h1 className="mt-8 text-3xl font-medium text-foreground">
        {category?.name ?? platformTopic?.title}
      </h1>
      {platformTopic && <p className="mt-4 text-muted">{platformTopic.description}</p>}

      {wisdom.length > 0 ? (
        <section className="mt-12 space-y-8">
          {wisdom.map((w, i) => (
            <WisdomCard key={w.id} wisdom={w} index={i} />
          ))}
        </section>
      ) : (
        <p className="mt-12 text-muted">
          Wisdom for this theme will appear as content grows. Explore{" "}
          <Link href="/wisdom" className="text-gold-light">
            all wisdom
          </Link>
          .
        </p>
      )}
    </section>
  );
}
