"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    title: string;
    text: string;
    url: string;
    audioSrc?: string;
    coverImage?: string;
  };
}

export function ShareDrawer({ isOpen, onClose, shareData }: ShareDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedText = encodeURIComponent(shareData.text);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      ),
      color: "bg-[#25D366]",
      href: `https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`,
    },
    {
      name: "X (Twitter)",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "bg-black border border-white/20",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "bg-[#1877F2]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: "bg-[#0088cc]",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    }
  ];

  const handleCopyLink = async () => {
    try {
      const fullText = `${shareData.text}\n\n${shareData.url}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareObj: any = {
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        };

        // Attempt to fetch cover image and share it natively
        if (shareData.coverImage && typeof navigator.canShare === 'function') {
          try {
            const response = await fetch(shareData.coverImage);
            const blob = await response.blob();
            const ext = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `cover.${ext}`, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              shareObj.files = [file];
            }
          } catch (e) {
            console.warn("Could not fetch image for native share", e);
          }
        }

        await navigator.share(shareObj);
        onClose();
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          toast.error("Could not share");
        }
      }
    }
  };

  const handleDownload = () => {
    if (!shareData.audioSrc) return;
    const a = document.createElement("a");
    a.href = shareData.audioSrc;
    a.download = `${shareData.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started!");
    setTimeout(onClose, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] rounded-t-3xl border border-border/30 bg-surface px-6 pb-8 pt-4 shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:px-8 md:w-full md:max-w-md"
            style={{ 
              // Custom mobile drawer drag affordance would go here if needed, but for now it's static popover/drawer
              transform: "translate3d(0,0,0)" 
            }}
          >
            {/* Drawer Drag Handle (Mobile) */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border/50 md:hidden" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gold-light">Share</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview of what's being shared */}
            <div className="mb-6 rounded-xl border border-border/30 bg-surface-elevated/50 p-4">
              <p className="line-clamp-2 text-sm font-medium text-foreground">{shareData.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">Listen now on TheNahj ??</p>
            </div>

            {/* Share Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(onClose, 500)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${link.color} shadow-lg transition-transform group-hover:scale-105 active:scale-95`}>
                    {link.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center line-clamp-1">
                    {link.name}
                  </span>
                </a>
              ))}
              
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border/50 text-foreground shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                  {copied ? <Check size={24} className="text-green-500" /> : <Link2 size={24} />}
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>

              {shareData.audioSrc && (
                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border/50 text-foreground shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center">
                    Download
                  </span>
                </button>
              )}
              
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border/50 text-foreground shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                    <Share2 size={24} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center">
                    Share more apps
                  </span>
                </button>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
