import Link from "next/link";
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
            <p className="text-lg font-medium tracking-tight text-foreground">{SITE_NAME}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted/50">
              {SITE_DESCRIPTION}
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted/40 transition-colors duration-300 hover:text-gold-light"
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

        <div className="mt-14 flex items-center justify-between border-t border-border/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted/25">
            Built with reverence
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted/25">
            Content for reflection and growth
          </p>
        </div>
      </div>
    </footer>
  );
}
