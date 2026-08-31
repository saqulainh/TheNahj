"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Share2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Wisdom } from "@/lib/types";
import { SITE_NAME } from "@/lib/brand";
import { getSavedSlugs, toggleSaveAsync } from "@/lib/wisdom";
import ImageRole from "@/components/ui/ImageRole";
import { ShareableWisdomCard } from "@/components/wisdom/ShareableWisdomCard";
import { AddToCollectionMenu } from "@/components/wisdom/CollectionManager";
import { AudioReaderButton } from "@/components/wisdom/AudioReaderButton";

interface WisdomCardProps {
  wisdom: Wisdom;
  index?: number;
}

export function WisdomCard({ wisdom, index = 0 }: WisdomCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="wisdom-classic-card group"
    >
      {/* ─── absolute clickable overlay for card ─── */}
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={`Read reflection on ${wisdom.english_translation}`}
        />
      )}

      {/* Background image */}
      {(wisdom.featured_image || (wisdom as any).background_image) && (
        <div className="absolute inset-0 z-0">
          <ImageRole 
            src={wisdom.featured_image || (wisdom as any).background_image} 
            role="card" 
            className="w-full h-full opacity-15 mix-blend-luminosity" 
            focalPoint={null} 
            unconstrained={true}
            priority={index < 4}
          />
        </div>
      )}

      {/* ─── Card Header Wrapper ─── */}
      <div className="wisdom-classic-wrapper justify-end relative z-20">
        {/* Action buttons (Bookmark/Save & Share) */}
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
      <div className="relative z-20 flex-grow flex flex-col justify-center py-5 pointer-events-none text-center">
        {/* Arabic Typography */}
        <p
          className="wisdom-classic-title text-[1.65rem] leading-[2.1] text-center font-arabic drop-shadow-sm text-foreground"
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
        <p className="wisdom-classic-translation text-center text-[13.5px] leading-relaxed text-secondary/80 font-normal">
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

      {/* ─── Footer Layout ─── */}
      <div className="relative z-20 mt-auto pt-4 text-center">
        {/* Work / Indicator */}
        <div className="wisdom-classic-indicator text-center text-foreground/90">
          <span className="wisdom-classic-indicator-amount">
            {wisdom.category?.name ?? "Wisdom"}
          </span>
          {" / "}
          <span className="wisdom-classic-indicator-percentage">
            {wisdom.source}
          </span>
        </div>

        {/* Progress Bar representation */}
        <div className="wisdom-classic-progress">
          <progress max="100" value={Math.min(100, Math.max(25, ((index + 1) % 5) * 20 + 20))}></progress>
        </div>

        {/* Learn More link */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-semibold font-display text-gold group-hover:text-gold-light transition-colors duration-300">
          <span>Read Reflection</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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