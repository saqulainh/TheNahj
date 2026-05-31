export const dynamic = "force-dynamic";

import Link from "next/link";
import { youthTopics } from "@/data/mock";
import { getAllWisdom } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Youth Corner",
  description: "Guidance on identity, relationships, loneliness, and emotional discipline.",
};

export default async function YouthPage() {
  const wisdom = await getAllWisdom();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Youth Corner</h1>
      <p className="mt-4 max-w-xl text-muted">
        Relatable reflection for the struggles Gen Z actually faces — with dignity and wisdom.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {youthTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/youth/${topic.slug}`}
            className="rounded-xl border border-border/80 bg-surface p-6 transition-all hover:border-gold/30"
          >
            <h2 className="font-medium text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted">{topic.description}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/before-you-text"
        className="mt-10 block rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center"
      >
        <span className="text-gold-light">Before You Text Them →</span>
        <p className="mt-2 text-sm text-muted">Pause. Reflect. Protect your dignity.</p>
      </Link>

      <h2 className="mt-16 mb-8 text-xl font-medium">Featured wisdom</h2>
      <section className="grid gap-6 md:grid-cols-2">
        {wisdom.slice(2, 4).map((w, i) => (
          <WisdomCard key={w.id} wisdom={w} index={i} />
        ))}
      </section>
    </div>
  );
}
