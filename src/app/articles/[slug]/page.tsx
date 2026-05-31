import type { Metadata } from "next";
import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { ImmersiveArticleSkeleton } from "@/components/articles/ImmersiveArticleSkeleton";
import { getRelatedUnifiedArticles, getUnifiedArticleBySlug } from "@/lib/content";

const ImmersiveArticle = nextDynamic(
  () => import("@/components/articles/ImmersiveArticle").then((mod) => mod.ImmersiveArticle),
  {
    loading: () => <ImmersiveArticleSkeleton />,
  }
);

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getUnifiedArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;
  const image = article.hero_image || article.featured_image || "/backgrounds/serene.jpg";
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://thenahj.org";

  return {
    title,
    description,
    keywords: article.tags,
    alternates: {
      canonical: `${canonicalBase}/articles/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${canonicalBase}/articles/${article.slug}`,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  } satisfies Metadata;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getUnifiedArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedUnifiedArticles(article.slug, article.category, article.tags || []);

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://thenahj.org";
  const image = article.hero_image || article.featured_image || "/backgrounds/serene.jpg";
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    image: [image.startsWith("http") ? image : `${canonicalBase}${image}`],
    datePublished: publishedTime,
    dateModified: publishedTime,
    mainEntityOfPage: `${canonicalBase}/articles/${article.slug}`,
    articleSection: article.category,
    keywords: article.tags?.join(", ") || "",
    inLanguage: ["en", "ar", "ur"],
    author: {
      "@type": "Organization",
      name: "TheNahj Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "TheNahj",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImmersiveArticle article={article} related={related} />
    </>
  );
}
