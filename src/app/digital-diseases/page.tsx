import Link from "next/link";
import { digitalDiseases } from "@/data/mock";
import { Smartphone, ScrollText, Star, UserX, Zap, Brain } from "lucide-react";

export const metadata = {
  title: "Digital Diseases — Islamic Guide to Social Media Addiction & Screen Time",
  description: "Instagram addiction, doomscrolling, dopamine overload, validation hunger — diagnose your digital disease through the wisdom of Imam Ali (AS). Islamic digital wellness for Muslim youth.",
  keywords: [
    "Social media addiction Islam",
    "Instagram addiction Islamic",
    "Doomscrolling Islam",
    "Dopamine detox Islam",
    "Digital wellness Muslim",
    "Screen time Islamic advice",
    "Phone addiction Islamic",
    "Imam Ali on self control",
    "Islamic mental health",
  ],
  openGraph: {
    title: "Digital Diseases — Islamic Cure for Social Media Addiction",
    description: "Diagnose your digital diseases through Imam Ali (AS) wisdom. Instagram addiction, doomscrolling & dopamine detox for Muslim youth.",
    url: "https://thenahj.live/digital-diseases",
    type: "website",
  },
};

const icons: Record<string, React.ReactNode> = {
  "instagram-addiction": <Smartphone size={24} />,
  "doomscrolling": <ScrollText size={24} />,
  "validation-addiction": <Star size={24} />,
  "fake-online-identity": <UserX size={24} />,
  "dopamine-overload": <Zap size={24} />,
  "attention-destruction": <Brain size={24} />,
};

const gradients = [
  "from-red-500/10 via-transparent to-transparent",
  "from-blue-500/10 via-transparent to-transparent",
  "from-amber-500/10 via-transparent to-transparent",
  "from-purple-500/10 via-transparent to-transparent",
  "from-orange-500/10 via-transparent to-transparent",
  "from-cyan-500/10 via-transparent to-transparent",
];

export default function DigitalDiseasesPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
      {/* Hero */}
      <div className="relative mb-16 overflow-hidden rounded-3xl border border-border/60 bg-surface px-8 py-16 text-center md:px-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.06)_0%,_transparent_70%)]" />
        <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">The Modern Epidemic</p>
        <h1 className="mt-4 text-4xl font-medium text-foreground md:text-5xl">
          Digital Diseases
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-muted">
          Name the sickness before it names you. These are the habits stealing your attention,
          your peace, and your potential — diagnosed through the lens of Imam Ali (AS).
        </p>
        <div className="mt-8 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Disease Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {digitalDiseases.map((d, i) => (
          <Link
            key={d.slug}
            href={d.href}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-8 transition-all duration-300 hover:border-gold/30 hover:bg-surface-elevated"
          >
            {/* Subtle gradient accent */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                  {icons[d.slug] ?? <Zap size={24} />}
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h2 className="mt-6 text-lg font-medium text-foreground">
                {d.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {d.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm text-gold transition-colors group-hover:text-gold-light">
                <span>Read reflection</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted">
          Every disease has a cure. Start with one honest reflection today.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/before-you-text"
            className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-6 py-2.5 text-sm font-medium text-gold-light transition-all hover:bg-gold/20"
          >
            Before You Text Them
          </Link>
          <Link
            href="/focus"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground/80 transition-all hover:border-gold/40 hover:text-gold-light"
          >
            Enter Focus Mode
          </Link>
        </div>
      </div>
    </section>
  );
}
