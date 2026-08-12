"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export type Language = "en" | "ar" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

// ─── Translation Map ────────────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.imam ali says": "Imam Ali Says",
    "nav.student corner": "Student Corner",
    "nav.youth corner": "Youth Corner",
    "nav.nahjul balagha": "Nahjul Balagha",
    "nav.ai search": "AI Search",
    "nav.community": "Community",
    "nav.voice ai": "Voice AI",
    "nav.mind map": "Mind Map",
    "nav.audio": "Audio",
    "nav.focus timer": "Focus Timer",
    "nav.saved": "Saved",
    "nav.search": "Search",
    "nav.focus": "Focus",
    "home.hero.label": "The Path of Knowledge",
    "home.hero.heading": "Wisdom of Imam Ali (AS)",
    "home.hero.subheading": "Rediscover the timeless teachings of Ahlulbayt for modern challenges.",
    "wisdom.readMore": "Read full →",
    "wisdom.share": "Share",
    "wisdom.save": "Save",
    "streak.current": "Current Streak",
    "streak.best": "Best Streak",
    "streak.total": "Total Days",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.imam ali says": "أقوال الإمام علي",
    "nav.student corner": "ركن الطالب",
    "nav.youth corner": "ركن الشباب",
    "nav.nahjul balagha": "نهج البلاغة",
    "nav.ai search": "بحث الذكاء الاصطناعي",
    "nav.community": "المجتمع",
    "nav.voice ai": "الذكاء الصوتي",
    "nav.mind map": "خريطة الذهن",
    "nav.audio": "الصوتيات",
    "nav.focus timer": "مؤقت التركيز",
    "nav.saved": "المحفوظة",
    "nav.search": "بحث",
    "nav.focus": "تركيز",
    "home.hero.label": "طريق المعرفة",
    "home.hero.heading": "حكمة الإمام علي (ع)",
    "home.hero.subheading": "اكتشف من جديد التعاليم الخالدة لآل البيت للتحديات المعاصرة.",
    "wisdom.readMore": "اقرأ المزيد →",
    "wisdom.share": "مشاركة",
    "wisdom.save": "حفظ",
    "streak.current": "السلسلة الحالية",
    "streak.best": "أفضل سلسلة",
    "streak.total": "إجمالي الأيام",
  },
  ur: {
    "nav.home": "ہوم",
    "nav.imam ali says": "اقوالِ امام علی",
    "nav.student corner": "طالب علم کا کونہ",
    "nav.youth corner": "نوجوانوں کا کونہ",
    "nav.nahjul balagha": "نہج البلاغہ",
    "nav.ai search": "اے آئی سرچ",
    "nav.community": "کمیونٹی",
    "nav.voice ai": "وائس اے آئی",
    "nav.mind map": "مائنڈ میپ",
    "nav.audio": "آڈیو",
    "nav.focus timer": "فوکس ٹائمر",
    "nav.saved": "محفوظ",
    "nav.search": "تلاش",
    "nav.focus": "توجہ",
    "home.hero.label": "علم کی راہ",
    "home.hero.heading": "امام علی (ع) کی حکمت",
    "home.hero.subheading": "جدید چیلنجوں کے لیے اہلبیت کی لازوال تعلیمات کو دوبارہ دریافت کریں۔",
    "wisdom.readMore": "مکمل پڑھیں →",
    "wisdom.share": "شیئر کریں",
    "wisdom.save": "محفوظ کریں",
    "streak.current": "موجودہ سلسلہ",
    "streak.best": "بہترین سلسلہ",
    "streak.total": "کل دن",
  },
};

// ─── Context ────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const pathname = usePathname();

  const triggerGoogleTranslate = useCallback((lang: Language) => {
    const targetLang = lang === "en" ? "" : lang;
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event("change"));
    }
  }, []);

  // On Explicit Language Change from Toggle
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("thenahj-lang", lang);
    document.documentElement.lang = lang;
    
    const targetLang = lang === "en" ? "" : lang;
    const cookieVal = targetLang ? `/en/${targetLang}` : "";
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
    
    // Hard reload on explicit language switch to ensure 100% full DOM translation instantly
    window.location.reload();
  }, []);

  // On Client-Side Route Change (Next.js Link navigation)
  useEffect(() => {
    if (language !== "en") {
      triggerGoogleTranslate(language);
      setTimeout(() => triggerGoogleTranslate(language), 500);
      setTimeout(() => triggerGoogleTranslate(language), 1500);
    }
  }, [pathname, language, triggerGoogleTranslate]);

  useEffect(() => {
    // Load stored language preference
    const stored = localStorage.getItem("thenahj-lang") as Language | null;
    const initialLang = (stored && ["en", "ar", "ur"].includes(stored)) ? stored : "en";
    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    // Removed RTL dir flipping as per user request to keep layout normal

    // Inject Google Translate script dynamically
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,ar,ur",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };
    }
  }, []);


  const t = useCallback(
    (key: string) => translations[language][key] ?? translations["en"][key] ?? key,
    [language]
  );

  const dir: "ltr" | "rtl" = "ltr"; // Forced LTR layout as requested by user

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div id="google_translate_element" style={{ display: "none" }} />
      {children}
    </LanguageContext.Provider>
  );
}
