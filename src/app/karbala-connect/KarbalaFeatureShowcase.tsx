"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import styles from "./page.module.css";

interface Annotation {
  text: string;
  position: "left" | "right";
  top: string;
  arrowD: string;
}

interface Slide {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  annotations: Annotation[];
}

const slides: Slide[] = [
  {
    eyebrow: "HOME · MADE FOR YOU",
    title: "Daily Audio Feed",
    description: "Featured Nauhe, Quran recitations, and quick categories curated right when you open the app.",
    image: "/karbala-connect/home.webp",
    alt: "Karbala Connect home screen with featured audio, Quran and categories",
    annotations: [
      {
        text: "Featured recitations & categories",
        position: "left",
        top: "22px",
        arrowD: "M 10 32 C 30 52, 55 68, 85 76",
      },
      {
        text: "Quick access to Quran",
        position: "right",
        top: "84px",
        arrowD: "M 75 28 C 50 48, 25 58, 2 64",
      },
    ],
  },
  {
    eyebrow: "COMMUNITY · AROUND YOU",
    title: "Explore Anjumans",
    description: "Discover 23 verified Anjumans across Uttar Pradesh, Bihar, and beyond with city-wise filtering.",
    image: "/karbala-connect/anjumans-real.jpg",
    alt: "Karbala Connect Anjuman directory showing 23 verified anjumans across 3 states",
    annotations: [
      {
        text: "Filter by city or state",
        position: "left",
        top: "24px",
        arrowD: "M 12 30 C 35 48, 55 62, 82 70",
      },
      {
        text: "Verified Anjuman badges",
        position: "right",
        top: "92px",
        arrowD: "M 72 26 C 48 45, 22 55, 0 62",
      },
    ],
  },
  {
    eyebrow: "LISTEN · SEAMLESS PLAYBACK",
    title: "Dedicated Audio Player",
    description: "Full playback controls with 2x speed, quick rewind, background audio, and offline favorites.",
    image: "/karbala-connect/player.webp",
    alt: "Karbala Connect audio player with artwork and playback controls",
    annotations: [
      {
        text: "2x playback speed",
        position: "left",
        top: "28px",
        arrowD: "M 14 30 C 36 50, 60 65, 86 72",
      },
      {
        text: "Save to offline favorites",
        position: "right",
        top: "80px",
        arrowD: "M 76 26 C 52 46, 24 56, 2 62",
      },
    ],
  },
  {
    eyebrow: "QURAN · RECITATION & TEXT",
    title: "Read & Listen Quran",
    description: "Follow along with surah-wise Arabic recitation, translations, and ayah-by-ayah guidance.",
    image: "/karbala-connect/quran.webp",
    alt: "Karbala Connect Quran screen with Arabic text and translation",
    annotations: [
      {
        text: "Follow Arabic verses",
        position: "left",
        top: "24px",
        arrowD: "M 12 32 C 34 50, 58 66, 84 74",
      },
      {
        text: "Ayah-by-ayah audio",
        position: "right",
        top: "86px",
        arrowD: "M 74 26 C 50 46, 26 56, 2 62",
      },
    ],
  },
  {
    eyebrow: "DISCOVER · TRUSTED VOICES",
    title: "Ulema & Reciters",
    description: "Complete majlis series from respected scholars and heartfelt nauhe from beloved nauhakhwans.",
    image: "/karbala-connect/reciters.webp",
    alt: "Karbala Connect reciters screen showing Ulema and nauhakhwans",
    annotations: [
      {
        text: "Respected ulema majalis",
        position: "left",
        top: "22px",
        arrowD: "M 12 30 C 35 48, 58 64, 84 72",
      },
      {
        text: "Organized by reciter",
        position: "right",
        top: "84px",
        arrowD: "M 74 26 C 50 46, 24 55, 2 62",
      },
    ],
  },
  {
    eyebrow: "DISCUSSIONS · DEEP TALKS",
    title: "Thoughtful Podcasts",
    description: "Long-form discussions, Islamic history, and insightful commentary from knowledgeable speakers.",
    image: "/karbala-connect/podcast.webp",
    alt: "Karbala Connect podcast screen with featured episodes",
    annotations: [
      {
        text: "Long-form conversations",
        position: "left",
        top: "26px",
        arrowD: "M 12 32 C 34 50, 58 66, 84 74",
      },
      {
        text: "Islamic history & reflections",
        position: "right",
        top: "88px",
        arrowD: "M 74 26 C 50 46, 24 55, 2 62",
      },
    ],
  },
  {
    eyebrow: "APP OVERVIEW · FREE FOREVER",
    title: "Handheld Devotion",
    description: "500+ licensed tracks, zero subscriptions, zero ads — built with pure love for Ahle Bayt (A.S.).",
    image: "/karbala-connect/hand-phone-dark.jpg",
    alt: "Hand holding phone running Karbala Connect Islamic Audio App",
    annotations: [
      {
        text: "500+ Islamic tracks",
        position: "left",
        top: "22px",
        arrowD: "M 12 30 C 35 48, 58 64, 84 72",
      },
      {
        text: "100% free forever",
        position: "right",
        top: "82px",
        arrowD: "M 74 26 C 50 46, 24 55, 2 62",
      },
    ],
  },
];

