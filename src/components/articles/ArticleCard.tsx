import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/types";
import ImageRole from "@/components/ui/ImageRole";

const typeLabels: Record<Article["type"], string> = {
  reflection: "Reflection",
  story: "Story",
  student: "Student life",
  youth: "Youth life",
  "self-improvement": "Personal growth",
  wisdom: "Wisdom",
};

function getArticleMeta(article: Article) {
  const text = `${article.content || ""} ${article.excerpt || ""}`.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));
  const date = new Date(article.created_at);

  return {
    readingMinutes,
    dateLabel: Number.isNaN(date.getTime())
      ? null
      : date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
  };
}

export function ArticleCard({ article }: { article: Article }) {
  const { dateLabel, readingMinutes } = getArticleMeta(article);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/55 bg-surface/55 transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:bg-surface hover:shadow-[0_18px_40px_-26px_rgba(71,52,20,.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      <div className="relative aspect-[1.65] overflow-hidden bg-gradient-to-br from-[#34291d] via-[#725d3c] to-[#b28b4c]">
        {article.cover_image ? (
          <ImageRole src={article.cover_image} alt="" role="card" className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" unconstrained />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_75%_20%,rgba(255,236,184,.8)_0,transparent_27%),linear-gradient(135deg,transparent_45%,rgba(255,255,255,.15)_46%,transparent_47%)] [background-size:auto,34px_34px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-white/90 backdrop-blur-sm">
          {typeLabels[article.type] || "Article"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[10px] text-muted/70">
          {dateLabel && <time dateTime={article.created_at}>{dateLabel}</time>}
          {dateLabel && <span aria-hidden="true">·</span>}
          <span>{readingMinutes} min read</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-gold-light">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-secondary/75">{article.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 pt-5 text-xs font-semibold text-gold-muted transition-all group-hover:gap-2.5 group-hover:text-gold-light">
          Read article <ArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
