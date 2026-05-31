export const dynamic = "force-dynamic";

import Link from "next/link";
import { studentTopics } from "@/data/mock";
import { getAllWisdom } from "@/lib/wisdom";
import { WisdomCard } from "@/components/wisdom/WisdomCard";

export const metadata = {
  title: "Student Corner",
  description: "Focus, exams, social media, and wisdom for students.",
};

export default async function StudentPage() {
  const allWisdom = await getAllWisdom();
  const studyWisdom = allWisdom.filter(
    (w) =>
      w.tags?.some((t) => ["study", "knowledge", "time", "focus"].includes(t)) ||
      w.category?.slug === "knowledge" ||
      w.category?.slug === "time"
  );

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

      <h2 className="mt-16 mb-8 text-xl font-medium text-foreground">Study wisdom</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {studyWisdom.slice(0, 4).map((w, i) => (
          <WisdomCard key={w.id} wisdom={w} index={i} />
        ))}
      </div>
    </div>
  );
}
