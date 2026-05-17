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
      <div className="relative z-20 flex min-h-[100dvh] flex-col justify-end px-6 pb-20 md:px-16 md:pb-32 lg:px-24">
        <div className="max-w-[1200px]">
          {/* Massive Editorial Typography */}
          <motion.div
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif italic leading-[0.85] tracking-tighter text-foreground text-[clamp(4rem,10vw,12rem)]">
              TheNahj
            </h1>
          </motion.div>

          {/* Subtext Area */}
          <div className="mt-8 md:mt-12 max-w-2xl pl-1 md:pl-3">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif tracking-tight text-foreground/90 text-[clamp(1.5rem,3.5vw,3rem)] leading-tight"
            >
              {headline}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-6 max-w-md pl-5"
            >
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 top-1 w-[1px] bg-gradient-to-b from-gold/40 to-transparent" />
              <p className="text-base leading-relaxed text-secondary md:text-lg font-light font-display">
                {subtext}
              </p>
            </motion.div>
          </div>

          {/* Premium CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 md:mt-16 pl-1 md:pl-3"
          >
            <Link
              href={ctaLink}
              className="group inline-flex items-center gap-5 rounded-full bg-foreground p-2 pl-8 transition-all duration-500 hover:bg-white hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-background">
                {ctaText}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:scale-105">
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
