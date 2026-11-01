"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Instagram, Twitter, Youtube } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";

const defaultExploreLinks = [
  { href: "/nahjul-balagha", label: "Nahjul Balagha" },
  { href: "/wisdom", label: "Imam Ali Says" },
  { href: "/daily", label: "Daily Wisdom" },
  { href: "/karbala-connect", label: "Karbala Connect App" },
  { href: "/audio", label: "Audio Reflections" },
  { href: "/situation-search", label: "Situation Search" },
];

const defaultResourceLinks = [
  { href: "/student", label: "Student Corner" },
  { href: "/youth", label: "Youth Corner" },
  { href: "/digital-diseases", label: "Digital Diseases" },
  { href: "/saved", label: "Saved & Bookmarks" },
  { href: "/about", label: "About Mission" },
  { href: "/contact", label: "Contact Us" },
];

interface FooterProps {
  socialLinks?: {
    instagram?: string;
    telegram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
  };
  links?: Array<{ label: string; href: string }>;
}

export function Footer({ socialLinks, links }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const instagramHref =
    socialLinks?.instagram || "https://www.instagram.com/s_a_q_l_a_i_n__h?igsh=dGtvNmNodHJqNml3";
  const twitterHref = socialLinks?.twitter || "https://twitter.com";
  const youtubeHref = socialLinks?.youtube || "https://youtube.com";

  return (
    <footer className="relative w-full bg-[#faf7ef] pt-8 sm:pt-14">
      <div className="w-full max-w-[1260px] mx-auto px-3 sm:px-6">
        {/* Dark Luxury Rounded Container matching Imam & Science */}
        <div className="relative rounded-t-[32px] sm:rounded-t-[40px] bg-[#0c100e] text-[#e8ebe8] border border-white/10 border-b-0 px-6 sm:px-10 lg:px-14 pt-12 pb-10 shadow-[0_-15px_40px_rgba(0,0,0,0.18)]">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-10">
            {/* Column 1: Brand & Identity (5 cols on md+) */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative h-11 w-11 rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#141b16] shadow-md shrink-0">
                  <Image
                    src="/thenahj-logo.jpeg"
                    alt={SITE_NAME}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-xl font-serif font-bold tracking-tight text-white block">
                    {SITE_NAME}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400/90 tracking-wide block">
                    for seekers &amp; youth
                  </span>
                </div>
              </div>

              <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-[#9caaa0]">
                Teachings of the Prophet ﷺ and his Ahlulbayt (AS) from Nahjul Balagha, read alongside modern science and youth reflections. Free to read, easy to share.
              </p>

              {/* Minimal Dark Rounded Social Buttons */}
              <div className="flex items-center gap-2.5 mt-5">
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={youtubeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200"
                >
                  <Youtube size={16} />
                </a>
                <a
                  href={twitterHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200"
                >
                  <Twitter size={15} />
                </a>
              </div>
            </div>

            {/* Column 2: EXPLORE (3 cols on md+) */}
            <div className="md:col-span-3 lg:col-span-3">
              <span className="block text-[11px] font-bold tracking-[0.14em] text-white uppercase mb-4">
                EXPLORE
              </span>
              <ul className="space-y-2.5">
                {defaultExploreLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-[#9caaa0] hover:text-[#17c96b] transition-colors duration-200 block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: THENAHJ / RESOURCES (4 cols on lg+) */}
            <div className="md:col-span-3 lg:col-span-4">
              <span className="block text-[11px] font-bold tracking-[0.14em] text-white uppercase mb-4">
                THENAHJ
              </span>
              <ul className="space-y-2.5">
                {defaultResourceLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-[#9caaa0] hover:text-[#17c96b] transition-colors duration-200 block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ornamental Divider with Center Star */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-white/[0.08]" />
            <div className="absolute px-3 bg-[#0c100e] text-emerald-400/70 text-xs">
              ✦
            </div>
          </div>

          {/* Sub-Footer: Copyright, Ethics & Scroll-to-Top */}
          <div className="pt-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl text-[11px] leading-relaxed text-[#7a8c80]">
              <p className="font-medium text-[#c4d1c8]">
                © 2021–2026 {SITE_NAME} · Spread Wisdom · Please remember our whole team in your prayers. Developed &amp; Maintained by{" "}
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-emerald-400 font-semibold underline underline-offset-2 transition-colors"
                >
                  s_a_q_l_a_i_n__h
                </a>
                .
              </p>
              <p>
                All research, analysis, and collections on this website are created by our team out of reverence. We do not claim ownership of historical texts, translations, quotes, or materials taken from external sources unless clearly mentioned. Everything is shared solely for educational, spiritual, and non-commercial purposes. We do not earn any money from this content.
              </p>
              <p>
                If any copyright holder wants any content removed or changed, please{" "}
                <Link href="/contact" className="underline underline-offset-2 text-white/90 hover:text-emerald-400 transition-colors">
                  contact us
                </Link>{" "}
                and we will respond quickly.
              </p>
            </div>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="w-11 h-11 rounded-full bg-white text-[#0c100e] flex items-center justify-center shadow-lg hover:bg-emerald-400 hover:text-black hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 self-end md:self-auto cursor-pointer"
              title="Back to top"
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
