export const revalidate = 300;

import { PrismaHero } from "@/components/ui/prisma-hero";
import { CornerPreview } from "@/components/home/CornerPreview";
import { StruggleSelector } from "@/components/home/StruggleSelector";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { StreakDashboard } from "@/components/home/StreakDashboard";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { DailyWisdomShowcase } from "@/components/home/DailyWisdomShowcase";
import { studentTopics, youthTopics } from "@/data/mock";
import { getCMSConfig } from "@/lib/cms";
import { getDailyWisdom, getFeaturedWisdom, getTrendingWisdom, getAllArticles } from "@/lib/wisdom";
import { PersonalizedHome } from "@/components/home/PersonalizedHome";
import { AudioPreview } from "@/components/home/AudioPreview";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAudioTracks } from "@/lib/audio-catalog";
import { ArticleCard } from "@/components/articles/ArticleCard";

export default async function HomePage() {
  const [daily, featured, trending, articles, cms, audioTracks] = await Promise.all([
    getDailyWisdom(),
    getFeaturedWisdom(),
    getTrendingWisdom(),
    getAllArticles(),
    getCMSConfig(),
    getAudioTracks(),
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
          </>
        }
        journey={isEnabled("streak-dashboard") ? <StreakDashboard variant="teaser" /> : null}
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
            <section className="relative py-12 md:py-16" aria-labelledby="trending-wisdom-title">
              <div className="mx-auto max-w-6xl px-4 md:px-6">
                <SectionHeading id="trending-wisdom-title" eyebrow="This week" title="Trending wisdom" description="Timeless words for the questions people are carrying today." href="/wisdom" action="View all" />
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
      />
      
      {/* ─── Latest Articles ─── */}
      {isEnabled("articles") && (
        <section className="relative py-12 md:py-16" aria-labelledby="latest-articles-title">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <SectionHeading id="latest-articles-title" eyebrow="Read" title="Latest articles" description="Reflections and practical guidance for the moments that matter." href="/articles" action="All articles" />
            <div className="grid gap-4 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── Audio Preview ─── */}
      {isEnabled("audio") && <AudioPreview tracks={audioTracks} />}

      {isEnabled("newsletter") && (
        <>
          <div className="mx-auto max-w-xs py-3 md:py-5"><div className="divider-gold" /></div>
          <NewsletterCTA />
        </>
      )}
    </>
  );
}
