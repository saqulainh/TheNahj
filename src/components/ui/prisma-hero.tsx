"use client";

import Script from "next/script";
import Link from "next/link";
import { ArrowRight, BookOpen, Headphones } from "lucide-react";
import { KarbalaConnectHeroPromo } from "@/components/home/KarbalaConnectHeroPromo";

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
  subtext = "Navigate modern life through the wisdom of Imam Ali (AS) and profound Nahjul Balagha sayings.",
  ctaText = "Explore Wisdom",
  ctaLink = "/wisdom",
}: PrismaHeroProps) {
  return (
    <section className="thenahj-hero-section relative w-full px-3 py-3 sm:px-5 md:px-7">
      <div className="orbit mx-auto w-full max-w-[1480px]" aria-labelledby="thenahj-hero-title">
        <div className="orbit__content">
          <span className="thenahj-hero-kicker">
            <span className="thenahj-hero-kicker-dot" aria-hidden="true" />
            THE NAHJUL BALAGHA
          </span>

          <h2 className="hero__title" id="thenahj-hero-title">
            <span className="hero__line">We seek the wisdom of</span>
            <span className="hero__line">
              <span className="hero__badge">Imam Ali (AS)</span>
            </span>
          </h2>

          <p className="hero__lede">{subtext}</p>

          <div className="hero__cta">
            <Link href={ctaLink} className="thenahj-hero-button thenahj-hero-button--primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/audio" className="thenahj-hero-button thenahj-hero-button--ghost">
              <Headphones className="h-5 w-5" aria-hidden="true" />
              Listen to wisdom
            </Link>
          </div>

          <KarbalaConnectHeroPromo />

        </div>

        <div className="orbit__art" data-scene aria-hidden="true">
          <img
            className="orbit__img"
            src="/imam-science-hero/img/hero-scene.webp"
            alt=""
            width="1312"
            height="1199"
            fetchPriority="high"
            decoding="async"
          />
          <canvas className="orbit__scene" data-scene-gl />
          <div className="orbit__fade" />
        </div>

        <div className="orbit__beams" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
        <canvas className="orbit__fx" data-scene-fx aria-hidden="true" />
      </div>

      {/* Keep shader setup off the initial page render; the still artwork is ready first. */}
      <Script src="/imam-science-hero/js/hero.js?v=2d6e867a" strategy="lazyOnload" />
    </section>
  );
}
