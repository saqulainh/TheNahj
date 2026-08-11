export const revalidate = 300;

import Link from "next/link";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { CornerPreview } from "@/components/home/CornerPreview";
import { StruggleSelector } from "@/components/home/StruggleSelector";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { StreakDashboard } from "@/components/home/StreakDashboard";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { DailyWisdomShowcase } from "@/components/home/DailyWisdomShowcase";
import { Button } from "@/components/ui/Button";
import { studentTopics, youthTopics } from "@/data/mock";
import { getCMSConfig } from "@/lib/cms";
import {
  getDailyWisdom,
  getFeaturedWisdom,
  getTrendingWisdom,
  getAllArticles,
} from "@/lib/wisdom";

export default async function HomePage() {
  const [daily, featured, trending, articles, cms] = await Promise.all([
    getDailyWisdom(),
    getFeaturedWisdom(),
    getTrendingWisdom(),
    getAllArticles(),
    getCMSConfig(),
  ]);

  const featuredItem = featured[0];
  
  // Prepare items for Daily Wisdom Showcase (1 daily + a few top trending/featured)
  const showcaseItems = [daily, ...featured.slice(0, 2), ...trending.slice(0, 2)].filter(Boolean);
  // Deduplicate by ID
  const uniqueShowcaseItems = Array.from(new Map(showcaseItems.map(item => [item.id, item])).values());

  // Helper to check if a block is enabled
  const isEnabled = (type: string) => {
    return cms.homepage.blocks.find(b => b.type === type)?.enabled ?? true;
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thenahj.live";
  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TheNahj",
      url: baseUrl,
      description: "Navigate modern life through the wisdom of Imam Ali (AS). Wisdom for students, youth, and the distracted generation.",
      sameAs: [
        cms.brand.socialLinks?.instagram,
        cms.brand.socialLinks?.youtube,
        cms.brand.socialLinks?.telegram,
        cms.brand.socialLinks?.facebook,
        cms.brand.socialLinks?.twitter,
      ].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TheNahj",
      url: baseUrl,
      description: "Imam Ali (AS) Quotes, Nahjul Balagha Wisdom & Islamic Reflections for Muslim Youth and Students.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      {isEnabled("hero") && (
        <PrismaHero 
          headline={cms.homepage.hero.headline}
          subtext={cms.homepage.hero.subtext}
          ctaText={cms.homepage.hero.ctaText}
          ctaLink={cms.homepage.hero.ctaLink}
          bgMode={cms.homepage.hero.bgMode}
          bgImage={cms.homepage.hero.bgImage}
          mobileBgImage={cms.homepage.hero.mobileBgImage}
          bgVideo={cms.homepage.hero.bgVideo}
          focalPoint={cms.homepage.hero.focalPoint}
          overlayBrightness={cms.homepage.hero.overlayBrightness}
          overlayBlur={cms.homepage.hero.overlayBlur}
        />
      )}

      {/* ─── Reading Streak Dashboard ─── */}
      <section className="relative py-6 md:py-8 border-b border-border/10 bg-surface/30">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <StreakDashboard />
        </div>
      </section>

      {/* ─── Daily Wisdom ─── */}
      {isEnabled("daily-wisdom") && (
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
                Today&apos;s Reflection
              </p>
              <h2 className="mt-3 text-xl font-light tracking-tight text-foreground md:text-3xl font-display">
                Daily Wisdom
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted/60">
                Start your day with one intentional reflection.
              </p>
            </div>
            <div className="mx-auto w-full">
              <DailyWisdomShowcase items={uniqueShowcaseItems} />
            </div>
          </div>
        </section>
      )}

      {/* ─── Divider ─── */}
      {isEnabled("daily-wisdom") && (
        <div className="mx-auto max-w-xs py-4 md:py-8">
          <div className="divider-gold" />
        </div>
      )}

      {/* ─── Featured Reflection ─── */}
      {isEnabled("featured-reflection") && featuredItem && (
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
                  Go Deeper
                </p>
                <h2 className="mt-3 text-xl font-light tracking-tight text-foreground md:text-3xl font-display">
                  Featured Reflection
                </h2>
              </div>
              <Button href={`/wisdom/${featuredItem.slug}`} variant="ghost">
                Read full →
              </Button>
            </div>
            <div className="mx-auto max-w-3xl">
              <WisdomCard wisdom={featuredItem} />
            </div>
          </div>
        </section>
      )}

      {/* ─── What Are You Struggling With? ─── */}
      {isEnabled("emotional-prompt") && (
        <StruggleSelector />
      )}

      {/* ─── Divider ─── */}
      {isEnabled("emotional-prompt") && (
        <div className="mx-auto max-w-xs py-4 md:py-8">
          <div className="divider-gold" />
        </div>
      )}

      {/* ─── Trending Wisdom ─── */}
      {isEnabled("trending") && (
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
                  This Week
                </p>
                <h2 className="mt-3 text-xl font-light tracking-tight text-foreground md:text-3xl font-display">
                  Trending Wisdom
                </h2>
                <p className="mt-3 max-w-md text-sm text-muted/60">
                  What youth are reflecting on this week.
                </p>
              </div>
              <Button href="/wisdom" variant="ghost">View all →</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {trending.slice(0, 4).map((w, i) => (
                <WisdomCard key={w.id} wisdom={w} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Student Corner ─── */}
      {isEnabled("student-corner") && (
        <CornerPreview
          title="Student Corner"
          subtitle="Focus, exams, social media, and the pressure to perform."
          basePath="/student"
          topics={studentTopics}
        />
      )}

      {/* ─── Divider ─── */}
      {isEnabled("student-corner") && (
        <div className="mx-auto max-w-xs py-4 md:py-8">
          <div className="divider-gold" />
        </div>
      )}

      {/* ─── Youth Corner ─── */}
      {isEnabled("youth-corner") && (
        <CornerPreview
          title="Youth Corner"
          subtitle="Identity, relationships, loneliness, and emotional discipline."
          basePath="/youth"
          topics={youthTopics}
        />
      )}

      {/* ─── Latest Articles ─── */}
      {isEnabled("articles") && (
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
                  Read
                </p>
                <h2 className="mt-3 text-xl font-light tracking-tight text-foreground md:text-3xl font-display">
                  Latest Articles
                </h2>
              </div>
              <Button href="/articles" variant="ghost">All articles →</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="card-cinematic group relative overflow-hidden rounded-2xl p-6"
                >
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                    {article.type}
                  </span>
                  <h3 className="mt-3 font-medium text-foreground transition-colors duration-300 group-hover:text-gold">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-secondary/70">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Audio Preview ─── */}
      {isEnabled("audio") && (
        <section className="relative py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <div className="card-cinematic noise-overlay relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Listen</p>
              <h2 className="mt-4 text-xl font-light text-foreground md:text-2xl font-display">
                Audio Reflections
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm text-secondary">
                Wisdom narration, night reminders, and focus sessions — when reading feels like too much.
              </p>
              <Link
                href="/audio"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/40 px-6 py-2.5 text-sm text-secondary transition-all duration-300 hover:border-gold/30 hover:text-gold"
              >
                Browse Audio Library
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Newsletter ─── */}
      {isEnabled("newsletter") && (
        <NewsletterCTA />
      )}
    </>
  );
}
