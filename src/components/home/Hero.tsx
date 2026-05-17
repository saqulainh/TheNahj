"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
  bgImage?: string;
}

export function Hero({ 
  headline = "Wisdom for the distracted generation.", 
  subtext = "Navigate modern life through the wisdom of Imam Ali (AS).", 
  ctaText = "Explore Wisdom", 
  ctaLink = "/wisdom", 
  bgImage = "/hero-bg.jpg" 
}: HeroProps) {
  return (
    <section className="noise-overlay vignette relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      {/* Ambient Background Layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity" 
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        
        {/* Deep radial glow */}
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gold/[0.02] blur-[100px] animate-breathe" />
        {/* Atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        {/* Top edge glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[60%] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[10px] uppercase tracking-[0.4em] text-gold-muted md:text-xs"
        >
          Wisdom of Imam Ali (AS)
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 text-[2.5rem] font-light leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted/80 md:text-lg"
        >
          {subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href={ctaLink}
            className="group inline-flex items-center gap-3 rounded-full bg-gold/10 px-8 py-3.5 text-sm font-medium text-gold-light transition-all duration-500 hover:bg-gold/20 hover:shadow-[0_0_40px_-10px_rgba(201,162,39,0.3)]"
          >
            <span>{ctaText}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/before-you-text"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-8 py-3.5 text-sm font-medium text-foreground/70 transition-all duration-500 hover:border-gold/30 hover:text-gold-light"
          >
            Enter Reflection
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-20 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted/40">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-gold/30 to-transparent animate-breathe" />
        </motion.div>
      </div>
    </section>
  );
}