export default function KarbalaFeatureShowcase() {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(4);
  const [playing, setPlaying] = useState(true);
  const direction = useRef(1);
  const maxIndex = Math.max(0, slides.length - visible);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector<HTMLElement>("[data-feature-slide]");
      if (!card) return;
      const gap = parseFloat(getComputedStyle(track).columnGap || "18");
      setStep(card.getBoundingClientRect().width + gap);
      setVisible(window.innerWidth <= 680 ? 1 : window.innerWidth <= 1000 ? 2 : window.innerWidth <= 1280 ? 3 : 4);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= maxIndex) direction.current = -1;
        if (current <= 0) direction.current = 1;
        return Math.min(maxIndex, Math.max(0, current + direction.current));
      });
    }, 4800);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, maxIndex]);

  const go = (delta: number) => {
    direction.current = delta;
    setIndex((current) => Math.min(maxIndex, Math.max(0, current + delta)));
  };

  return (
    <section className={styles.showcase} id="listen" aria-labelledby="showcase-title">
      <div className={styles.showcaseHeader}>
        <div>
          <span className={styles.showcaseEyebrow}>INSIDE KARBALA CONNECT</span>
          <h2 id="showcase-title">Take a look inside <em>Karbala Connect</em></h2>
          <p>Nauhe, duas, ziyarat, Quran recitations, and Anjumans — calm by design.</p>
        </div>
        <div className={styles.showcaseControls} aria-label="Feature carousel controls">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous feature"
            disabled={index === 0}
            title="Previous"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next feature"
            disabled={index === maxIndex}
            title="Next"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <div className={styles.showcaseViewport}>
        <motion.div
          ref={trackRef}
          className={styles.showcaseTrack}
          animate={{ x: -index * step }}
          drag="x"
          dragConstraints={{ left: -maxIndex * step, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x < -45) go(1);
            if (info.offset.x > 45) go(-1);
          }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 82, damping: 22, mass: 0.8 }}
        >
          {slides.map((slide, slideIndex) => (
            <article className={styles.showcaseCard} data-feature-slide key={slide.eyebrow}>
              <span className={styles.cardEyebrow}>{slide.eyebrow}</span>
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
              
              <div className={styles.featureVisual}>
                {/* Clean Smartphone Mockup */}
                <div className={styles.phoneDevice}>
                  <div className={styles.phoneIsland} aria-hidden="true" />
                  <div className={styles.phoneScreen}>
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      sizes="(max-width: 680px) 75vw, 240px"
                      priority={slideIndex < 3}
                    />
                  </div>
                </div>

                {/* Handcrafted Editorial Annotations */}
                {slide.annotations.map((ann, annIndex) => (
                  <div
                    key={ann.text}
                    className={`${styles.featureCallout} ${
                      ann.position === "left" ? styles.calloutLeft : styles.calloutRight
                    }`}
                    style={{ top: ann.top }}
                  >
                    <div className={styles.calloutBadge}>
                      <span className={styles.calloutDot} />
                      <span>{ann.text}</span>
                    </div>
                    <svg
                      className={`${styles.calloutArrow} ${
                        ann.position === "left" ? styles.arrowLeft : styles.arrowRight
                      }`}
                      viewBox="0 0 95 85"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={ann.arrowD}
                        stroke="rgba(145, 114, 58, 0.75)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={ann.position === "left" ? 85 : 2}
                        cy={ann.position === "left" ? 76 : 62}
                        r="3"
                        fill="#b08a3e"
                      />
                    </svg>
                  </div>
                ))}

                <span className={styles.visualIndex}>{String(slideIndex + 1).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </motion.div>
      </div>

      <div className={styles.showcaseFooter}>
        <span>Swipe or use the arrows to explore</span>
        <div className={styles.showcaseDots} aria-label={`Feature ${index + 1} of ${maxIndex + 1}`}>
          {Array.from({ length: maxIndex + 1 }, (_, dot) => (
            <button
              key={dot}
              type="button"
              aria-label={`Go to feature ${dot + 1}`}
              aria-current={index === dot ? "step" : undefined}
              onClick={() => setIndex(dot)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
