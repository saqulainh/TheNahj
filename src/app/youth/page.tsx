export const dynamic = "force-dynamic";

import Link from "next/link";
import { youthTopics } from "@/data/mock";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Youth Corner — Islamic Guidance on Relationships, Identity & Purpose",
  description: "Haram relationships, loneliness, overthinking, validation addiction — Islamic wisdom from Imam Ali (AS) for Muslim youth navigating modern life with dignity.",
  keywords: [
    "Islamic youth guidance",
    "Haram relationship Islam",
    "Muslim youth loneliness",
    "Identity crisis Islam",
    "Overthinking Islamic advice",
    "Validation addiction Islam",
    "Self respect Islam",
    "Emotional discipline Islam",
    "Imam Ali on relationships",
    "Before you text Islamic",
  ],
  openGraph: {
    title: "Youth Corner — Islamic Guidance on Identity, Relationships & Purpose",
    description: "Islamic wisdom from Imam Ali (AS) for youth struggling with relationships, identity, loneliness & emotional discipline.",
    url: "https://thenahj.live/youth",
    type: "website",
  },
};

export default async function YouthPage() {
  const wisdom = await getAllWisdom();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <nav className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Link href="/" className="transition-colors hover:text-gold">Home</Link>
        <span>→</span>
        <span className="text-gold-light">Youth Corner</span>
      </nav>

      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Youth Corner</h1>
      <p className="mt-4 max-w-xl text-muted">
        Relatable reflection for the struggles Gen Z actually faces — with dignity and wisdom.
      </p>

      <div className="mt-10 rounded-2xl border border-border/30 bg-surface/45 p-4">
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-gold-muted">Topics</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
        {youthTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/youth/${topic.slug}`}
            className="whitespace-nowrap rounded-full border border-border/80 bg-background/70 px-4 py-2 text-xs text-foreground transition-all hover:border-gold/30"
          >
            {topic.title}
          </Link>
        ))}
        </div>
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
