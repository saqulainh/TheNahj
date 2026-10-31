"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, User } from "lucide-react";
import { StarBorder } from "@/components/ui/StarBorder";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface HeaderProps {
  siteName?: string;
  links?: Array<{ label: string; href: string }>;
}

export function Header({ 
  siteName = "TheNahj", 
  links = [] 
}: HeaderProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Only run on client mount
      import("@/lib/wisdom").then((mod) => {
        mod.syncSavedSlugs().catch(console.error);
      });
  }, []);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  const isHome = pathname === "/";

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (pathname === href || pathname.startsWith(`${href}/`)) return true;

    // Keep navigation context visible on nested topic routes.
    if (href === "/wisdom" && pathname.startsWith("/topics")) return true;
    if (href === "/student" && pathname.startsWith("/student/")) return true;
    if (href === "/youth" && pathname.startsWith("/youth/")) return true;

    return false;
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isHome 
          ? 'flex justify-center pt-6 px-4 md:px-0 bg-transparent border-transparent' 
          : `border-b backdrop-blur-md ${
              hasScrolled 
                ? 'bg-surface/85 border-border/20 shadow-sm' 
                : 'bg-background/20 border-transparent'
            }`
      }`}
    >
      <div className={`${isHome ? 'w-full md:w-auto flex items-center justify-between rounded-[2rem] border border-border/25 bg-surface/65 px-4 md:px-6 py-3.5 md:py-4 backdrop-blur-xl shadow-[0_14px_50px_-24px_rgba(0,0,0,0.55)]' : 'mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-3.5 md:py-4'}`}>
        {/* Site Brand Logo */}
        <Link 
          href="/" 
          className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap pl-1 md:pl-2"
        >
          <div className="relative h-8 w-8 md:h-9 md:w-9 rounded-xl overflow-hidden border border-gold/30 shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0 bg-surface">
            <Image 
              src="/thenahj-logo.jpeg" 
              alt={siteName} 
              fill 
              sizes="36px"
              className="object-cover"
              priority 
            />
          </div>
          <span className="text-base md:text-lg font-serif font-bold tracking-tight text-foreground group-hover:text-gold transition-colors">
            {language === "en" ? siteName : "The Nahj"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`hidden items-center md:flex ${isHome ? 'gap-4' : 'gap-5 lg:gap-6'}`}>
          {links && links.map((link) => (
            link.href === "/focus" ? (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <StarBorder speed="5s" thickness={1}>
                  {link.label}
                </StarBorder>
              </Link>
            ) : (
              (() => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const key = `nav.${link.label.toLowerCase().trim()}`;
                const translated = t(key);
                const navLabel = (translated && translated !== key) ? translated : link.label;
                return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative uppercase tracking-widest transition-all duration-300 hover:text-foreground ${
                  isHome ? 'text-[10px] text-muted/80' : 'text-xs text-muted hover:text-gold'
                } ${active ? "text-gold" : ""}`}
              >
                {navLabel}
                {active && (
                  <span className="absolute -bottom-2 left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
                )}
              </Link>
                );
              })()
            )
          ))}
        </nav>

        <div className="hidden md:flex md:pl-3 items-center gap-3">
          <Link
            href="/profile"
            className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-gold/30 bg-surface-alt/70 text-gold transition-transform hover:scale-105"
            title="My Profile & Saved Wisdom"
          >
            <User size={18} />
          </Link>
          <StreakBadge />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
          <Link
            href="/profile"
            className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-surface-alt/70 text-gold transition-transform hover:scale-105"
            title="My Profile"
          >
            <User size={16} />
          </Link>
          <div className="flex items-center shrink-0">
            <LanguageToggle />
          </div>
          <div className="flex items-center shrink-0">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-surface-alt/80 text-muted hover:text-foreground transition-all active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-3 right-3 top-full mt-2 rounded-2xl border border-border/25 bg-surface/95 p-5 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-5">
            {links && links.map((link) => (
              (() => {
                const active = isLinkActive(link.href);
                const mKey = `nav.${link.label.toLowerCase().trim()}`;
                const mTranslated = t(mKey);
                const mLabel = (mTranslated && mTranslated !== mKey) ? mTranslated : link.label;
                return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                {mLabel}
              </Link>
                );
              })()
            ))}
          </nav>

        </motion.div>
      )}
    </header>
  );
}
