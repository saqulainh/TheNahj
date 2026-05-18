"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("thenahj-theme");
    const next = stored === "light" || stored === "dark" ? stored : getSystemTheme();
    setTheme(next);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("thenahj-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/35 bg-surface/70 text-muted transition-all duration-300 hover:border-gold/40 hover:text-foreground"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
