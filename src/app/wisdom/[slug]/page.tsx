export const revalidate = 300;

import Link from "next/link";
import { notFound } from "next/navigation";
import { WisdomReadingProgress } from "@/components/wisdom/WisdomReadingProgress";
import { WisdomHeroActions } from "@/components/wisdom/WisdomHeroActions";
import { ReflectionPracticePanel } from "@/components/wisdom/ReflectionPracticePanel";
import ImageRole from "@/components/ui/ImageRole";
import { getRelatedUnifiedArticles, getUnifiedArticleBySlug } from "@/lib/content";
import type { RelatedArticlePreview } from "@/lib/content";
import type { Metadata } from "next";
import { AITranslatedText } from "@/components/ui/AITranslatedText";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; theme?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getUnifiedArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  const title = `${article.seo_title || article.title} — Imam Ali (AS) Wisdom`;
  const description = article.seo_description || article.excerpt;
  const image = article.hero_image || article.featured_image || "/backgrounds/serene.jpg";
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://thenahj.live";

  return {
    title,
    description,
    keywords: [
      ...(article.tags || []),
      "Imam Ali Quotes",
      "Nahjul Balagha",
      "Shia Islamic Wisdom",
      "Ahlulbayt Hadith",
      "Islamic Motivation",
      "Youth Guidance Islam"
    ],
    alternates: {
      canonical: `${canonicalBase}/wisdom/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${canonicalBase}/wisdom/${article.slug}`,
      siteName: "TheNahj",
      images: [
        {
          url: image.startsWith("http") ? image : `${canonicalBase}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${canonicalBase}${image}`],
    },
  };
}

