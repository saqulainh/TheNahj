import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: "About Mission",
  description: `Why ${SITE_NAME} exists — a digital refuge for modern youth through the wisdom of Imam Ali (AS).`,
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Our Mission</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        {SITE_NAME} is {SITE_DESCRIPTION.toLowerCase()}
      </p>

      <section className="mt-12 space-y-6 text-foreground/85">
        <h2 className="text-lg font-medium text-gold-light">Why Imam Ali (AS)?</h2>
        <p className="leading-relaxed">
          His words speak to discipline, justice, friendship, anger, and the inner life — with a
          clarity that feels modern because human struggles are not new. We translate that legacy
          for students doomscrolling at 2am and youth searching for purpose behind a screen.
        </p>

        <h2 className="text-lg font-medium text-gold-light">Modern youth struggles</h2>
        <p className="leading-relaxed">
          Social media addiction, exam anxiety, loneliness, validation hunger, haram attachment,
          identity confusion — these are not sidebar issues. They are the battlefield of this
          generation. We meet them with wisdom, not lectures.
        </p>

        <h2 className="text-lg font-medium text-gold-light">A digital refuge</h2>
        <p className="leading-relaxed">
          Not another crowded Islamic portal. Not a SaaS dashboard. A typography-first, mobile-first
          space to breathe, reflect, and return to what builds you — one card, one reflection, one
          honest step at a time.
        </p>
      </section>
    </section>
  );
}
