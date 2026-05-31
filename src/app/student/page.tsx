export const dynamic = "force-dynamic";

import Link from "next/link";
import { studentTopics } from "@/data/mock";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Student Corner",
  description: "Focus, exams, social media, and wisdom for students.",
};

export default async function StudentPage() {
  const [allWisdom, allArticles] = await Promise.all([
    getAllWisdom(),
    getAllArticles(),
  ]);

  const studyWisdom = allWisdom.filter(
    (w) =>
      w.tags?.some((t) => ["study", "knowledge", "time", "focus"].includes(t.toLowerCase())) ||
      w.category?.slug === "knowledge" ||
      w.category?.slug === "time"
  );

  const studentArticles = allArticles.filter((a) => a.type === "student");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Student Corner</h1>
      <p className="mt-4 max-w-xl text-muted">
        Wisdom for focus, exams, and the battles students fight every day — without the lecture
        tone.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studentTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/student/${topic.slug}`}
            className="rounded-xl border border-border/80 bg-surface p-6 transition-all hover:border-gold/30"
          >
            <h2 className="font-medium text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted">{topic.description}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/focus"
        className="mt-10 block rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center transition-colors hover:bg-gold/10"
      >
        <span className="text-gold-light">Open Deep Focus Mode →</span>
        <p className="mt-2 text-sm text-muted">Pomodoro timer with focus quotes</p>
      </Link>

      {studentArticles.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-xl font-medium text-foreground">Latest Student Articles</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {studentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block rounded-2xl border border-border/80 bg-surface/50 p-6 hover:border-gold/30 hover:bg-surface transition-all"
              >
                <span className="text-[10px] uppercase tracking-[0.15em] text-gold-muted font-medium block">Student Corner Article</span>
                <h3 className="mt-2 text-lg font-medium text-foreground">{article.title}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-2">{article.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gold">
                  <span>Read Article</span><span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-16 mb-8 text-xl font-medium text-foreground">Study wisdom</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {studyWisdom.slice(0, 4).map((w, i) => (
          <WisdomCard key={w.id} wisdom={w} index={i} />
        ))}
      </div>
    </div>
  );
}
