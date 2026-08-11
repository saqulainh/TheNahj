"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, Download, Image as ImageIcon } from "lucide-react";
import type { Wisdom } from "@/lib/types";
import { SITE_NAME } from "@/lib/brand";

interface ShareableWisdomCardProps {
  wisdom: Wisdom;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "gold", name: "Calligraphy Gold", bg: "from-[#1a1510] via-[#0f0d0a] to-[#1a1510]", text: "text-gold" },
  { id: "night", name: "Mosque Night", bg: "from-[#0a1128] via-[#010b19] to-[#0a1128]", text: "text-blue-300" },
  { id: "minimal", name: "Minimal White", bg: "from-[#f5f5f0] via-[#ffffff] to-[#f5f5f0]", text: "text-stone-800" },
  { id: "desert", name: "Desert Sunset", bg: "from-[#2b1704] via-[#1a0a00] to-[#2b1704]", text: "text-orange-300" },
];

export function ShareableWisdomCard({ wisdom, isOpen, onClose }: ShareableWisdomCardProps) {
  const [theme, setTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyShareText = () => {
    const text = `"${wisdom.english_translation}"\n\n— ${wisdom.source}\n\nRead more at TheNahj: https://thenahj.live/wisdom/${wisdom.slug}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    const text = `"${wisdom.english_translation}"\n\n— ${wisdom.source}`;
    const url = `https://thenahj.live/wisdom/${wisdom.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: SITE_NAME, text, url });
      } catch (e) {
        console.error("Error sharing:", e);
      }
    } else {
      handleCopyShareText();
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Dynamically import html2canvas to avoid SSR issues and avoid breaking if not installed
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `thenahj-wisdom-${wisdom.slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image. Please run: npm install html2canvas", error);
      alert("Failed to generate image. Ensure html2canvas is installed.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-6"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Share2 size={18} className="text-gold" /> Share Wisdom
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* The Shareable Card (Preview) */}
            <div 
              ref={cardRef}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} p-8 md:p-10 shadow-2xl border border-white/10`}
            >
              {/* Decorative Pattern Layer */}
              <div 
                className={`absolute inset-0 opacity-[0.03] ${theme.id === 'minimal' ? 'invert' : ''}`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C7A654' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
              />

              <div className="relative flex flex-col items-center text-center space-y-6">
                {/* Brand / Category */}
                <div className="flex items-center gap-2">
                  <span className={`h-px w-8 ${theme.id === 'minimal' ? 'bg-black/20' : 'bg-white/20'}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${theme.text}`}>
                    {wisdom.category?.name || "TheNahj"}
                  </span>
                  <span className={`h-px w-8 ${theme.id === 'minimal' ? 'bg-black/20' : 'bg-white/20'}`} />
                </div>

                {/* Arabic Text */}
                <h4 
                  className={`text-3xl md:text-4xl font-arabic leading-relaxed ${theme.id === 'minimal' ? 'text-black' : 'text-white'}`}
                  dir="rtl"
                >
                  {wisdom.arabic_text}
                </h4>

                {/* English Translation */}
                <p className={`text-sm md:text-base font-medium leading-relaxed max-w-sm ${theme.id === 'minimal' ? 'text-stone-600' : 'text-white/80'}`}>
                  &quot;{wisdom.english_translation}&quot;
                </p>

                {/* Source */}
                <p className={`text-xs uppercase tracking-widest font-semibold pt-2 ${theme.text}`}>
                  — {wisdom.source}
                </p>

                {/* Footer Logo/Link */}
                <div className={`mt-8 pt-6 border-t w-full flex justify-between items-center ${theme.id === 'minimal' ? 'border-black/10 text-stone-500' : 'border-white/10 text-white/40'} text-[10px] tracking-wider`}>
                  <span>TheNahj.live</span>
                  <span>Wisdom of Imam Ali (AS)</span>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="flex gap-2 justify-center">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    theme.id === t.id ? "border-gold scale-110" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                  title={t.name}
                >
                  <div className={`h-full w-full rounded-full bg-gradient-to-br ${t.bg}`} />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={handleCopyShareText}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Download size={16} /> Save Image
              </button>

              <button
                onClick={handleNativeShare}
                className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-xs font-bold text-black transition-colors hover:bg-gold-light"
              >
                <Share2 size={16} /> Share Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
