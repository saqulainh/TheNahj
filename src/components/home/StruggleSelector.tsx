"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

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
  const [hoveredStruggle, setHoveredStruggle] = useState<string | null>(null);

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 mb-3">
            <Sparkles size={12} className="text-gold" />
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-light">Be Honest with Yourself</span>
          </div>
          <h2 className="mt-2 text-2xl font-light tracking-tight text-foreground md:text-4xl font-display">
            What are you struggling with today?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted/80">
            No judgment. Just clarity. Tap what feels true right now to receive Imam Ali&apos;s timeless antidote.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6"
        >
          {struggles.map((s) => {
            const isHovered = hoveredStruggle === s.label;
            const isOtherHovered = hoveredStruggle !== null && !isHovered;

            return (
              <motion.div 
                key={s.label} 
                variants={cardVariants}
                animate={{
                  opacity: isOtherHovered ? 0.38 : 1,
                  scale: isHovered ? 1.04 : isOtherHovered ? 0.97 : 1,
                  filter: isOtherHovered ? "blur(2px)" : "blur(0px)",
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredStruggle(s.label)}
                onMouseLeave={() => setHoveredStruggle(null)}
              >
                <Link
                  href={s.href}
                  className={`card-cinematic group relative flex flex-col items-center px-4 py-8 text-center md:px-6 md:py-10 rounded-2xl border transition-all duration-300 ${
                    isHovered
                      ? "border-gold/60 bg-surface/90 shadow-[0_0_35px_rgba(199,166,84,0.25)] ring-1 ring-gold/30 ring-offset-2 ring-offset-background"
                      : "border-border/30 bg-surface/60 hover:border-gold/30"
                  }`}
                >
                  {/* Subtle 8-point corner stars on active hover */}
                  {isHovered && (
                    <>
                      <span className="absolute top-2 left-2 text-[8px] text-gold/50">✦</span>
                      <span className="absolute top-2 right-2 text-[8px] text-gold/50">✦</span>
                      <span className="absolute bottom-2 left-2 text-[8px] text-gold/50">✦</span>
                      <span className="absolute bottom-2 right-2 text-[8px] text-gold/50">✦</span>
                    </>
                  )}

                  <span className="text-3xl transition-transform duration-500 group-hover:scale-110 md:text-4xl">
                    {s.emoji}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                    {s.label}
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-secondary/75">
                    {s.description}
                  </span>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Seek Antidote <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