export default async function ReflectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { from, theme } = await searchParams;
  const article = await getUnifiedArticleBySlug(slug);
  if (!article) notFound();

  const splitLines = (text?: string | null) =>
    (text || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

  const defaultFrom =
    article.category === "Student Corner"
      ? "/student"
      : article.category === "Youth Corner"
      ? "/youth"
      : article.category === "Nahjul Balagha"
      ? "/nahjul-balagha"
      : "/wisdom";
  const safeFrom = from && from.startsWith("/") ? from : defaultFrom;
  const backLabel = safeFrom.startsWith("/student")
    ? "Student Corner"
    : safeFrom.startsWith("/youth")
    ? "Youth Corner"
    : safeFrom.startsWith("/topics")
    ? "Life Themes"
    : safeFrom.startsWith("/nahjul-balagha")
    ? "Nahjul Balagha"
    : "Wisdom Repository";

  const related = await getRelatedUnifiedArticles(article.slug, article.category, article.tags ?? []);
  const relatedWithMeta = related as RelatedArticlePreview[];
  const primaryTopic = article.tags?.[0] || article.category;
  const subcategory = article.tags?.[1] || article.tags?.[0] || article.category;
  const reflectionQuestions = splitLines(article.reflection_questions);
  const actionSteps = splitLines(article.action_steps);
  const sections = [
    { href: safeFrom, label: backLabel },
    { id: "narrations", label: "Narrations" },
    { id: "relevance", label: "Modern Relevance" },
    { id: "reflection", label: "Reflection" },
    { id: "conclusion", label: "Conclusion" },
  ];

  const renderParagraphs = (text?: string | null) => {
    if (!text) return null;

    return text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 24)}-${index}`} className="whitespace-pre-wrap leading-relaxed text-secondary/85 md:text-[1.05rem]">
          <AITranslatedText text={paragraph} />
        </p>
      ));
  };

  const reasonLabel: Record<string, string> = {
    "same-topic": "Same Topic",
    "same-theme": "Same Theme",
    "same-audience": "Same Audience",
    "related-concept": "Related Concept",
    "shared-tags": "Shared Tags",
  };

  const getConfidence = (score?: number) => {
    if (!score) return { label: "Relevant", className: "border-border/20 text-muted" };
    if (score >= 1000) return { label: "Strong Match", className: "border-gold/30 text-gold-light" };
    if (score >= 450) return { label: "Good Match", className: "border-gold/20 text-gold/90" };
    return { label: "Related", className: "border-border/20 text-muted" };
  };

  const canonicalBase = "https://www.thenahj.live";
  const pageUrl = `${canonicalBase}/wisdom/${article.slug}`;
  const schemaImage = article.hero_image || article.featured_image || "/backgrounds/serene.jpg";
  const absoluteImage = schemaImage.startsWith("http") ? schemaImage : `${canonicalBase}${schemaImage}`;
  
  const citations = Array.isArray((article as any).related_narrations) ? (article as any).related_narrations.map((narration: any) => ({
    "@type": "Quotation",
    "text": narration.english_translation || narration.text || "",
    "creator": { "@type": "Person", "name": narration.narrator || "Ahlulbayt (AS)" },
    "isBasedOn": narration.source || "Islamic Texts"
  })) : [];

  // Add the primary quote as the first citation
  citations.unshift({
    "@type": "Quotation",
    "text": article.english_translation || "",
    "creator": { "@type": "Person", "name": "Imam Ali (AS)" },
    "isBasedOn": article.source || "Nahjul Balagha"
  });

  const graphItems: any[] = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      "url": pageUrl,
      "name": `${article.seo_title || article.title} — Imam Ali (AS) Wisdom`,
      "isPartOf": { "@id": `${canonicalBase}/#website` },
      "about": { "@id": `${pageUrl}#article` },
      "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": canonicalBase },
        { "@type": "ListItem", "position": 2, "name": "Wisdom Repository", "item": `${canonicalBase}/wisdom` },
        { "@type": "ListItem", "position": 3, "name": article.category || "General", "item": `${canonicalBase}/topics/${article.category?.toLowerCase() || 'general'}` },
        { "@type": "ListItem", "position": 4, "name": article.title }
      ]
    },
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      "headline": article.seo_title || article.title,
      "description": article.seo_description || article.excerpt,
      "image": [absoluteImage],
      "author": { "@id": `${canonicalBase}/#organization` },
      "publisher": { "@id": `${canonicalBase}/#organization` },
      "mainEntityOfPage": { "@id": `${pageUrl}#webpage` },
      "articleSection": article.category || "Wisdom",
      "keywords": article.tags?.join(", ") || "Imam Ali, Nahjul Balagha, Shia Wisdom",
      "inLanguage": "en-US",
      "datePublished": article.published_at || article.created_at || new Date().toISOString(),
      "dateModified": (article as any).updated_at || article.published_at || article.created_at || new Date().toISOString(),
      "citation": citations,
      ...(actionSteps.length > 0 ? { "hasPart": { "@id": `${pageUrl}#howto` } } : {})
    }
  ];

  if (actionSteps.length > 0) {
    graphItems.push({
      "@type": "HowTo",
      "@id": `${pageUrl}#howto`,
      "name": `Action Plan: ${article.title}`,
      "description": `Practical steps to internalize the wisdom of Imam Ali (AS) regarding ${article.category || 'this topic'}.`,
      "step": actionSteps.map((step, index) => {
        // Strip markdown list numbers (e.g., "1. ") from step text
        const cleanStep = step.replace(/^\d+\.\s*/, "").trim();
        return {
          "@type": "HowToStep",
          "position": index + 1,
          "name": `Step ${index + 1}`,
          "text": cleanStep
        };
      })
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen bg-background selection:bg-gold/30 selection:text-white">
      <header className="relative overflow-hidden border-b border-border/20">
        <div className="absolute inset-0">
          {article.hero_image || article.featured_image ? (
            <ImageRole src={article.hero_image || article.featured_image || "/backgrounds/serene.jpg"} alt={article.title} role="hero" className="opacity-35" focalPoint={article.hero_focal_point ?? null} />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_hsla(var(--gold)/0.18),_transparent_38%),linear-gradient(180deg,_hsl(var(--surface-elevated)),_hsl(var(--background)))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/65 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_hsla(var(--gold)/0.12),_transparent_28%),radial-gradient(circle_at_80%_20%,_hsla(var(--gold)/0.08),_transparent_20%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-end">
          <div className="space-y-7">
            <Link href={safeFrom} className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-secondary transition-colors hover:text-gold">
              ← {backLabel}
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
              <Link href="/" className="transition-colors hover:text-gold">Home</Link>
              <span>→</span>
              <Link href={safeFrom} className="transition-colors hover:text-gold">{backLabel}</Link>
              {(theme || article.tags?.[0]) && (
                <>
                  <span>→</span>
                  <Link href={`/topics/${encodeURIComponent(theme || article.tags?.[0] || "")}`} className="transition-colors hover:text-gold">
                    {theme || article.tags?.[0]}
                  </Link>
                </>
              )}
              <span>→</span>
              <span className="text-gold-light">{article.title}</span>
            </nav>

            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-gold-light">
              <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1">{article.category}</span>
              <span className="rounded-full border border-border/30 bg-background/60 px-3 py-1">Primary Topic: {primaryTopic}</span>
              <span className="rounded-full border border-border/30 bg-background/60 px-3 py-1">Subcategory: {subcategory}</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
              <AITranslatedText text={article.title} />
            </h1>

            <p className="max-w-3xl text-base leading-relaxed text-secondary/85 md:text-lg lg:text-xl">
              <AITranslatedText text={article.excerpt} />
            </p>

            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>{article.reading_time || 1} min read</span>
              {article.source && <span>• {article.source}</span>}
              <span>• {new Date(article.published_at || article.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>

              {article.source_number && <span>Ref {article.source_number}</span>}
              {article.book_name && <span>{article.book_name}</span>}
            </div>

            <WisdomHeroActions slug={article.slug} title={article.title} />
          </div>

          <aside className="rounded-[2rem] border border-border/20 bg-surface/55 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-md md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Reading Journey</p>
                <p className="mt-1 text-lg text-foreground">Guided reflection</p>
              </div>
              <span className="rounded-full border border-border/20 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">Immersive</span>
            </div>

            <div className="space-y-3 text-sm text-secondary/80">
              <p>Use the journey to return to the wisdom repository first, then continue through narration, relevance, reflection, and conclusion.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section) => (
                  section.href ? (
                    <Link
                      key={section.href}
                      href={section.href}
                      className="flex items-center justify-between rounded-2xl border border-border/20 bg-background/60 px-4 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-gold/30 hover:text-gold-light"
                    >
                      <span>{section.label}</span>
                      <span className="text-gold/80">↩</span>
                    </Link>
                  ) : (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center justify-between rounded-2xl border border-border/20 bg-background/60 px-4 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-gold/30 hover:text-gold-light"
                    >
                      <span>{section.label}</span>
                      <span className="text-gold/80">↘</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          </aside>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-8">
          <WisdomReadingProgress 
            readingTime={article.reading_time || 1} 
            slug={article.slug}
            category={article.category}
            tags={article.tags || []}
          />

          <section id="explanation" className="scroll-mt-28 rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Explanation</p>
              <p className="max-w-3xl text-sm leading-relaxed text-secondary/80">
                Start here if you came to understand the meaning and context before moving into the original wording.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {article.main_explanation && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 lg:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Main Explanation</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.main_explanation)}</div>
                </article>
              )}
              {article.detailed_explanation && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Detailed Explanation</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.detailed_explanation)}</div>
                </article>
              )}
              {article.tafseer && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Tafseer</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.tafseer)}</div>
                </article>
              )}
              {article.historical_context && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 lg:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Historical Context</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.historical_context)}</div>
                </article>
              )}
            </div>
          </section>

          {Array.isArray(article.narrations) && article.narrations.length > 0 && (
            <section id="narrations" className="scroll-mt-28 rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
              <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold">
                <span>Related Narrations</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {article.narrations.map((narration) => (
                  <article key={narration.id} className="rounded-[1.75rem] border border-border/20 bg-background/75 p-5 shadow-sm md:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Supporting Narration</p>
                      <span className="rounded-full border border-border/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted">Quote card</span>
                    </div>
                    {narration.arabic ? (
                      <p className="mt-6 font-arabic text-[1.65rem] leading-[2.2] text-foreground text-center drop-shadow-sm" dir="rtl" lang="ar">
                        {narration.arabic}
                      </p>
                    ) : null}
                    {narration.urdu ? (
                      <p className="mt-4 font-urdu text-[1.3rem] leading-[2.0] text-foreground/90 text-center" dir="rtl">
                        {narration.urdu}
                      </p>
                    ) : null}
                    {narration.translation ? (
                      <p className="mt-4 font-serif text-[1rem] leading-relaxed text-gold italic text-center max-w-xl mx-auto whitespace-pre-wrap">
                        {narration.translation}
                      </p>
                    ) : null}
                    <div className="mt-5 grid gap-4 border-t border-border/15 pt-5 text-sm text-secondary md:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Narrator</p>
                        <p className="mt-1 text-foreground">{narration.narrator || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Source</p>
                        <p className="mt-1 text-foreground">{narration.source || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Explanation</p>
                        <p className="mt-1 text-foreground">{narration.explanation || "Not provided"}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section id="relevance" className="scroll-mt-28 rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
            <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold">
              <span>Modern Relevance</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {article.current_issues && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Why This Matters Today</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.current_issues)}</div>
                </article>
              )}
              {article.youth_relevance && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Youth Relevance</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.youth_relevance)}</div>
                </article>
              )}
              {article.student_relevance && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Student Relevance</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.student_relevance)}</div>
                </article>
              )}
              {article.practical_application && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Practical Response</p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.practical_application)}</div>
                </article>
              )}
            </div>
          </section>

          <section id="reflection" className="scroll-mt-28 rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
            <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold">
              <span>Reflection Experience</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {reflectionQuestions.length > 0 && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 lg:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                    <AITranslatedText text="Reflection Questions" />
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {reflectionQuestions.map((question, index) => (
                      <div key={`${question}-${index}`} className="rounded-2xl border border-border/20 bg-surface/60 p-4 shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                          <AITranslatedText text={`Question ${index + 1}`} />
                        </p>
                        <p className="mt-3 leading-relaxed text-foreground/90">
                          <AITranslatedText text={question} />
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {actionSteps.length > 0 && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6 lg:row-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                    <AITranslatedText text="Action Steps" />
                  </p>
                  <div className="mt-4 space-y-3">
                    {actionSteps.map((step, index) => (
                      <div key={`${step}-${index}`} className="flex gap-3 rounded-2xl border border-border/20 bg-surface/60 p-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">{index + 1}</span>
                        <p className="leading-relaxed text-foreground/90">
                          <AITranslatedText text={step} />
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {article.personal_reflection && (
                <article className="rounded-[1.75rem] border border-border/20 bg-[linear-gradient(180deg,_hsl(var(--surface-elevated)/0.9),_hsl(var(--surface)/0.65))] p-5 md:p-6 lg:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                    <AITranslatedText text="Personal Reflection" />
                  </p>
                  <div className="mt-4 rounded-[1.5rem] border border-border/20 bg-background/70 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted">
                      <AITranslatedText text="Journal space" />
                    </p>
                    <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.personal_reflection)}</div>
                  </div>
                </article>
              )}

              {(reflectionQuestions.length > 0 || actionSteps.length > 0) && (
                <div className="lg:col-span-3">
                  <ReflectionPracticePanel articleSlug={article.slug} questions={reflectionQuestions} actionSteps={actionSteps} />
                </div>
              )}
            </div>
          </section>

          <section id="conclusion" className="scroll-mt-28 rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
            <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold">
              <span><AITranslatedText text="Conclusion" /></span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {article.summary && (
                <article className="rounded-[1.75rem] border border-border/20 bg-background/70 p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                    <AITranslatedText text="Summary & Key Takeaways" />
                  </p>
                  <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.summary)}</div>
                </article>
              )}
              {article.closing_reflection && (
                <article className="rounded-[1.75rem] border border-border/20 bg-[linear-gradient(180deg,_hsl(var(--surface-elevated)/0.85),_hsl(var(--surface)/0.65))] p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                    <AITranslatedText text="Closing Reflection" />
                  </p>
                  <div className="mt-4 rounded-[1.5rem] border border-gold/15 bg-background/70 p-5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
                      <AITranslatedText text="Final thought" />
                    </p>
                    <div className="prose-reflection mt-4 space-y-4">{renderParagraphs(article.closing_reflection)}</div>
                  </div>
                </article>
              )}
            </div>
          </section>

          {relatedWithMeta.length > 0 && (
            <section className="rounded-[2rem] border border-border/20 bg-surface/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8 lg:p-10">
              <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold">
                <span>Related Wisdom</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {relatedWithMeta.map((item, index) => {
                  const confidence = getConfidence(item.score);
                  return (
                    <Link
                      key={item.slug}
                      href={`/wisdom/${item.slug}`}
                      className="group rounded-[1.75rem] border border-border/20 bg-background/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-background"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.category}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] ${confidence.className}`}>
                          {confidence.label}
                        </span>
                      </div>
                      <p className="mt-3 text-base font-medium text-foreground transition-colors group-hover:text-gold-light">{item.title}</p>
                      {Array.isArray(item.reason) && item.reason.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.reason.slice(0, 3).map((reason) => (
                            <span
                              key={`${item.slug}-${reason}`}
                              className="rounded-full border border-border/20 bg-surface/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-gold/80"
                            >
                              {reasonLabel[reason] || reason.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gold/70">Related #{index + 1}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[2rem] border border-border/20 bg-surface/55 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Reading</p>
            <p className="mt-2 text-xl text-foreground">{article.reading_time || 1} min read</p>
            <p className="mt-2 text-sm leading-relaxed text-secondary/75">The page now keeps the journey minimal and sends you back to the main wisdom surface instead of duplicating navigation.</p>
          </div>
          {article.sidebar_banner && (
            <ImageRole
              src={article.sidebar_banner}
              alt={`${article.title} sidebar banner`}
              role="sidebar"
              className="w-full rounded-[2rem] object-cover"
              focalPoint={article.sidebar_focal_point ?? null}
            />
          )}
        </aside>
      </div>
    </article>
    </>
  );
}
