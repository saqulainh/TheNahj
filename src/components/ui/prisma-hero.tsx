"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";



interface PrismaHeroProps {
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
  bgMode?: "image" | "video";
  bgImage?: string;
  mobileBgImage?: string;
  bgVideo?: string;
  focalPoint?: string;
  overlayBrightness?: number;
  overlayBlur?: number;
}

export function PrismaHero({
  headline = "TheNahj",
  subtext = "Wisdom for the distracted generation.",
  ctaText = "Explore Wisdom",
  ctaLink = "/wisdom",
  bgMode = "video",
  bgImage = "/hero-bg.jpg",
  mobileBgImage = "/hero-bg.jpg",
  bgVideo = "https://cdn.pixabay.com/video/2019/02/25/21626-319524075_large.mp4",
  focalPoint = "center",
  overlayBrightness = 60,
  overlayBlur = 0,
}: PrismaHeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeImage = isMobile && mobileBgImage ? mobileBgImage : bgImage;

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-background selection:bg-gold/30 selection:text-foreground">
      {/* 1. Cinematic Background Layer */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 15, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        {bgMode === "video" ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={activeImage}
            className="h-full w-full object-cover opacity-40 mix-blend-luminosity filter contrast-125"
            style={{ objectPosition: focalPoint || "center" }}
          >
            <source src={bgVideo} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="h-full w-full opacity-60 mix-blend-luminosity filter contrast-110"
            style={{ 
              backgroundImage: `url('${activeImage}')`,
              backgroundSize: "cover",
              backgroundPosition: focalPoint || "center",
              backgroundRepeat: "no-repeat"
            }}
          />
        )}
      </motion.div>

      {/* 2. Advanced Overlay System */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Dynamic Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" 
          style={{ opacity: overlayBrightness / 100 }}
        />
        
        {/* Dynamic Blur Overlay */}
        {overlayBlur > 0 && (
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backdropFilter: `blur(${overlayBlur}px)` }}
          />
        )}

        {/* Ambient Gold Shadows/Glows */}
        <div className="absolute -left-1/4 bottom-0 h-[800px] w-[800px] rounded-full bg-gold/[0.03] blur-[150px]" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-white/[0.01] blur-[120px]" />

        {/* Fine Grain/Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.25] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
      </div>

      {/* 4. Bottom-Aligned Editorial Content */}
      <div className="relative z-20 flex min-h-[100dvh] flex-col justify-end px-4 sm:px-6 pb-16 md:px-16 md:pb-28 lg:px-24">
        <div className="max-w-[1200px]">
          {/* Brand Kicker Badge + Editorial Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface/70 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.25em] text-gold-light truncate">
                TheNahj • Wisdom of Imam Ali (AS)
              </span>
            </div>

            <h1 className="font-serif tracking-tight text-foreground text-[clamp(1.85rem,6vw,5.5rem)] leading-[1.1] sm:leading-[1.08] max-w-4xl">
              {headline || "Nahjul Balagha quotes for the distracted generation."}
            </h1>
          </motion.div>

          {/* Subtext Area */}
          <div className="mt-6 md:mt-8 max-w-2xl pl-1 md:pl-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-5"
            >
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 top-1 w-[1.5px] bg-gradient-to-b from-gold/70 to-transparent" />
              <p className="text-base leading-relaxed text-secondary md:text-lg font-light font-display">
                {subtext}
              </p>
            </motion.div>
          </div>

          {/* Premium CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 md:mt-12 pl-1 md:pl-2"
          >
            <Link
              href={ctaLink}
              className="group inline-flex items-center gap-5 rounded-full bg-foreground p-2 pl-8 transition-all duration-500 hover:bg-gold hover:shadow-[0_0_40px_-10px_rgba(199,166,84,0.4)]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background group-hover:text-black transition-colors">
                {ctaText}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground transition-all duration-500 group-hover:scale-105 group-hover:bg-black group-hover:text-gold">
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
