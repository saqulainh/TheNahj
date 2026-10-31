"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  Search, 
  Sparkles, 
  Brain, 
  GraduationCap, 
  Compass, 
  MessageSquareQuote, 
  Mic, 
  Users 
} from "lucide-react";
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
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setIsExploreOpen(false);
  }, [pathname]);

  // Click outside to close explore dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
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
    if (href === "/wisdom" && pathname.startsWith("/topics")) return true;
    if (href === "/student" && pathname.startsWith("/student/")) return true;
    if (href === "/youth" && pathname.startsWith("/youth/")) return true;
    return false;
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsExploreOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExploreOpen(false);
    }, 150);
  };

  // Structured Core Navigation
  const primaryNav = [
    { href: "/wisdom", label: "Wisdom", key: "nav.imam ali says" },
    { href: "/nahjul-balagha", label: "Nahjul Balagha", key: "nav.nahjul balagha" },
    { href: "/daily", label: "Daily Wisdom", key: "nav.daily wisdom" },
    { href: "/audio", label: "Audio & Duas", key: "nav.audio" },
  ];

  const exploreItems = [
    { 
      href: "/graph", 
      title: "Mind Map", 
      desc: "Interactive knowledge constellation", 
      icon: Brain,
      tag: "Interactive"
    },
    { 
      href: "/student", 
      title: "Student Corner", 
      desc: "Focus, discipline & exam clarity", 
      icon: GraduationCap,
      tag: "Study"
    },
    { 
      href: "/youth", 
      title: "Youth Corner", 
      desc: "Purpose, identity & resilience", 
      icon: Compass,
      tag: "Life"
    },
    { 
      href: "/before-you-text", 
      title: "Before You Text", 
      desc: "5-question mindfulness pause", 
      icon: MessageSquareQuote,
      tag: "Tool"
    },
    { 
      href: "/voice-assistant", 
      title: "Voice AI", 
      desc: "Conversational spiritual advisor", 
      icon: Mic,
      tag: "AI"
    },
    { 
      href: "/community", 
      title: "Community", 
      desc: "Reflections & discussions", 
      icon: Users,
      tag: "Social"
    },
  ];

  const isExploreActive = exploreItems.some((item) => isLinkActive(item.href));

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex justify-center pt-4 md:pt-5 px-3 md:px-4 bg-transparent border-transparent pointer-events-none transition-all duration-300"
    >
      <div
        className={`pointer-events-auto w-full md:w-auto flex items-center justify-between rounded-[2rem] border transition-all duration-300 px-4 md:px-6 py-2 md:py-2.5 backdrop-blur-xl ${
          hasScrolled
            ? "border-border/35 bg-surface/90 shadow-[0_16px_50px_-20px_rgba(0,0,0,0.65)]"
            : "border-border/25 bg-surface/80 shadow-[0_14px_50px_-24px_rgba(0,0,0,0.55)]"
        }`}
      >
        
        {/* Site Brand Logo with generous right margin */}
        <Link 
          href="/" 
          className="group flex shrink-0 items-center gap-2 whitespace-nowrap pl-1 md:pl-2 mr-0 md:mr-6 lg:mr-8"
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
          <span className="text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight text-foreground group-hover:text-gold transition-colors">
            {language === "en" ? siteName : "The Nahj"}
          </span>
        </Link>

        {/* Desktop Navigation — Clean, Uncrowded 4 + 1 Structure */}
        <nav className="hidden items-center lg:flex gap-5 lg:gap-6">
          {primaryNav.map((link) => {
            const active = isLinkActive(link.href);
            const translated = t(link.key);
            const navLabel = (translated && translated !== link.key) ? translated : link.label;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative uppercase tracking-widest text-xs transition-all duration-300 hover:text-foreground ${
                  active ? "text-gold font-semibold" : "text-muted hover:text-gold"
                }`}
              >
                {navLabel}
                {active && (
                  <span className="absolute -bottom-2 left-1/2 h-px w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
                )}
              </Link>
            );
          })}

          {/* Explore Dropdown */}
          <div 
            ref={exploreRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsExploreOpen((prev) => !prev)}
              className={`relative inline-flex items-center gap-1 uppercase tracking-widest text-xs transition-all duration-300 ${
                isExploreActive || isExploreOpen ? "text-gold font-semibold" : "text-muted hover:text-foreground"
              }`}
              aria-expanded={isExploreOpen}
            >
              <span>Explore</span>
              <ChevronDown 
                size={13} 
                className={`transition-transform duration-300 ${isExploreOpen ? "rotate-180 text-gold" : "opacity-70"}`} 
              />
              {isExploreActive && (
                <span className="absolute -bottom-2 left-1/2 h-px w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
              )}
            </button>

            {/* Illuminated Tazhib Dropdown Menu */}
            <AnimatePresence>
              {isExploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 rounded-2xl border border-gold/30 bg-surface/95 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-gold/15 z-50 overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {exploreItems.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsExploreOpen(false)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group ${
                            active 
                              ? "bg-gold/15 border border-gold/30 text-gold-light" 
                              : "hover:bg-surface-elevated text-foreground/90 border border-transparent"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            active 
                              ? "bg-gold text-black border-gold" 
                              : "border-border/40 bg-surface-alt/70 text-gold group-hover:border-gold/30 group-hover:bg-gold/15"
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-semibold ${active ? "text-gold" : "text-foreground group-hover:text-gold transition-colors"}`}>
                                {item.title}
                              </p>
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-border/20 text-muted/80">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Search Quick Trigger */}
          <Link
            href="/situation-search"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all border ${
              pathname === "/situation-search"
                ? "bg-gold text-black border-gold shadow-sm font-semibold"
                : "border-gold/30 bg-gold/10 text-gold-light hover:bg-gold/20 hover:border-gold/50"
            }`}
            title="AI Situation Search"
          >
            <Search size={12} className={pathname === "/situation-search" ? "text-black" : "text-gold"} />
            <span className="hidden xl:inline">AI Search</span>
          </Link>

          {/* Focus Timer */}
          <Link
            href="/focus"
            className="no-underline transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            title="Deep Focus Timer"
          >
            <StarBorder speed="5s" thickness={1}>
              Focus
            </StarBorder>
          </Link>
        </nav>

        {/* Right Desktop Utilities */}
        <div className="hidden lg:flex lg:pl-2 items-center gap-2.5">
          <Link
            href="/profile"
            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-gold/30 bg-surface-alt/70 text-gold transition-transform hover:scale-105"
            title="My Profile & Saved Wisdom"
          >
            <User size={16} />
          </Link>
          <StreakBadge />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link
            href="/situation-search"
            className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-transform hover:scale-105"
            title="Search"
          >
            <Search size={15} />
          </Link>
          <Link
            href="/profile"
            className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-surface-alt/70 text-gold transition-transform hover:scale-105"
            title="My Profile"
          >
            <User size={15} />
          </Link>
          <div className="hidden sm:flex items-center shrink-0">
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

      {/* Mobile Navigation Drawer with Structured Categories */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto absolute left-3 right-3 top-full mt-2 rounded-2xl border border-border/25 bg-surface/95 p-4 sm:p-5 backdrop-blur-xl lg:hidden shadow-2xl max-h-[calc(100vh-6rem)] overflow-y-auto"
        >
          {/* Quick User Utility Row inside Drawer */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border/20">
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-gold transition-colors py-1.5 px-3 rounded-xl bg-surface-alt/70 border border-border/25"
            >
              <User size={14} className="text-gold" />
              <span>My Profile & Saved</span>
            </Link>
            <LanguageToggle />
          </div>

          <div className="space-y-4">
            {/* Core Section */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-muted mb-2 px-1">Sacred Wisdom</p>
              <nav className="flex flex-col gap-2">
                {primaryNav.map((link) => {
                  const active = isLinkActive(link.href);
                  const translated = t(link.key);
                  const navLabel = (translated && translated !== link.key) ? translated : link.label;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                        active ? "bg-gold/15 text-gold font-semibold" : "text-muted hover:bg-surface-elevated hover:text-foreground"
                      }`}
                    >
                      {navLabel}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Tools & Corners Section */}
            <div className="border-t border-border/15 pt-3">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-muted mb-2 px-1">Spiritual Tools & Corners</p>
              <div className="grid grid-cols-1 gap-1.5">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        active ? "bg-gold/15 text-gold font-semibold" : "text-muted hover:bg-surface-elevated hover:text-foreground"
                      }`}
                    >
                      <Icon size={15} className="text-gold" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/focus"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/focus" ? "bg-gold/15 text-gold font-semibold" : "text-muted hover:bg-surface-elevated hover:text-foreground"
                  }`}
                >
                  <Sparkles size={15} className="text-gold" />
                  <span>Deep Focus Timer</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
