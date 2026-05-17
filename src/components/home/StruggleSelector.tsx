"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
  return (
    <section className="relative py-12 md:py-20">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">Be honest</p>
          <h2 className="mt-4 text-2xl font-light tracking-tight text-foreground md:text-4xl">
            What are you struggling with today?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted/70">
            No judgment. Just clarity. Tap what feels true right now.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6"
        >
          {struggles.map((s) => (
            <motion.div key={s.label} variants={cardVariants}>
              <Link
                href={s.href}
                className="group relative flex flex-col items-center rounded-2xl border border-border/40 bg-surface/50 px-4 py-8 text-center transition-all duration-500 hover:border-gold/20 hover:bg-surface-elevated/80 hover:shadow-[0_0_50px_-15px_rgba(201,162,39,0.1)] md:px-6 md:py-10"
              >
                <span className="text-3xl transition-transform duration-500 group-hover:scale-110 md:text-4xl">
                  {s.emoji}
                </span>
                <span className="mt-4 text-sm font-medium text-foreground">
                  {s.label}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-muted/60">
                  {s.description}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
