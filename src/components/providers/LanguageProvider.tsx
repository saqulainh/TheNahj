"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
    "nav.wisdom": "Wisdom",
    "nav.student": "Student Corner",
    "nav.youth": "Youth Corner",
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
    "nav.wisdom": "الحكمة",
    "nav.student": "ركن الطالب",
    "nav.youth": "ركن الشباب",
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
    "nav.wisdom": "حکمت",
    "nav.student": "طالب علم کا کونہ",
    "nav.youth": "نوجوانوں کا کونہ",
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

  useEffect(() => {
    const stored = localStorage.getItem("thenahj-lang") as Language | null;
    if (stored && ["en", "ar", "ur"].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("thenahj-lang", lang);
    // Set dir on <html>
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (key: string) => translations[language][key] ?? translations["en"][key] ?? key,
    [language]
  );

  const dir: "ltr" | "rtl" = language === "en" ? "ltr" : "rtl";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}
