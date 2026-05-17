import Link from "next/link";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { CornerPreview } from "@/components/home/CornerPreview";
import { StruggleSelector } from "@/components/home/StruggleSelector";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
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

  // Helper to check if a block is enabled
  const isEnabled = (type: string) => {
    return cms.homepage.blocks.find(b => b.type === type)?.enabled ?? true;
  };

  return (
    <>
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
            <div className="mx-auto max-w-3xl">
              <WisdomCard wisdom={daily} />
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
                  className="group relative overflow-hidden rounded-2xl border border-border/30 bg-surface/40 p-6 transition-all duration-500 hover:border-gold/20 hover:bg-surface-elevated/60"
                >
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold-muted/70">
                    {article.type}
                  </span>
                  <h3 className="mt-3 font-medium text-foreground transition-colors duration-300 group-hover:text-gold-light">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted/50">
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
            <div className="noise-overlay relative overflow-hidden rounded-3xl border border-border/20 bg-surface/30 p-10 text-center md:p-16">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">Listen</p>
              <h2 className="mt-4 text-xl font-light text-foreground md:text-2xl font-display">
                Audio Reflections
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm text-muted/60">
                Wisdom narration, night reminders, and focus sessions — when reading feels like too much.
              </p>
              <Link
                href="/audio"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/40 px-6 py-2.5 text-sm text-muted transition-all duration-300 hover:border-gold/30 hover:text-gold-light"
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
