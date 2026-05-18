import Link from "next/link";
import { notFound } from "next/navigation";
import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { getRelatedWisdom, getWisdomBySlug } from "@/lib/wisdom";
import { InteractiveReflection } from "@/components/wisdom/InteractiveReflection";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const wisdom = await getWisdomBySlug(slug);
  if (!wisdom) return { title: "Not Found" };
  return {
    title: wisdom.english_translation.slice(0, 60),
    description: wisdom.short_reflection,
    openGraph: {
      title: wisdom.english_translation.slice(0, 80),
      description: wisdom.short_reflection,
    },
  };
}

export default async function ReflectionPage({ params }: PageProps) {
  const { slug } = await params;
  const wisdom = await getWisdomBySlug(slug);
  if (!wisdom) notFound();

  const related = await getRelatedWisdom(wisdom);

  return (
    <article className="selection:bg-gold/30 selection:text-white bg-background min-h-screen">
      {/* 1. High-Fidelity Immersive Hero */}
      <div className="relative h-[65vh] min-h-[450px] w-full overflow-hidden border-b border-border/30">
        {/* Cinematic Backdrop Layer */}
        {wisdom.featured_image ? (
          <div 
            className="h-full w-full opacity-25 mix-blend-luminosity filter contrast-125 scale-105"
            style={{ 
              backgroundImage: `url('${wisdom.featured_image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          />
        ) : (
          <div className="h-full w-full bg-background" />
        )}

        {/* Dynamic Visual Overlays */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Main Adaptive Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
          {/* Subtle vignette blur overlay */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          {/* Ambient Gold Glows */}
          <div className="absolute -left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-[100px]" />
          {/* Fine Noise Texture */}
          <div
            className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        {/* Core Hero Content (Centered scripts) */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pt-24 text-center">
          <Link href="/wisdom" className="absolute left-6 top-10 text-[10px] uppercase tracking-[0.25em] text-secondary hover:text-gold md:left-12 transition-colors">
            ← Wisdom Repository
          </Link>

          <p
            className="max-w-4xl font-arabic text-center text-[clamp(2rem,5vw,4.5rem)] leading-[1.8] md:leading-[2] text-foreground drop-shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
            dir="rtl"
            lang="ar"
          >
            {wisdom.arabic_text}
          </p>
          
          <div className="mt-10 flex items-center gap-5 text-[10px] uppercase tracking-[0.25em] font-medium text-gold">
            <span>{wisdom.category?.name}</span>
            <div className="h-1 w-1 rounded-full bg-gold/30" />
            <span>{wisdom.source}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Reflection Hub */}
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-20 relative z-20">
        <p className="font-urdu text-center text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[2.2] text-foreground/90 border-b border-border/30 pb-10" dir="rtl">
          {wisdom.urdu_translation}
        </p>

        <p className="my-10 text-center text-[clamp(1.1rem,2vw,1.35rem)] leading-relaxed text-secondary/80 font-light italic">
          "{wisdom.english_translation}"
        </p>

        <InteractiveReflection
          wisdomId={wisdom.id}
          reflectionQuestions={wisdom.reflection_questions || []}
          actionSteps={wisdom.action_steps || []}
          simpleMeaning={wisdom.simple_meaning}
          whyToday={wisdom.why_today}
          deepReflection={wisdom.deep_reflection}
        />

        {/* Related wisdom block */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-border/30 pt-16">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-8">
              Keep Reflecting
            </span>
            <h2 className="mb-10 text-2xl font-light text-foreground">Related Wisdom</h2>
            <div className="space-y-8">
              {related.map((w, i) => (
                <WisdomCard key={w.id} wisdom={w} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
