"use client";

import { ReflectionFlow } from "@/components/before-you-text/ReflectionFlow";
import { motion } from "framer-motion";

export default function BeforeYouTextPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] w-full items-center justify-center py-12 md:py-20 selection:bg-gold/30 selection:text-white">
      {/* 1. Immersive Atmospheric Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft, deep ambient glows */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[120px]" />
        <div className="absolute right-10 top-20 h-[300px] w-[300px] rounded-full bg-white/[0.01] blur-[80px]" />
        
        {/* Fine Grain/Noise Layer */}
        <div
          className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 2. Glassmorphic Core Container */}
      <div className="relative z-10 w-full max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="noise-overlay relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0A0A0A]/40 p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
          {/* Subtle gold line on top card border */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          
          <ReflectionFlow />
        </motion.div>
      </div>
    </section>
  );
}
