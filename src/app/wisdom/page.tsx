export const dynamic = "force-dynamic";

import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { getAllWisdom, getCategories } from "@/lib/wisdom";
import Link from "next/link";

export const metadata = {
  title: "Imam Ali Says",
  description: "Wisdom cards with Arabic, Urdu, and English — reflections for modern life.",
};

export default async function WisdomPage() {
  const [wisdom, categories] = await Promise.all([getAllWisdom(), getCategories()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <nav className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Link href="/" className="transition-colors hover:text-gold">Home</Link>
        <span>→</span>
        <span className="text-gold-light">Imam Ali Says</span>
      </nav>

      <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        Imam Ali Says
      </h1>
      <p className="mt-4 text-muted">
        Quick wisdom for the scroll. Deep reflection when you are ready.
      </p>

      <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold-muted">Life Themes</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/wisdom"
          className="whitespace-nowrap rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs text-gold-light"
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/topics/${cat.slug}`}
            className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:border-gold/30 hover:text-foreground"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mt-12 space-y-8">
        {wisdom.map((w, i) => (
          <WisdomCard key={w.id} wisdom={w} index={i} />
        ))}
      </div>
    </div>
  );
}
