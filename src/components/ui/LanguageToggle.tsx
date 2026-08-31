"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES: { code: Language; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border/20 bg-surface/50 px-3 py-1.5 text-[11px] font-medium text-muted transition-all hover:border-gold/30 hover:text-foreground"
        title="Change Language"
      >
        <Globe size={13} />
        <span className={current.dir === "rtl" ? "font-arabic" : ""}>{current.nativeLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 min-w-[140px] overflow-hidden rounded-xl border border-border/20 bg-surface/95 shadow-xl backdrop-blur-xl z-50"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated ${
                  language === lang.code ? "text-gold font-medium" : "text-foreground"
                }`}
              >
                <span className={`w-full ${lang.dir === "rtl" ? "font-arabic" : ""} text-center`} dir={lang.dir}>
                  {lang.nativeLabel}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
