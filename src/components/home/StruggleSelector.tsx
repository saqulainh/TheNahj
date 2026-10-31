"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const struggles = [
  { emoji: "😶‍🌫️", label: "Distracted", description: "Can't focus. Phone keeps winning.", href: "/student/dopamine-distraction" },
  { emoji: "🌑", label: "Lonely", description: "Surrounded by people, still empty.", href: "/youth/loneliness" },
  { emoji: "🔥", label: "Angry", description: "Something inside won't calm down.", href: "/wisdom/control-your-anger" },
  { emoji: "🧭", label: "Lost", description: "No direction. No purpose. Just existing.", href: "/youth/purpose" },
  { emoji: "🪫", label: "Unmotivated", description: "Know what to do, can't start.", href: "/student/laziness" },
  { emoji: "💔", label: "Attached", description: "Can't stop texting. Can't let go.", href: "/before-you-text" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function StruggleSelector() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden py-12 md:py-16" aria-labelledby="check-in-title">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
        <SectionHeading
          id="check-in-title"
          eyebrow="A moment of honesty"
          title="What are you struggling with today?"
          description="Choose what feels closest. We’ll guide you to a reflection grounded in Imam Ali’s wisdom."
          align="center"
        />

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
        >
          {struggles.map((s) => (
              <motion.div key={s.label} variants={cardVariants}>
                <Link
                  href={s.href}
                  className="card-cinematic group flex min-h-[176px] flex-col items-start rounded-2xl border border-border/50 bg-surface/55 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:transform-none motion-reduce:transition-none sm:min-h-[184px] sm:p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/[.08] text-2xl transition-transform duration-300 group-hover:scale-105">
                    {s.emoji}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-foreground transition-colors group-hover:text-gold-light">
                    {s.label}
                  </span>
                  <span className="mt-1.5 text-xs leading-relaxed text-secondary/75">
                    {s.description}
                  </span>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[.15em] text-gold-muted transition-colors group-hover:text-gold-light">
                    Read reflection <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
