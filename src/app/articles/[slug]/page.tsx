import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/wisdom";
import { digitalDiseases } from "@/data/mock";
import { DetoxReader } from "@/components/articles/DetoxReader";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.seo_description,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const isDigitalDisease = digitalDiseases.some(
    (d) => d.slug === article.slug || d.href === `/articles/${article.slug}`
  );

  return <DetoxReader article={article} isDigitalDisease={isDigitalDisease} />;
}
