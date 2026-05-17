"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CinematicButton } from "@/components/ui/CinematicButton";

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
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.8)"]
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.05)"]
  );

  const headerBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );

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
    <motion.header
      style={isHome ? {} : {
        backgroundColor: headerBg,
        borderColor: headerBorder,
        backdropFilter: headerBlur,
      }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isHome ? 'flex justify-center pt-8 px-4 md:px-0' : 'border-b'}`}
    >
      <div className={`${isHome ? 'w-full md:w-auto flex items-center justify-between rounded-[2rem] border border-white/5 bg-black/40 px-6 md:px-10 py-4 backdrop-blur-xl' : 'mx-auto flex max-w-7xl items-center justify-between px-6 py-5'}`}>
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
        <nav className={`hidden items-center md:flex ${isHome ? 'gap-6' : 'gap-6'}`}>
          {links && links.map((link) => (
            link.href === "/focus" ? (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <CinematicButton text={link.label} />
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`uppercase tracking-widest transition-all duration-300 hover:text-white ${
                  isHome ? 'text-[10px] text-white/60' : 'text-xs text-muted hover:text-gold-light'
                } ${!isHome && pathname === link.href ? "text-gold" : ""}`}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-muted hover:text-foreground md:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full border-b border-white/5 bg-background/95 p-6 backdrop-blur-xl md:hidden"
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
    </motion.header>
  );
}
