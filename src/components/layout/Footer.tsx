import Link from "next/link";
import Image from "next/image";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/brand";
import { SocialLinks } from "@/components/ui/social-links";

const footerLinks = [
  { href: "/wisdom", label: "Imam Ali Says" },
  { href: "/nahjul-balagha", label: "Nahjul Balagha" },
  { href: "/audio", label: "Audio Reflections" },
  { href: "/saved", label: "Saved" },
  { href: "/digital-diseases", label: "Digital Diseases" },
  { href: "/before-you-text", label: "Before You Text" },
  { href: "/about", label: "About" },
  { href: "/disclaimer", label: "Privacy & Disclaimer" },
  { href: "/contact", label: "Contact" },
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

export function Footer({ socialLinks, links = footerLinks }: FooterProps) {
  return (
    <footer className="relative border-t border-border/20">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <div className="relative h-12 w-36 mb-4">
              <Image 
                src="/TheNahj Logo.jpeg" 
                alt={SITE_NAME} 
                fill 
                className="object-contain rounded-xl overflow-hidden" 
              />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted/80">
              {SITE_DESCRIPTION}
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted/80 transition-colors duration-300 hover:text-gold-light"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {socialLinks && (
          <div className="mt-8 flex justify-center md:justify-start">
            <SocialLinks 
              facebookUrl={socialLinks.facebook} 
              twitterUrl={socialLinks.twitter} 
              instagramUrl={socialLinks.instagram} 
            />
          </div>
        )}

        <div className="mt-14 border-t border-border/10 pt-8 flex flex-col gap-6 text-muted/60">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
            <p className="text-xs font-medium tracking-wide text-foreground/80">
              © 2026 TheNahj | Spread Teachings. Developed by{" "}
              <a 
                href="http://www.instagram.com/s_a_q_u_l_a_i_n__h?igsh=dGtvNmNodHJqNml3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-light font-semibold hover:text-gold transition-colors duration-300 underline underline-offset-4"
              >
                s_a_q_u_l_a_i_n__h
              </a>
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted/50">
              Built with reverence
            </p>
          </div>
          <div className="flex flex-col gap-3 max-w-4xl text-[11px] leading-relaxed font-light text-muted/70">
            <p>
              This is a non-commercial platform built out of reverence. Read our{" "}
              <Link href="/disclaimer" className="underline underline-offset-2 hover:text-gold transition-colors">
                Privacy Policy & Disclaimer
              </Link>{" "}
              regarding data sources and copyright.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
