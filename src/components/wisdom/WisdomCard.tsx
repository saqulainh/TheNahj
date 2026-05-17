"use client";

import Link from "next/link";
import { Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Wisdom } from "@/lib/types";
import { SITE_NAME } from "@/lib/brand";
import { getSavedSlugs, toggleSaveAsync } from "@/lib/wisdom";

interface WisdomCardProps {
  wisdom: Wisdom;
  index?: number;
}

export function WisdomCard({ wisdom, index = 0 }: WisdomCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSavedSlugs().includes(wisdom.slug));
  }, [wisdom.slug]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Optimistic UI update
    setSaved(!saved);
    const isSaved = await toggleSaveAsync(wisdom.slug);
    setSaved(isSaved);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/wisdom/${wisdom.slug}`;
    const text = wisdom.english_translation;
    if (navigator.share) {
      await navigator.share({ title: SITE_NAME, text, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const backgroundType = wisdom.background_type ?? 'minimal';
  const backgroundUrl = wisdom.background_url ?? wisdom.featured_image ?? wisdom.background_image ?? '';
  const hasBg = !!wisdom.featured_image || !!backgroundUrl || !!wisdom.background_image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="card-cinematic noise-overlay group"
    >
      <Link href={`/wisdom/${wisdom.slug}`} className="block relative h-full">
        {/* ─── Background Layer ─── */}
        <div className="absolute inset-0 z-0">
          {hasBg ? (
            <>
              {backgroundUrl ? (
                <img
                  src={backgroundUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                />
              ) : (
                <img
                  src={wisdom.featured_image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                />
              )}
              {/* Type-specific overlays */}
              {backgroundType === 'cinematic' && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] transition-all duration-700 group-hover:bg-black/55" />
              )}
              {backgroundType === 'abstract' && (
                <div className="absolute inset-0 bg-[url('/textures/abstract.png')] bg-cover bg-[opacity:0.3]" />
              )}
              {backgroundType === 'architectural' && (
                <div className="absolute inset-0 bg-black/40" />
              )}
              {/* Default overlay for other types (including minimal) */}
              {(!['cinematic', 'abstract', 'architectural'].includes(backgroundType)) && (
                <div className="absolute inset-0 bg-black/50" />
              )}
            </>
          ) : (
            <div className={`
              h-full w-full 
              transition-all duration-700 
              group-hover:from-surface-elevated
              ${backgroundType === 'cinematic' ? 'bg-gradient-to-br from-surface via-surface to-surface-elevated' :
                backgroundType === 'abstract' ? 'bg-gradient-to-tr from-purple-500 to-pink-500' :
                backgroundType === 'architectural' ? 'bg-gradient-to-bl from-gray-800 to-gray-900' :
                'bg-surface'}
            `} />
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* ─── Content Layer ─── */}
        <div className="relative z-10 flex h-full min-h-[380px] flex-col justify-center p-7 md:min-h-[420px] md:p-10">
          {/* Arabic — visually dominant */}
          <p
            className="font-arabic text-center text-[1.7rem] leading-[2.2] text-foreground drop-shadow-2xl md:text-4xl md:leading-[2.4]"
            dir="rtl"
            lang="ar"
          >
            {wisdom.arabic_text}
          </p>

          {/* Gold divider */}
          <div className="mx-auto my-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/40 to-transparent md:my-8 md:w-28" />

          {/* Urdu */}
          <p
            className="font-urdu text-center text-base leading-[2] text-foreground/85 drop-shadow-lg"
            dir="rtl"
          >
            {wisdom.urdu_translation}
          </p>

          {/* English */}
          <p className="mt-5 text-center text-sm leading-relaxed text-muted/80 drop-shadow-md md:text-base">
            {wisdom.english_translation}
          </p>

          {/* ─── Footer ─── */}
          <div className="mt-auto pt-8">
            {/* Meta row */}
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] font-medium font-display">
              <span className="text-gold-light/70">{wisdom.category?.name ?? "Wisdom"}</span>
              <span className="text-muted/40">{wisdom.source}</span>
            </div>

            {/* Actions row */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <span className="flex items-center gap-2 text-sm text-gold/70 transition-all duration-300 group-hover:gap-3 group-hover:text-gold-light font-display">
                <span>Read Reflection</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className={`rounded-full p-2 transition-all duration-300 hover:scale-110 ${
                    saved ? "text-gold" : "text-muted/50 hover:text-foreground"
                  }`}
                  aria-label={saved ? "Unsave" : "Save"}
                >
                  <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-full p-2 text-muted/50 transition-all duration-300 hover:scale-110 hover:text-foreground"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}