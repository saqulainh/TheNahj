import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-elevated": "hsl(var(--surface-elevated) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        gold: {
          DEFAULT: "hsl(var(--gold) / <alpha-value>)",
          muted: "hsl(var(--gold-muted) / <alpha-value>)",
          light: "hsl(var(--gold-light) / <alpha-value>)",
          dim: "hsl(var(--gold-dim) / <alpha-value>)",
        },
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta-sans)", "Satoshi", "General Sans", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        arabic: ["var(--font-amiri)", "serif"],
        urdu: ["var(--font-noto-nastaliq)", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "slide-up": "slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "breathe": "breathe 5s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "slow-zoom": "slowZoom 20s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", filter: "blur(4px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slowZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.04)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
