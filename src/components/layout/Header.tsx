"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { StarBorder } from "@/components/ui/StarBorder";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface HeaderProps {
  siteName?: string;
  links?: Array<{ label: string; href: string }>;
}

export function Header({ 
  siteName = "TheNahj", 
  links = [] 
}: HeaderProps) {
  const pathname = usePathname();
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
      <div className={`${isHome ? 'w-full md:w-auto flex items-center justify-between rounded-[2rem] border border-border/25 bg-surface/65 px-6 md:px-10 py-4 backdrop-blur-xl shadow-[0_14px_50px_-24px_rgba(0,0,0,0.55)]' : 'mx-auto flex max-w-7xl items-center justify-between px-6 py-5'}`}>
        {/* Site Name (Hidden on Desktop Home) */}
        <Link 
          href="/" 
          className={`group flex items-center gap-2 ${isHome ? 'md:hidden' : ''}`}
        >
          <span className="text-xl font-medium tracking-wide text-foreground">
            {siteName}
          </span>
          <div className="h-1 w-1 rounded-full bg-gold transition-all duration-300 group-hover:scale-[2.5]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className={`hidden items-center md:flex ${isHome ? 'gap-4' : 'gap-6'}`}>
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
              <Link
                key={link.href}
                href={link.href}
                className={`relative uppercase tracking-widest transition-all duration-300 hover:text-foreground ${
                  isHome ? 'text-[10px] text-muted/80' : 'text-xs text-muted hover:text-gold'
                } ${pathname === link.href ? "text-gold" : ""}`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-2 left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
                )}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden md:block md:pl-3">
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full border border-border/25 bg-surface/80 p-2 text-muted hover:text-foreground"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-3 right-3 top-full mt-2 rounded-2xl border border-border/25 bg-surface/95 p-6 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-6">
            {links && links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? "text-gold" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
