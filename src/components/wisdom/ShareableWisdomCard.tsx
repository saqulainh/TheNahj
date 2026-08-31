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

const ASPECT_RATIOS = [
  { id: "story", name: "Story (9:16)", class: "w-[340px] min-h-[560px] justify-between" },
  { id: "square", name: "Square (1:1)", class: "w-[360px] min-h-[360px] justify-between" },
  { id: "banner", name: "Banner (16:9)", class: "w-[460px] min-h-[260px] justify-between" },
];

export function ShareableWisdomCard({ wisdom, isOpen, onClose }: ShareableWisdomCardProps) {
  const [theme, setTheme] = useState(THEMES[0]);
  const [aspect, setAspect] = useState(ASPECT_RATIOS[0]);
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  
  // Advanced Features State
  const [showArabic, setShowArabic] = useState(!!wisdom.arabic_text);
  const [showEnglish, setShowEnglish] = useState(!!wisdom.english_translation);
  const [showUrdu, setShowUrdu] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [fontSize, setFontSize] = useState(100);

  const cardRef = useRef<HTMLDivElement>(null);
  const wisdomUrl = `https://thenahj.live/wisdom/${wisdom.slug}`;
  
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
    const text = `"${wisdom.english_translation}"\n\n— ${wisdom.source}\n\nRead more at TheNahj: ${wisdomUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    const text = `"${wisdom.english_translation}"\n\n— ${wisdom.source}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const shareObj: any = { title: SITE_NAME, text, url: wisdomUrl };
        
        // Generate image if possible and attach it
        if (cardRef.current && typeof navigator.canShare === "function") {
          try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
            if (blob) {
              const file = new File([blob], `thenahj-wisdom-${wisdom.slug}.png`, { type: "image/png" });
              if (navigator.canShare({ files: [file] })) {
                shareObj.files = [file];
              }
            }
          } catch (err) {
            console.warn("Could not generate image for native share", err);
          }
        }
        
        await navigator.share(shareObj);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Error sharing:", e);
        }
      }
    } else {
      handleCopyShareText();
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
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

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
          } catch (e) {
            alert("Could not copy image to clipboard. Try downloading instead.");
          }
        }
      });
    } catch (error) {
      console.error("Failed to copy image", error);
    }
  };

  const encodedText = encodeURIComponent(`"${wisdom.english_translation}"\n\n— ${wisdom.source}`);
  const encodedUrl = encodeURIComponent(wisdomUrl);

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      ),
      color: "bg-[#25D366]",
      href: `https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`,
    },
    {
      name: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "bg-black border border-white/20",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: "bg-[#0088cc]",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.90, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.90, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-6 my-auto origin-top"
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

            {/* Advanced Controls */}
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
              
              {/* Aspect Ratio & Theme */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspect(ratio)}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${
                        aspect.id === ratio.id ? "bg-gold text-black shadow-md" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {ratio.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        theme.id === t.id ? "border-gold scale-110" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                      title={t.name}
                    >
                      <div className={`h-full w-full rounded-full bg-gradient-to-br ${t.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-white/10 my-2" />

              {/* Toggles */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-between text-white/80">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white/60">Languages:</span>
                  {wisdom.arabic_text && (
                    <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={showArabic} onChange={(e) => setShowArabic(e.target.checked)} className="accent-gold rounded" />
                      Arabic
                    </label>
                  )}
                  {wisdom.english_translation && (
                    <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} className="accent-gold rounded" />
                      English
                    </label>
                  )}
                  {wisdom.urdu_translation && (
                    <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={showUrdu} onChange={(e) => setShowUrdu(e.target.checked)} className="accent-gold rounded" />
                      Urdu
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showWatermark} onChange={(e) => setShowWatermark(e.target.checked)} className="accent-gold rounded" />
                    Watermark
                  </label>
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-semibold text-white/60">Font Size:</span>
                <input 
                  type="range" min="70" max="150" value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="w-8 text-right tabular-nums">{fontSize}%</span>
              </div>
            </div>

            {/* The Shareable Card (Preview) */}
            <div className="flex justify-center overflow-x-auto py-2 scale-[0.85] sm:scale-100 origin-top">
              <div 
                ref={cardRef}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} p-8 shadow-2xl border border-white/10 flex flex-col ${aspect.class}`}
              >
                {/* Decorative Pattern Layer */}
                <div 
                  className={`absolute inset-0 opacity-[0.03] ${theme.id === 'minimal' ? 'invert' : ''}`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C7A654' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />

                <div 
                  className="relative flex flex-col items-center text-center space-y-4 my-auto w-full transition-all"
                  style={{ transform: `scale(${fontSize / 100})`, transformOrigin: 'center' }}
                >
                  {/* Brand / Category */}
                  <div className="flex items-center gap-2">
                    <span className={`h-px w-6 ${theme.id === 'minimal' ? 'bg-black/20' : 'bg-white/20'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${theme.text}`}>
                      {wisdom.category?.name || "TheNahj"}
                    </span>
                    <span className={`h-px w-6 ${theme.id === 'minimal' ? 'bg-black/20' : 'bg-white/20'}`} />
                  </div>

                  {/* Arabic Text */}
                  {showArabic && wisdom.arabic_text && (
                    <h4 
                      className={`font-arabic leading-relaxed ${
                        aspect.id === 'banner' ? 'text-xl' : 'text-2xl md:text-3xl'
                      } ${theme.id === 'minimal' ? 'text-black' : 'text-white'}`}
                      dir="rtl"
                    >
                      {wisdom.arabic_text}
                    </h4>
                  )}

                  {/* Urdu Translation */}
                  {showUrdu && wisdom.urdu_translation && (
                    <p className={`text-sm md:text-base font-urdu leading-relaxed max-w-xs ${theme.id === 'minimal' ? 'text-stone-700' : 'text-white/90'}`} dir="rtl">
                      &quot;{wisdom.urdu_translation}&quot;
                    </p>
                  )}

                  {/* English Translation */}
                  {showEnglish && wisdom.english_translation && (
                    <p className={`text-xs md:text-sm font-medium leading-relaxed max-w-xs ${theme.id === 'minimal' ? 'text-stone-600' : 'text-white/80'}`}>
                      &quot;{wisdom.english_translation}&quot;
                    </p>
                  )}

                  {/* Source */}
                  <p className={`text-[10px] uppercase tracking-widest font-semibold pt-1 ${theme.text}`}>
                    — {wisdom.source}
                  </p>
                </div>

                {/* Footer Logo/Link */}
                {showWatermark && (
                  <div className={`mt-6 pt-4 border-t w-full flex justify-between items-end ${theme.id === 'minimal' ? 'border-black/10 text-stone-500' : 'border-white/10 text-white/40'} text-[9px] tracking-wider font-medium`}>
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-xs font-bold text-gold">TheNahj.live</span>
                      <span>Imam Ali (AS) Wisdom</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-4 md:flex justify-center gap-3">
              {/* Quick Socials */}
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${link.color}`}
                  title={`Share on ${link.name}`}
                >
                  {link.icon}
                </a>
              ))}

              <button
                onClick={handleCopyShareText}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition-transform hover:scale-105 hover:bg-white/20 active:scale-95"
                title="Copy Text"
              >
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>

              <div className="w-px h-12 bg-white/20 mx-1 hidden md:block" />

              <button
                onClick={handleCopyImage}
                className="col-span-2 md:col-span-1 flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                {copiedImage ? <Check size={16} className="text-green-400" /> : <ImageIcon size={16} />}
                {copiedImage ? "Copied!" : "Copy Image"}
              </button>
              
              <button
                onClick={handleDownload}
                className="col-span-2 md:col-span-1 flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Download size={16} /> Save Image
              </button>

              <button
                onClick={handleNativeShare}
                className="col-span-4 md:col-span-2 flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-xs font-bold text-black transition-colors hover:bg-gold-light"
              >
                <Share2 size={16} /> Share (More Apps)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
