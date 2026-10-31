import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import styles from "./page.module.css";
import KarbalaFeatureShowcase from "./KarbalaFeatureShowcase";

export const metadata: Metadata = {
  title: "Karbala Connect — Islamic Audio, Together",
  description: "Explore Nauhe, Duas, Ziyarat, Manqabat, Quran recitation, Ulema and Anjuman discovery in the Karbala Connect app.",
  alternates: { canonical: "/karbala-connect" },
};

const stores = [
  { label: "Get it on Google Play", href: "https://play.google.com/store/apps/details?id=in.karbalaconnect.app", image: "/google-play-badge.png" },
  { label: "Download on the App Store", href: "https://apps.apple.com/in/app/karbala-connect/id6781759110", image: "/app-store-badge.svg" },
];

const categories = ["Nauhe & Marsiye", "Duas & Ziyarat", "Manqabat", "Masaib", "Majlis", "Quran", "Podcasts", "Ulema"];

function StoreLinks({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`${styles.storeLinks} ${dark ? styles.storeLinksDark : ""}`}>
      {stores.map((store) => (
        <Link key={store.label} href={store.href} target="_blank" rel="noopener noreferrer" aria-label={store.label} className={styles.storeBadge}>
          <Image src={store.image} alt={store.label} width={190} height={64} />
        </Link>
      ))}
    </div>
  );
}

export default function KarbalaConnectPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="kc-hero-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span /> A free Islamic audio app</div>
            <h1 id="kc-hero-title">Karbala <em>Connect.</em></h1>
            <p className={styles.heroTagline}>The voices of Karbala, close at hand.</p>
            <p className={styles.heroLead}>Nauhe, duas, ziyarat, Quran and respected ulema—together in one beautifully organised app.</p>
            <p className={styles.heroUrdu} lang="hi">Ahle Bayt (A.S.) se mohabbat karne walon ke liye ek mukammal Islamic audio app.</p>
            <StoreLinks />
            <div className={styles.heroFacts}>
              <span><i /> Free forever</span><span><i /> No subscription</span><span><i /> Android &amp; iOS</span>
            </div>
          </div>

          <div className={styles.heroArtwork}>
            <div className={styles.heroHalo} aria-hidden="true" />
            <div className={styles.heroHandScene}>
              <Image src="/karbala-connect/hand-phone.png" alt="A hand holding the Karbala Connect app" fill priority sizes="(max-width: 680px) 90vw, 44vw" className={styles.handPhoneArt} />
              <div className={styles.phoneUi}>
                <Image src="/karbala-connect/home.webp" alt="Karbala Connect home screen, showing the app logo, featured audio and categories" fill priority sizes="(max-width: 680px) 45vw, 20vw" />
                <span className={styles.phoneNotch} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
        <a className={styles.scrollCue} href="#listen" aria-label="Explore app features"><span>Explore the app</span><ArrowDown size={15} /></a>
      </section>

      <section className={styles.categoryBand} aria-label="Audio categories">
        <div className={styles.categoryIntro}><span>One place for</span><strong>meaningful listening</strong></div>
        <div className={styles.categoryPills}>{categories.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <KarbalaFeatureShowcase />

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingLogo}><Image src="/karbala-connect-logo.webp" alt="Karbala Connect logo" fill sizes="72px" /></div>
        <div className={styles.closingCopy}>
          <span className={styles.sectionEyebrow}><span>✦</span> Carry it with you</span>
          <h2 id="closing-title">Make room for <em>what matters.</em></h2>
          <p>Get Karbala Connect on your phone and explore a growing collection of Islamic audio.</p>
        </div>
        <StoreLinks dark />
        <Link href="https://karbalaconnect.in/" target="_blank" rel="noopener noreferrer" className={styles.siteLink}>Visit Karbala Connect <ArrowRight size={16} /></Link>
      </section>
      <p className={styles.rightsNote}>Karbala Connect content is shared with permission from its creators. App features and availability may vary by release.</p>
    </main>
  );
}
