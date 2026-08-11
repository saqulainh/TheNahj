export const dynamic = "force-dynamic";

import Link from "next/link";
import { studentTopics } from "@/data/mock";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Student Corner — Islamic Wisdom for Focus, Exams & Study Motivation",
  description: "Struggling with exam anxiety, procrastination, or social media addiction? Islamic wisdom from Imam Ali (AS) to help Muslim students build focus and discipline.",
  keywords: [
    "Islamic study motivation",
    "Muslim student tips",
    "Exam anxiety Islam",
    "Focus tips for students",
    "Social media addiction Islam",
    "Imam Ali on knowledge",
    "Islamic productivity",
    "Nahjul Balagha student wisdom",
    "Deen and studies balance",
  ],
  openGraph: {
    title: "Student Corner — Islamic Wisdom for Focus & Exam Success",
    description: "Imam Ali (AS) wisdom on focus, exams, procrastination & social media addiction for Muslim students.",
    url: "https://thenahj.live/student",
    type: "website",
  },
};

export default async function StudentPage() {
  const allWisdom = await getAllWisdom();

  const studyWisdom = allWisdom.filter(
    (w) =>
      w.tags?.some((t) => ["study", "knowledge", "time", "focus"].includes(t.toLowerCase())) ||
      w.category?.slug === "knowledge" ||
      w.category?.slug === "time"
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <nav className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Link href="/" className="transition-colors hover:text-gold">Home</Link>
        <span>→</span>
        <span className="text-gold-light">Student Corner</span>
      </nav>

      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Student Corner</h1>
      <p className="mt-4 max-w-xl text-muted">
        Wisdom for focus, exams, and the battles students fight every day — without the lecture
        tone.
      </p>

      <div className="mt-10 rounded-2xl border border-border/30 bg-surface/45 p-4">
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-gold-muted">Topics</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
        {studentTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/student/${topic.slug}`}
            className="whitespace-nowrap rounded-full border border-border/80 bg-background/70 px-4 py-2 text-xs text-foreground transition-all hover:border-gold/30"
          >
            {topic.title}
          </Link>
        ))}
        </div>
      </div>

      <Link
        href="/focus"
        className="mt-10 block rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center transition-colors hover:bg-gold/10"
      >
        <span className="text-gold-light">Open Deep Focus Mode →</span>
        <p className="mt-2 text-sm text-muted">Pomodoro timer with focus quotes</p>
      </Link>

      <h2 className="mt-16 mb-8 text-xl font-medium text-foreground">Study wisdom</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {studyWisdom.slice(0, 4).map((w, i) => (
          <WisdomCard key={w.id} wisdom={w} index={i} />
        ))}
      </div>
    </div>
  );
}
