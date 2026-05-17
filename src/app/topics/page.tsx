import Link from "next/link";
import { platformTopics } from "@/data/mock";
import { getCategories } from "@/lib/wisdom";

export const metadata = {
  title: "Topics",
  description: "Explore wisdom by theme — discipline, spirituality, leadership, and more.",
};

export default async function TopicsPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Topics</h1>
      <p className="mt-4 text-muted">Themes that shape character and direction.</p>

      <h2 className="mt-12 mb-6 text-sm uppercase tracking-wider text-gold-muted">
        Wisdom categories
      </h2>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/topics/${cat.slug}`}
            className="rounded-xl border border-border/80 bg-surface p-6 transition-all hover:border-gold/30"
          >
            <h3 className="font-medium text-foreground">{cat.name}</h3>
          </Link>
        ))}
      </section>

      <h2 className="mt-16 mb-6 text-sm uppercase tracking-wider text-gold-muted">
        Life themes
      </h2>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platformTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="rounded-xl border border-border/80 bg-surface p-6 transition-all hover:border-gold/30"
          >
            <h3 className="font-medium text-foreground">{topic.title}</h3>
            <p className="mt-2 text-sm text-muted">{topic.description}</p>
          </Link>
        ))}
      </section>
    </section>
  );
}
