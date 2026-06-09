"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, Bookmark, Share2 } from "lucide-react";
import { ImageRole } from "@/components/ui/ImageRole";
import type { ContentBlock } from "@/lib/content-schema";

interface ImmersiveArticleProps {
  article: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags?: string[];
    hero_image?: string | null;
    featured_image?: string | null;
    sidebar_banner?: string | null;
    content_blocks: ContentBlock[];
    arabic_content?: string | null;
    urdu_content?: string | null;
    english_content?: string | null;
    reading_time?: number;
    created_at?: string;
    published_at?: string | null;
    narrations?: Array<{
      id: string;
      arabic?: string | null;
      urdu?: string | null;
      translation?: string | null;
      narrator?: string | null;
      source?: string | null;
      explanation?: string | null;
    }>;
  };
  related: Array<{ slug: string; title: string; category: string }>;
}

function renderBlock(block: ContentBlock, narrations?: ImmersiveArticleProps["article"]["narrations"]) {
  if (block.type === "heading") {
    return <h2 id={block.id} className="mt-14 mb-6 font-serif text-2xl md:text-3xl font-light text-foreground tracking-tight">{block.value}</h2>;
  }
  if (block.type === "paragraph") {
    return <p className="mt-6 mb-4 text-base md:text-lg leading-relaxed text-secondary font-light tracking-wide">{block.value}</p>;
  }
  if (block.type === "arabic_quote") {
    return (
      <div className="my-10 py-6 px-4 text-center bg-surface-elevated/20 border-y border-gold/15 rounded-xl">
        <blockquote dir="rtl" className="font-arabic text-[2.2rem] leading-[2.6] text-foreground drop-shadow-sm">
          {block.value}
        </blockquote>
      </div>
    );
  }
  if (block.type === "urdu_translation") {
    return (
      <p dir="rtl" className="mt-6 mb-8 text-center font-urdu text-[1.8rem] leading-[2.8] text-foreground/90 font-light tracking-wide">
        {block.value}
      </p>
    );
  }
    if (block.type === "english_translation") {
    return <p className="mt-4 mb-8 text-center font-serif text-lg md:text-xl italic text-gold max-w-xl mx-auto">&ldquo;{block.value}&rdquo;</p>;
  }
  if (block.type === "image_block" && block.mediaUrl) {
    return (
      <div className="my-8 overflow-hidden rounded-2xl border border-border/20 shadow-md">
        <ImageRole src={block.mediaUrl} alt={block.value || "Article image"} role="card" className="w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
      </div>
    );
  }
  if (block.type === "divider") {
    return <div className="my-10 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />;
  }
  if (block.type === "highlight_quote") {
    return (
      <blockquote className="my-10 rounded-2xl border-l-4 border-gold/40 bg-surface-elevated/30 p-6 font-serif text-lg md:text-xl italic text-foreground/90 font-light leading-relaxed max-w-xl mx-auto shadow-sm">
        &ldquo;{block.value}&rdquo;
      </blockquote>
    );
  }
  if (block.type === "question_block") {
    return (
      <div className="my-8 rounded-2xl border border-border/30 bg-surface/50 p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-gold">Reflection Question</p>
        <p className="mt-3 text-secondary font-light">{block.value}</p>
      </div>
    );
  }
  if (block.type === "modern_relevance") {
    return (
      <div className="my-8 rounded-2xl border border-border/30 bg-surface/50 p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-gold">Modern Relevance</p>
        <p className="mt-3 text-secondary font-light">{block.value}</p>
      </div>
    );
  }
  if (block.type === "narrations_block" && narrations && narrations.length > 0) {
    return (
      <div className="space-y-6 my-10">
        {narrations.map((narration, i) => (
          <div key={narration.id || i} className="rounded-2xl border border-border/20 bg-surface-elevated/10 p-6 shadow-sm">
            {narration.arabic && (
              <p dir="rtl" className="mb-4 text-center font-arabic text-2xl leading-loose text-foreground drop-shadow-sm">{narration.arabic}</p>
            )}
            {narration.urdu && (
              <p dir="rtl" className="mb-4 text-center font-urdu text-xl leading-relaxed text-foreground/90">{narration.urdu}</p>
            )}
            {narration.translation && (
              <p className="mb-4 text-center font-serif text-lg italic text-secondary">&ldquo;{narration.translation}&rdquo;</p>
            )}
            {(narration.narrator || narration.source) && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.1em] text-gold-muted mt-4">
                {narration.narrator && <span>{narration.narrator}</span>}
                {narration.narrator && narration.source && <span>•</span>}
                {narration.source && <span>{narration.source}</span>}
              </div>
            )}
            {narration.explanation && (
              <div className="mt-5 border-t border-border/10 pt-4 text-center text-sm font-light text-secondary">
                {narration.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return <p className="mt-6 mb-4 text-base md:text-lg leading-relaxed text-secondary font-light tracking-wide">{block.value}</p>;
}

export function ImmersiveArticle({ article, related }: ImmersiveArticleProps) {
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const headings = useMemo(() => {
    return article.content_blocks.filter((block) => block.type === "heading" && block.value);
  }, [article.content_blocks]);

  useEffect(() => {
    const onScroll = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const value = documentHeight > 0 ? Math.round((window.scrollY / documentHeight) * 100) : 0;
      setProgress(Math.min(100, Math.max(0, value)));

      let current = "";
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el && window.scrollY >= el.offsetTop - 140) {
          current = heading.id;
        }
      });
      setActiveHeading(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return (
    <article className="bg-background pb-20 pt-20">
      <header className="relative overflow-hidden border-b border-border/20">
        <div className="absolute inset-0">
          <ImageRole src={article.hero_image || article.featured_image || "/backgrounds/serene.jpg"} alt={article.title} role="hero" className="absolute inset-0 object-cover w-full h-full" unconstrained />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:px-8">
          <span className="rounded-full border border-gold/30 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold-light">
            {article.category}
          </span>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight text-foreground md:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-2xl text-base text-secondary md:text-lg">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted">
            <span>{article.reading_time || 1} min read</span>
            <span>Editorial Team</span>
            <span suppressHydrationWarning>{new Date(article.published_at || article.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 px-5 md:px-8 xl:grid-cols-[200px_1fr_280px]">
        <aside className="hidden xl:block">
          <div className="sticky top-28 space-y-4 rounded-2xl border border-border/30 bg-surface/70 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Reading</p>
              <p className="mt-1 text-2xl text-foreground">{progress}%</p>
              <div className="mt-2 h-2 rounded-full bg-background">
                <div className="h-2 rounded-full bg-gold/70" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
            >
              <ArrowUp size={12} /> Scroll to top
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(`bookmark:${article.slug}`, "1");
              }}
              className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
            >
              <Bookmark size={12} /> Bookmark
            </button>
            <button
              type="button"
              onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
              className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
            >
              <Share2 size={12} /> Share
            </button>
            <div className="border-t border-border/25 pt-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Headings</p>
              <div className="mt-2 space-y-2">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-xs ${activeHeading === heading.id ? "text-gold-light" : "text-muted hover:text-foreground"}`}
                  >
                    {heading.value}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="card-cinematic rounded-3xl p-8 md:p-16 shadow-[0_20px_60px_rgba(92,75,58,0.04)]">
          {article.arabic_content && (
            <div className="my-10 py-6 px-4 text-center bg-surface-elevated/20 border-y border-gold/15 rounded-xl">
              <p dir="rtl" className="font-arabic text-[2.2rem] leading-[2.6] text-foreground drop-shadow-sm">
                {article.arabic_content}
              </p>
            </div>
          )}
          {article.urdu_content && (
            <p dir="rtl" className="mt-8 mb-10 text-center font-urdu text-[1.8rem] leading-[2.8] text-foreground/90 font-light tracking-wide">
              {article.urdu_content}
            </p>
          )}
          {article.english_content && (
            <p className="mt-6 mb-10 text-center font-serif text-lg md:text-xl italic text-gold max-w-xl mx-auto">&ldquo;{article.english_content}&rdquo;</p>
          )}

          <div className="prose-reflection mt-8 max-w-none">
            {article.content_blocks.map((block) => (
              <div key={block.id}>{renderBlock(block, article.narrations)}</div>
            ))}
          </div>

          <div className="mt-14 border-t border-border/20 pt-8">
            <h3 className="text-lg text-foreground">Recommended reading</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link key={item.slug} href={`/articles/${item.slug}`} className="rounded-xl border border-border/25 bg-background p-4 hover:border-gold/30">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">{item.category}</p>
                  <p className="mt-2 text-sm text-foreground">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <aside>
          <div className="sticky top-28 space-y-4 rounded-2xl border border-border/30 bg-surface/70 p-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reflections"
              className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                const query = searchQuery.trim();
                if (!query) return;
                router.push(`/search?q=${encodeURIComponent(query)}&section=${encodeURIComponent(article.category)}`);
              }}
              className="w-full rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold-light hover:bg-gold/20"
            >
              Search
            </button>
            {article.sidebar_banner && (
              <ImageRole src={article.sidebar_banner} alt="Sidebar banner" role="sidebar" className="w-full rounded-xl object-cover" />
            )}
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-muted">Popular topics</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(article.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full border border-border/25 px-2 py-1 text-[11px] text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-muted">Suggested reading</p>
              <div className="mt-2 space-y-2">
                {related.slice(0, 4).map((item) => (
                  <Link key={item.slug} href={`/articles/${item.slug}`} className="block text-sm text-muted hover:text-foreground">
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </article>
  );
}
