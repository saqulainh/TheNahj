"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import styles from "./page.module.css";

const slides = [
  {
    eyebrow: "HOME · MADE FOR YOU",
    title: "A little of everything,\nall in one place.",
    description: "Featured voices, Quran and the categories you return to.",
    image: "/karbala-connect/home.webp",
    alt: "Karbala Connect home screen with featured audio, Quran and categories",
    secondaryImage: "/karbala-connect/quran.webp",
    secondaryAlt: "Karbala Connect Quran screen",
    note: "Your listening, at a glance",
    arrow: "M286 42 C259 78 252 110 224 145 C199 177 183 203 157 265",
  },
  {
    eyebrow: "DISCOVER · FIND YOUR VOICE",
    title: "Many voices.\nOne easy place.",
    description: "Explore Ulema, nauhakhwans and reciters by collection.",
    image: "/karbala-connect/reciters.webp",
    alt: "Karbala Connect reciters screen showing Ulema and nauhakhwans",
    secondaryImage: "/karbala-connect/anjumans.webp",
    secondaryAlt: "Karbala Connect Anjuman directory",
    note: "Browse by reciter",
    arrow: "M284 42 C263 78 239 108 219 144 C196 178 174 202 148 260",
  },
  {
    eyebrow: "LISTEN · PICK UP WHERE YOU LEFT OFF",
    title: "A player that lets\nthe words stay close.",
    description: "Rewind, move forward, save a favourite or share a track.",
    image: "/karbala-connect/player.webp",
    alt: "Karbala Connect audio player with artwork and playback controls",
    secondaryImage: "/karbala-connect/home.webp",
    secondaryAlt: "Karbala Connect home screen",
    note: "Playback that follows you",
    arrow: "M286 42 C268 80 263 112 231 149 C203 181 179 207 158 268",
  },
  {
    eyebrow: "COMMUNITY · AROUND YOU",
    title: "Find an Anjuman\nnear your city.",
    description: "Search by Anjuman, city or state. Location stays optional.",
    image: "/karbala-connect/anjumans.webp",
    alt: "Karbala Connect Anjuman directory with state and city search",
    secondaryImage: "/karbala-connect/reciters.webp",
    secondaryAlt: "Karbala Connect reciters screen",
    note: "Search by city or state",
    arrow: "M284 42 C258 78 238 110 216 148 C194 181 174 205 148 264",
  },
  {
    eyebrow: "QURAN · READ & LISTEN",
    title: "Keep Quran close,\nwherever you are.",
    description: "Open a surah and follow along with recitation and translation.",
    image: "/karbala-connect/quran.webp",
    alt: "Karbala Connect Quran screen with Arabic text and translation",
    secondaryImage: "/karbala-connect/player.webp",
    secondaryAlt: "Karbala Connect audio player",
    note: "Read along with audio",
    arrow: "M286 42 C265 80 250 111 223 148 C198 181 176 208 154 267",
  },
  {
    eyebrow: "PODCASTS · NEW PERSPECTIVES",
    title: "Make space for\nlonger conversations.",
    description: "Find thoughtful talks and podcasts from trusted voices.",
    image: "/karbala-connect/podcast.webp",
    alt: "Karbala Connect podcast screen with featured episodes",
    secondaryImage: "/karbala-connect/player.webp",
    secondaryAlt: "Karbala Connect audio player",
    note: "Listen to a full episode",
    arrow: "M286 42 C264 80 251 110 221 148 C196 181 175 207 152 266",
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
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
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
          <h2 id="showcase-title">A closer look at <em>what you can do.</em></h2>
          <p>Real app screens, with the details that make listening feel easy.</p>
        </div>
        <div className={styles.showcaseControls} aria-label="Feature carousel controls">
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause slideshow" : "Play slideshow"}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button type="button" onClick={() => go(-1)} aria-label="Previous feature" disabled={index === 0}><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next feature" disabled={index === maxIndex}><ArrowRight size={18} /></button>
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
                <div className={`${styles.featureScreen} ${styles.featureScreenSecondary}`}>
                  <Image src={slide.secondaryImage} alt={slide.secondaryAlt} fill sizes="(max-width: 680px) 34vw, 12vw" />
                </div>
                <div className={`${styles.featureScreen} ${styles.featureScreenPrimary}`}>
                  <Image src={slide.image} alt={slide.alt} fill sizes="(max-width: 680px) 54vw, 16vw" />
                </div>
                <div className={styles.featureAnnotation}>
                  <span className={styles.annotationDot} />
                  <span>{slide.note}</span>
                </div>
                <svg className={styles.annotationArrow} viewBox="0 0 320 340" fill="none" aria-hidden="true">
                  <defs><marker id={`arrowhead-${slideIndex}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1 1L7 4.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
                  <path d={slide.arrow} stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" markerEnd={`url(#arrowhead-${slideIndex})`} />
                </svg>
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
            <button key={dot} type="button" aria-label={`Go to feature ${dot + 1}`} aria-current={index === dot ? "step" : undefined} onClick={() => setIndex(dot)} />
          ))}
        </div>
      </div>
    </section>
  );
}
