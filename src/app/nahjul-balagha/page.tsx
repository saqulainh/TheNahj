export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllWisdom } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Nahjul Balagha Quotes & Sayings of Imam Ali (AS) | Peak of Eloquence",
  description: "Read authentic Nahjul Balagha quotes, Sermons, and Sayings of Imam Ali Ibn Abi Talib (AS) in English & Urdu with modern reflections.",
  keywords: [
    "Nahjul Balagha",
    "Imam Ali Quotes",
    "Peak of Eloquence",
    "Imam Ali Sayings",
    "Shia Islam Wisdom",
    "Sermons of Imam Ali",
    "Hadith Ali Ibn Abi Talib",
    "Islamic Reflections",
    "Nahjul Balagha English",
    "Nahjul Balagha Urdu"
  ],
  openGraph: {
    title: "Nahjul Balagha Quotes & Sayings of Imam Ali (AS)",
    description: "Authentic Nahjul Balagha quotes, Sermons & Sayings of Imam Ali (AS).",
    url: "https://thenahj.live/nahjul-balagha",
    type: "website",
  },
};

export default async function NahjulBalaghaPage() {
  const wisdom = await getAllWisdom();
  const fromNahj = wisdom.filter((w) => w.source.toLowerCase().includes("nahjul"));

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nahjul Balagha Quotes & Sayings of Imam Ali (AS)",
    description: "Authentic quotes, sermons and wisdom from Nahjul Balagha by Imam Ali Ibn Abi Talib (AS).",
    url: "https://thenahj.live/nahjul-balagha",
    author: {
      "@type": "Person",
      name: "Imam Ali Ibn Abi Talib (AS)",
    },
    publisher: {
      "@type": "Organization",
      name: "TheNahj",
      url: "https://thenahj.live",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-medium text-foreground font-display">Nahjul Balagha (نهج البلاغة)</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Selected wisdom from the Peak of Eloquence (Nahjul Balagha) by Imam Ali (AS) — authentic sermons, letters, and sayings translated with modern practical reflections.
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
    </>
  );
}
