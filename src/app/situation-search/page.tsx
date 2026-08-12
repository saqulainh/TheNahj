"use client";

import { useState } from "react";
import { Search, Loader2, Heart, ArrowRight, BookOpen, Quote } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AudioReaderButton } from "@/components/wisdom/AudioReaderButton";

export default function SituationSearchPage() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/search/situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.error || "Failed to find guidance for your situation.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-4xl mx-auto space-y-10 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-gold font-bold uppercase tracking-widest text-xs mx-auto w-max px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5">
          <Search size={14} /> AI Situation Search
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          What are you going through right now?
        </h1>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          Don't search for keywords. Describe your real-life problem naturally. 
          The AI will find the exact guidance from Imam Ali (AS) that speaks directly to your heart.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Heart size={20} className="text-gold/60 group-focus-within:text-gold transition-colors" />
          </div>
          <input
            type="text"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            disabled={loading}
            placeholder="e.g., I feel really jealous of my friend's success..."
            className="w-full h-16 pl-14 pr-36 rounded-[2rem] border-2 border-border/40 bg-surface-alt/70 text-sm md:text-base text-foreground placeholder:text-muted/60 focus:border-gold/60 focus:bg-surface-elevated transition-all outline-none shadow-xl"
          />
          <button
            type="submit"
            disabled={!situation.trim() || loading}
            className="absolute inset-y-2 right-2 flex items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-black shadow-lg hover:bg-gold-light hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Find Peace</span>}
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mt-3 text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}
      </div>

      {/* AI Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl rounded-3xl border border-gold/40 bg-gradient-to-br from-surface-alt via-surface-elevated to-surface p-8 shadow-2xl space-y-8"
        >
          {/* Empathy Message */}
          <div className="flex gap-4 items-start pb-6 border-b border-border/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <Heart size={20} fill="currentColor" />
            </div>
            <p className="text-base text-foreground/90 font-medium leading-relaxed italic">
              "{result.empathyMessage}"
            </p>
          </div>

          {/* Wisdom Quote */}
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gold font-bold uppercase tracking-widest text-[10px]">
              <Quote size={12} /> Guided Wisdom on {result.recommendedWisdom?.topic}
            </div>
            
            <p className="font-arabic text-3xl text-gold leading-relaxed" dir="rtl">
              {result.recommendedWisdom?.arabicText}
            </p>
            
            <p className="text-lg text-foreground/90 font-medium leading-relaxed px-4 md:px-10">
              "{result.recommendedWisdom?.englishTranslation}"
            </p>
            
            <div className="flex justify-center items-center gap-4">
              <p className="text-[11px] text-muted font-bold uppercase tracking-widest">
                — {result.recommendedWisdom?.source}
              </p>
              <AudioReaderButton 
                text={result.recommendedWisdom?.englishTranslation} 
                source={result.recommendedWisdom?.source} 
              />
            </div>
          </div>

          {/* Practical Advice */}
          <div className="pt-6 border-t border-border/30 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-gold" /> How to apply this right now
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              {result.practicalAdvice}
            </p>
          </div>

          {/* Read More Link */}
          <div className="flex justify-center pt-2">
            <Link 
              href={`/wisdom/${result.suggestedSearchLink || "topic"}`} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gold/30 bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors"
            >
              Read deep reflections on this topic <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

    </div>
  );
}
