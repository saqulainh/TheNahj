"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Share2, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Wisdom } from "@/lib/types";
import { getSavedSlugs, toggleSaveAsync } from "@/lib/wisdom";
import { ShareableWisdomCard } from "@/components/wisdom/ShareableWisdomCard";
import { AddToCollectionMenu } from "@/components/wisdom/CollectionManager";
import { AudioReaderButton } from "@/components/wisdom/AudioReaderButton";

interface WisdomCardProps {
  wisdom: Wisdom;
  index?: number;
}

export function WisdomCard({ wisdom, index = 0 }: WisdomCardProps) {
  const reduceMotion = useReducedMotion();
  const [saved, setSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = (() => {
    if (!wisdom.slug) return null;
    const params = new URLSearchParams();
    const query = searchParams?.toString();
    const from = query ? `${pathname}?${query}` : pathname;
    params.set("from", from);
    if (wisdom.category?.slug) params.set("theme", wisdom.category.slug);
    return `/wisdom/${encodeURIComponent(wisdom.slug)}?${params.toString()}`;
  })();

  useEffect(() => {
    if (!wisdom?.slug) return;
    setSaved(getSavedSlugs().includes(wisdom.slug));
  }, [wisdom?.slug]);

  if (!wisdom) {
    return null;
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wisdom.slug) return;
    // Optimistic UI update
    setSaved(!saved);
    const isSaved = await toggleSaveAsync(wisdom.slug);
    setSaved(isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: Math.min(index, 3) * 0.06 }}
      className="wisdom-classic-card group relative cursor-pointer rounded-3xl border border-border/55 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(122,91,39,.32)] hover:border-gold/40"
    >
      {/* ─── absolute clickable overlay for card ─── */}
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={`Read full reflection on: ${wisdom.english_translation}`}
        />
      )}

      {/* ─── Card Header Wrapper (Affordance Tag + Actions) ─── */}
      <div className="flex items-center justify-between w-full relative z-20 pointer-events-none select-none">
        {/* Topic label */}
        <div className="rounded-full border border-gold/25 bg-gold/[.07] px-3 py-1 text-[10px] font-semibold tracking-[.14em] uppercase font-display text-gold-muted">
          <span>{wisdom.category?.name ?? "Wisdom"}</span>
        </div>

        {/* Right: Action buttons (Bookmark/Save & Share) */}
        <div className="flex gap-2 relative z-30 pointer-events-auto">
          <button
            type="button"
            onClick={handleShare}
            className="wisdom-classic-menu text-secondary/70 hover:text-foreground"
            aria-label="Share reflection"
          >
            <Share2 size={15} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`wisdom-classic-menu ${
              saved 
                ? "text-gold bg-gold/10 hover:bg-gold/20" 
                : "text-secondary/70 hover:text-foreground"
            }`}
            aria-label={saved ? "Unsave reflection" : "Save reflection"}
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </button>
          {/* Collection dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCollectionMenuOpen(!isCollectionMenuOpen); }}
              className="wisdom-classic-menu text-secondary/70 hover:text-foreground"
              aria-label="Add to collection"
            >
              <ChevronDown size={15} />
            </button>
            <AddToCollectionMenu
              slug={wisdom.slug}
              isOpen={isCollectionMenuOpen}
              onClose={() => setIsCollectionMenuOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* ─── Content Layer ─── */}
      <div className="relative z-20 flex-grow flex flex-col justify-center py-5 pointer-events-none select-none text-center">
        {/* Arabic Typography */}
        <p
          className="wisdom-classic-title text-[clamp(1.35rem,4vw,1.65rem)] leading-[2] text-center font-arabic text-foreground"
          dir="rtl"
          lang="ar"
        >
          {wisdom.arabic_text}
        </p>

        {/* Urdu Translation */}
        <p
          className="wisdom-classic-subtitle text-center font-urdu text-[14.5px] leading-[1.95] text-foreground/80"
          dir="rtl"
        >
          {wisdom.urdu_translation}
        </p>

        {/* English Translation */}
        <p className="wisdom-classic-translation text-center text-[15px] md:text-[16px] leading-relaxed text-secondary/90 font-serif italic">
          {wisdom.english_translation}
        </p>

        {/* Audio Voice Narration Engine */}
        <div className="mt-3 flex justify-center pointer-events-auto relative z-30">
          <AudioReaderButton 
            text={wisdom.english_translation} 
            arabicText={wisdom.arabic_text}
            urduText={wisdom.urdu_translation}
            source={wisdom.source} 
          />
        </div>
      </div>

      {/* ─── Footer Layout (Metadata & High-Affordance CTA Button) ─── */}
      <div className="relative z-20 mt-auto pt-4 text-center pointer-events-none select-none">
        {/* Category & Source Metadata */}
        <div className="wisdom-classic-indicator text-center text-foreground/80">
          <span className="wisdom-classic-indicator-percentage text-muted">
            {wisdom.source}
          </span>
        </div>

        {/* Delicate Tazhib Hairline */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="h-px w-full max-w-[180px] bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
        </div>

        {/* Prominent Illuminated CTA Pill Button (Fixed Navigation & Affordance) */}
        <div className="mt-2 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 border-b border-gold/30 pb-1 text-[11px] font-semibold uppercase tracking-[.15em] font-display text-gold-muted transition-colors group-hover:border-gold group-hover:text-gold-light">
            <span>Read reflection</span>
            <span className="text-sm font-bold transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
      
      {/* Share Modal - rendered outside the clickable link area to prevent nested interactions */}
      <ShareableWisdomCard
        wisdom={wisdom}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </motion.article>
  );
}
