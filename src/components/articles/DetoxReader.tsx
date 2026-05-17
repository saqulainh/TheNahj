"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Heart, ShieldAlert, Sparkles, BookOpen, Compass } from "lucide-react";
import Link from "next/link";

interface DetoxReaderProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    type: string;
    seo_description: string;
  };
  isDigitalDisease: boolean;
}

export function DetoxReader({ article, isDigitalDisease }: DetoxReaderProps) {
  const [zenMode, setZenMode] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathText, setBreathText] = useState("Inhale peace...");
  const [showBreathingGuide, setShowBreathingGuide] = useState(isDigitalDisease);

  // Dynamic breathing helper loop
  useEffect(() => {
    if (!showBreathingGuide) return;
    
    let cycle = 0;
    const interval = setInterval(() => {
      cycle = (cycle + 1) % 3;
      if (cycle === 0) {
        setBreathText("Inhale calm...");
      } else if (cycle === 1) {
        setBreathText("Hold...");
      } else {
        setBreathText("Exhale distraction...");
        setBreathCount(c => Math.min(c + 1, 3));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [showBreathingGuide]);

  // Listen to escape key to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZenMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFinishBreathing = () => {
    setShowBreathingGuide(false);
  };

  // Content clean formatter for modern dropcap and highlights
  const formattedContent = article.content
    .split("\n\n")
    .map((paragraph, index) => {
      if (paragraph.startsWith("**")) {
        // Highlight block
        const cleanText = paragraph.replace(/\*\*/g, "");
        return (
          <p key={index} className="my-6 border-l-2 border-gold/40 bg-gold/[0.02] px-6 py-4 font-serif text-base italic leading-relaxed text-gold-light/95 rounded-r-xl">
            {cleanText}
          </p>
        );
      }
      
      if (paragraph.startsWith("Ask:")) {
        // Question block
        return (
          <div key={index} className="my-8 rounded-2xl bg-[#0A0A0A] border border-white/[0.04] p-6 shadow-inner">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted font-medium block mb-2">Self-Inquiry</span>
            <p className="text-base text-foreground font-light leading-relaxed">{paragraph.replace("Ask:", "").trim()}</p>
          </div>
        );
      }

      if (index === 0) {
        // First paragraph has custom editorial dropcap
        return (
          <p key={index} className="text-lg leading-relaxed text-foreground/90 font-light first-letter:text-5xl first-letter:font-serif first-letter:text-gold first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85]">
            {paragraph}
          </p>
        );
      }

      return (
        <p key={index} className="text-base leading-relaxed text-muted/80 font-light my-5">
          {paragraph}
        </p>
      );
    });

  return (
    <div className={`relative min-h-screen transition-all duration-1000 ${zenMode ? "bg-[#050505] text-[#F5F5F0]" : ""}`}>
      {/* Slow Ambient Breathing Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30 blur-[130px]"
        />
        {zenMode && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-0" />
        )}
      </div>

      {/* 1. Mindful Breathing Portal (Before Reading) */}
      <AnimatePresence>
        {showBreathingGuide && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 px-6 text-center backdrop-blur-2xl"
          >
            <div className="max-w-md">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-muted font-medium">Digital Sanctuary</span>
              <h2 className="mt-4 text-3xl font-light text-[#F5F5F0]">Mindful Pause</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted/60 font-light">
                Before engaging with reflections on modern digital fatigue, give your nervous system a minute of peace. Follow the cycle below.
              </p>

              {/* Dynamic Breathing Visualizer */}
              <div className="relative mx-auto my-14 flex h-36 w-36 items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathText.includes("Inhale") ? [1, 1.4] : breathText.includes("Hold") ? [1.4, 1.4] : [1.4, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full border border-gold/15 bg-gold/[0.02] blur-[2px]"
                />
                <motion.div
                  animate={{
                    scale: breathText.includes("Inhale") ? [1, 1.2] : breathText.includes("Hold") ? [1.2, 1.2] : [1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-2 rounded-full bg-gold/10"
                />
                <span className="relative z-10 text-xs tracking-wider text-gold-light uppercase font-medium">
                  {breathText}
                </span>
              </div>

              {/* Progress Count */}
              <div className="mb-8 flex items-center justify-center gap-3">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-2 w-2 rounded-full transition-all duration-500 ${
                      breathCount >= s ? "bg-gold scale-125" : "bg-white/10"
                    }`} 
                  />
                ))}
              </div>

              {breathCount >= 3 ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleFinishBreathing}
                  className="rounded-full bg-[#F5F5F0] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Enter Reflection
                </motion.button>
              ) : (
                <button
                  onClick={handleFinishBreathing}
                  className="text-xs text-muted/40 hover:text-gold-light/60 transition-colors uppercase tracking-widest"
                >
                  Skip Pause
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation Bar (Zen Aware) */}
      <header className={`relative z-50 flex items-center justify-between border-b border-white/[0.04] px-6 py-4 md:px-12 transition-opacity duration-700 ${zenMode ? "opacity-10 cursor-none hover:opacity-100" : "opacity-100"}`}>
        <Link href="/digital-diseases" className="text-xs uppercase tracking-widest text-muted hover:text-gold-light transition-colors">
          ← Digital Diseases
        </Link>
        <button
          onClick={() => setZenMode(!zenMode)}
          className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/40 px-5 py-2 text-xs uppercase tracking-widest text-muted hover:border-gold/30 hover:text-foreground transition-all duration-300"
        >
          {zenMode ? (
            <>
              <Eye size={12} /> Exit Zen Mode
            </>
          ) : (
            <>
              <EyeOff size={12} /> Zen Detox Mode
            </>
          )}
        </button>
      </header>

      {/* 3. Article Body */}
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12 md:py-20">
        <article className="prose prose-invert max-w-none">
          {isDigitalDisease && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-5 backdrop-blur-xl"
            >
              <p className="flex items-center gap-2.5 text-xs text-red-400 font-light">
                <ShieldAlert size={14} className="shrink-0" />
                This dynamic reflection deals with active hyper-stimulation. Take it slow.
              </p>
            </motion.div>
          )}

          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-muted font-medium">
              {article.type} Column
            </span>
            <h1 className="mt-4 text-3xl font-light leading-tight text-[#F5F5F0] md:text-4xl lg:text-5xl tracking-tight">
              {article.title}
            </h1>
            <p className="mt-6 font-serif italic text-base leading-relaxed text-muted/60">
              {article.excerpt}
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-gold/30 to-transparent w-32" />
          </div>

          {/* Render article contents with customized paragraphs */}
          <div className="space-y-6">
            {formattedContent}
          </div>
        </article>

        {/* 4. Detox Completion Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 rounded-3xl border border-gold/10 bg-gradient-to-b from-gold/[0.03] to-transparent p-8 md:p-12 text-center"
        >
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mb-6">
            <Compass size={24} />
          </div>
          
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold-muted font-medium">
            Mindful Transition
          </span>
          
          <h3 className="mt-3 text-xl font-light text-[#F5F5F0]">
            Step Back & Rest
          </h3>
          
          <p className="mt-4 mx-auto max-w-sm text-sm leading-relaxed text-muted/60 font-light">
            You've completed this reflection. To ensure it integrates deeply, close this tab. Leave your phone face-down for 5 minutes. Let your eyes adjust to your physical surroundings.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button 
              onClick={() => window.location.href = "/focus"}
              className="rounded-full bg-[#F5F5F0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-black hover:bg-white transition-all"
            >
              Enter Focus Space
            </button>
            <button 
              onClick={() => window.location.href = "/"}
              className="rounded-full border border-border bg-surface/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted hover:border-gold/30 hover:text-foreground transition-all"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
