"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Loader2, Sparkles } from "lucide-react";

export function AITranslatedText({ text, className = "" }: { text: string; className?: string }) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === "en" || !text) {
      setTranslatedText(null);
      return;
    }

    // Check cache
    const cacheKey = `translation_${language}_${btoa(encodeURIComponent(text.substring(0, 50)))}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    const translate = async () => {
      setIsLoading(true);
      try {
        const langName = language === "ar" ? "Arabic" : "Urdu";
        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLanguage: langName }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.translation) {
            setTranslatedText(data.translation);
            localStorage.setItem(cacheKey, data.translation);
          }
        }
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [language, text]);

  if (language === "en") {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative ${className} ${language === "ar" || language === "ur" ? "font-arabic" : ""}`}>
      {isLoading ? (
        <span className="inline-flex items-center gap-2 text-muted animate-pulse">
          <Loader2 size={12} className="animate-spin text-gold" /> AI Translating...
        </span>
      ) : (
        <>
          {translatedText || text}
          <span title="AI Translated"><Sparkles size={10} className="inline ml-1 text-gold/40" /></span>
        </>
      )}
    </span>
  );
}
