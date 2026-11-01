import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import styles from "./page.module.css";
import KarbalaFeatureShowcase from "./KarbalaFeatureShowcase";
import { StoreBadges } from "@/components/home/StoreBadges";

export const metadata: Metadata = {
  title: "Karbala Connect — Islamic Audio, Together",
  description: "Explore Nauhe, Duas, Ziyarat, Manqabat, Quran recitation, Ulema and Anjuman discovery in the Karbala Connect app.",
  alternates: { canonical: "/karbala-connect" },
};

const categories = ["Nauhe & Marsiye", "Duas & Ziyarat", "Manqabat", "Masaib", "Majlis", "Quran", "Podcasts", "Ulema"];

function StoreLinks() {
  return <StoreBadges className={styles.storeLinks} />;
}

export default function KarbalaConnectPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="kc-hero-title">
        <div className={styles.heroPanel}>
          <div className={styles.heroGlow} aria-hidden="true" />
          
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span className={styles.pulse}>
                <span className={styles.pulseDot} />
              </span>
              A free Islamic audio app
            </div>
            
            <h1 id="kc-hero-title">
              Karbala <em>Connect.</em>
            </h1>
            <p className={styles.heroTagline}>The voices of Karbala, close at hand.</p>
            <p className={styles.heroLead}>
              Nauhe, duas, ziyarat, Quran and respected ulema—together in one beautifully organised app.
            </p>
            <p className={styles.heroUrdu} lang="hi">
              Ahle Bayt (A.S.) se mohabbat karne walon ke liye ek mukammal Islamic audio app.
            </p>
            
            <StoreLinks />
            
            <ul className={styles.heroPoints}>
              <li>
                <span className={styles.tick}><Check size={11} strokeWidth={3} /></span>
                Free forever
              </li>
              <li>
                <span className={styles.tick}><Check size={11} strokeWidth={3} /></span>
                No subscription
              </li>
              <li>
                <span className={styles.tick}><Check size={11} strokeWidth={3} /></span>
                Android &amp; iOS
              </li>
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroVisualGlow} aria-hidden="true" />
            <Image
              src="/karbala-connect/hand-phone.webp"
              alt="A hand holding the Karbala Connect app"
              width={794}
              height={964}
              priority
              sizes="(max-width: 880px) 85vw, 500px"
              className={styles.heroImg}
            />
          </div>
        </div>

        <a className={styles.scrollCue} href="#listen" aria-label="Explore app features">
          <span>Explore the app</span>
          <ArrowDown size={14} />
        </a>
      </section>

      <section className={styles.categoryBand} aria-label="Audio categories">
        <div className={styles.categoryIntro}>
          <span>One place for</span>
          <strong>meaningful listening</strong>
        </div>
        <div className={styles.categoryPills}>
          {categories.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <KarbalaFeatureShowcase />

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingLogo}>
          <Image src="/karbala-connect-logo.webp" alt="Karbala Connect logo" fill sizes="72px" />
        </div>
        <div className={styles.closingCopy}>
          <span className={styles.sectionEyebrow}>
            <span>✦</span> Carry it with you
          </span>
          <h2 id="closing-title">
            Make room for <em>what matters.</em>
          </h2>
          <p>Get Karbala Connect on your phone and explore a growing collection of Islamic audio.</p>
        </div>
        <StoreLinks />
        <Link
          href="https://karbalaconnect.in/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.siteLink}
        >
          Visit Karbala Connect <ArrowRight size={16} />
        </Link>
      </section>
      <p className={styles.rightsNote}>
        Karbala Connect content is shared with permission from its creators. App features and availability may vary by release.
      </p>
    </main>
  );
}
