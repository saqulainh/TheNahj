"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Wisdom } from "@/lib/types";

interface DailyWisdomShowcaseProps {
  items: Wisdom[];
}

export function DailyWisdomShowcase({ items }: DailyWisdomShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isHovered || isPaused || items.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, isPaused, items.length]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-3xl border border-gold/20 shadow-2xl bg-surface-alt transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Islamic Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C7A654' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />
      
      {/* Golden glow at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gold/10 blur-[60px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative px-6 py-12 md:px-12 md:py-16 flex flex-col items-center text-center z-10 min-h-[400px] justify-center"
        >
          {currentItem.category && (
            <span className="mb-6 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              {currentItem.category.name}
            </span>
          )}

          <div className="max-w-2xl space-y-6">
            <h3 
              className="text-3xl md:text-5xl font-arabic text-gold/90 leading-tight"
              dir="rtl"
            >
              {currentItem.arabic_text}
            </h3>
            
            <p 
              className="text-lg md:text-xl text-foreground/80 font-urdu leading-relaxed"
              dir="rtl"
            >
              {currentItem.urdu_translation}
            </p>

            <p className="text-sm md:text-base text-foreground/70 font-light leading-relaxed">
              &quot;{currentItem.english_translation}&quot;
            </p>

            <p className="text-xs text-gold-muted/80 uppercase tracking-widest font-semibold mt-4">
              — {currentItem.source}
            </p>
          </div>

          <Link 
            href={`/wisdom/${currentItem.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-black transition-all hover:bg-gold-light hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(199,166,84,0.3)]"
          >
            Reflect on this
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 bottom-6 px-6 flex items-center justify-between z-20">
        <div className="flex gap-2">
          {items.length > 1 && (
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full bg-black/40 text-gold-muted hover:text-gold hover:bg-black/60 transition-all border border-white/5"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play size={14} className="ml-0.5" /> : <Pause size={14} />}
            </button>
          )}
        </div>

        {/* Progress Dots */}
        {items.length > 1 && (
          <div className="flex gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? "w-6 bg-gold shadow-[0_0_10px_rgba(199,166,84,0.5)]" 
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {items.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="p-2 rounded-full bg-black/40 text-gold-muted hover:text-gold hover:bg-black/60 transition-all border border-white/5"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={nextSlide}
                className="p-2 rounded-full bg-black/40 text-gold-muted hover:text-gold hover:bg-black/60 transition-all border border-white/5"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
