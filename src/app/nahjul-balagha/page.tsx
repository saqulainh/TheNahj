export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllWisdom } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Nahjul Balagha",
  description: "Wisdom drawn from Nahjul Balagha — sermons, letters, and sayings.",
};

export default async function NahjulBalaghaPage() {
  const wisdom = await getAllWisdom();
  const fromNahj = wisdom.filter((w) => w.source.toLowerCase().includes("nahjul"));

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-medium text-foreground">Nahjul Balagha</h1>
      <p className="mt-4 text-muted">
        Selected wisdom from the Peak of Eloquence — curated for modern reflection.
      </p>
      <section className="mt-12 space-y-8">
        {fromNahj.length > 0 ? (
          fromNahj.map((w, i) => <WisdomCard key={w.id} wisdom={w} index={i} />)
        ) : (
          <p className="text-muted">
            Explore all{" "}
            <Link href="/wisdom" className="text-gold-light">
              wisdom cards
            </Link>{" "}
            as we expand Nahjul Balagha content.
          </p>
        )}
      </section>
    </section>
  );
}
