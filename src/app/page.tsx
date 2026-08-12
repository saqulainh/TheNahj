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
import { getDailyWisdom, getFeaturedWisdom, getTrendingWisdom, getAllArticles } from "@/lib/wisdom";
import { PersonalizedHome } from "@/components/home/PersonalizedHome";

export default async function HomePage() {
  const [daily, featured, trending, articles, cms] = await Promise.all([
    getDailyWisdom(),
    getFeaturedWisdom(),
    getTrendingWisdom(),
    getAllArticles(),
    getCMSConfig(),
  ]);

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
      <h1 className="sr-only">{cms.brand.siteName} - {cms.brand.tagline}</h1>
      
      <PersonalizedHome 
        hero={
          <>
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
            {isEnabled("streak-dashboard") && (
              <div className="relative -mt-10 mb-12 sm:-mt-16 sm:mb-20 z-20 flex justify-center w-full px-4">
                <StreakDashboard />
              </div>
            )}
          </>
        }
        showcase={
          isEnabled("daily-showcase") && uniqueShowcaseItems.length > 0 ? (
            <DailyWisdomShowcase items={uniqueShowcaseItems} />
          ) : <div />
        }
        youth={
          isEnabled("youth-corner") ? (
            <CornerPreview
              title="Youth Corner"
              subtitle="Identity, relationships, loneliness, and emotional discipline."
              basePath="/youth"
              topics={youthTopics}
            />
          ) : <div />
        }
        student={
          isEnabled("student-corner") ? (
            <CornerPreview
              title="Student Corner"
              subtitle="Focus, exams, social media, and the pressure to perform."
              basePath="/student"
              topics={studentTopics}
            />
          ) : <div />
        }
        diseases={
          isEnabled("trending") ? (
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
          ) : <div />
        }
        corner={
          isEnabled("emotional-prompt") ? (
            <StruggleSelector />
          ) : <div />
        }
        newsletter={
          isEnabled("newsletter") ? (
            <>
              <div className="mx-auto max-w-xs py-4 md:py-8"><div className="divider-gold" /></div>
              <NewsletterCTA />
            </>
          ) : <div />
        }
      />
      
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
    </>
  );
}
