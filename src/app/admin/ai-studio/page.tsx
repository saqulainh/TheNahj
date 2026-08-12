"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, ArrowLeft, Send, Copy, BookOpen, Layers, Heart, FileText, Check } from "lucide-react";
import Link from "next/link";

export default function AiStudioPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);
    setPublished(false);

    try {
      const res = await fetch("/api/admin/ai-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCard(data.card);
      } else {
        setError(data.error || "Failed to generate wisdom card. Ensure admin session is active.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while connecting to AI Studio.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!card) return;
    navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePublish = async () => {
    if (!card || publishing) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: card.basicInfo?.title || topic,
          slug: card.basicInfo?.slug || topic.toLowerCase().replace(/\s+/g, "-"),
          category_id: "youth",
          arabic_text: card.originalWisdom?.arabicText || "",
          urdu_translation: card.originalWisdom?.urduTranslation || "",
          english_translation: card.originalWisdom?.englishTranslation || "",
          source: card.originalWisdom?.source || "Nahjul Balagha",
          source_number: card.originalWisdom?.sourceNumber || "",
          book_name: card.originalWisdom?.bookName || "Nahjul Balagha",
          master_card_json: card,
        }),
      });

      if (res.ok) {
        setPublished(true);
      } else {
        alert("Failed to publish directly to database. You can copy the generated JSON master card.");
      }
    } catch {
      alert("Error publishing card.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/20 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-surface-alt hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-gold animate-pulse" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">AI Master Wisdom Studio</h1>
            </div>
            <p className="text-xs text-muted">Generate full 7-section structured Wisdom Cards adhering to the 18 Master Rules</p>
          </div>
        </div>

        {card && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 bg-surface-alt text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "JSON Copied!" : "Copy Master JSON"}
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold transition-transform hover:scale-105 disabled:opacity-50"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {published ? "Published Live!" : "Publish to Website"}
            </button>
          </div>
        )}
      </div>

      {/* Topic Input Bar */}
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-surface-alt via-surface-elevated to-surface-alt p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">Specify Wisdom Topic</h2>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Social Media Addiction, Exam Anxiety, Time Management, Procrastination..."
            disabled={loading}
            className="flex-1 rounded-2xl border border-border/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 text-sm font-bold text-black shadow-lg transition-all hover:bg-gold-light disabled:opacity-40"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{loading ? "Generating Master Card..." : "Generate Card"}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Generated Master Card Preview */}
      {card && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Section 1: Basic Information */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <Layers size={16} />
              <span>Section 1: Basic Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div><span className="text-muted block">Title:</span> <strong className="text-foreground">{card.basicInfo?.title}</strong></div>
              <div><span className="text-muted block">Category:</span> <span className="px-2 py-0.5 rounded bg-gold/10 text-gold font-semibold">{card.basicInfo?.category}</span></div>
              <div><span className="text-muted block">Audience:</span> <span className="text-foreground">{card.basicInfo?.audienceMapping}</span></div>
              <div><span className="text-muted block">Slug:</span> <code className="text-xs text-gold/80">{card.basicInfo?.slug}</code></div>
              <div><span className="text-muted block">Status:</span> <span className="text-emerald-400 font-semibold">{card.basicInfo?.status}</span></div>
              <div><span className="text-muted block">Tags:</span> <span className="text-muted">{card.basicInfo?.tags?.join(", ")}</span></div>
            </div>
            <div>
              <span className="text-muted block text-xs">Excerpt:</span>
              <p className="text-xs text-foreground/90 italic font-medium mt-1">&quot;{card.basicInfo?.excerpt}&quot;</p>
            </div>
          </div>

          {/* Section 2: Original Wisdom Content */}
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-surface via-surface-elevated to-surface p-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <BookOpen size={16} />
              <span>Section 2: Original Wisdom Content</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-arabic text-gold leading-relaxed" dir="rtl">
              {card.originalWisdom?.arabicText}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left pt-2">
              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/30">
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold block mb-1">Urdu Translation</span>
                <p className="text-foreground font-arabic leading-relaxed text-right" dir="rtl">{card.originalWisdom?.urduTranslation}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/30">
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold block mb-1">English Translation</span>
                <p className="text-foreground/90 leading-relaxed">&quot;{card.originalWisdom?.englishTranslation}&quot;</p>
              </div>
            </div>

            <p className="text-xs text-gold font-semibold uppercase tracking-widest pt-2">
              — {card.originalWisdom?.source} ({card.originalWisdom?.sourceNumber})
            </p>
          </div>

          {/* Section 3: Explanation Area */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <FileText size={16} />
              <span>Section 3: Explanation Area</span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-foreground/90">
              <div>
                <h4 className="font-bold text-foreground mb-1">Main Explanation</h4>
                <p className="whitespace-pre-wrap">{card.explanationArea?.mainExplanation}</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Detailed Explanation</h4>
                <p className="whitespace-pre-wrap">{card.explanationArea?.detailedExplanation}</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Tafseer</h4>
                <p className="whitespace-pre-wrap">{card.explanationArea?.tafseer}</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Historical Context</h4>
                <p className="whitespace-pre-wrap">{card.explanationArea?.historicalContext}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Related Narrations */}
          {card.relatedNarrations && card.relatedNarrations.length > 0 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
                <Heart size={16} />
                <span>Section 4: Related Narrations ({card.relatedNarrations.length})</span>
              </div>

              <div className="space-y-4">
                {card.relatedNarrations.map((nar: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-background border border-border/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-gold font-bold uppercase tracking-wider">
                      <span>{nar.narrator}</span>
                      <span>Source: {nar.source}</span>
                    </div>
                    {nar.arabicText && <p className="font-arabic text-lg text-foreground text-right" dir="rtl">{nar.arabicText}</p>}
                    {nar.englishTranslation && <p className="text-foreground/90 font-medium">&quot;{nar.englishTranslation}&quot;</p>}
                    {nar.explanation && <p className="text-muted italic">{nar.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Modern Relevance */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <Sparkles size={16} />
              <span>Section 5: Modern Relevance</span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-foreground mb-2">Current Issues</h4>
                <pre className="p-3 rounded-2xl bg-black/60 border border-border/40 text-gold-light font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {card.modernRelevance?.currentIssues}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-foreground mb-1">Youth Relevance</h4>
                  <p className="text-muted">{card.modernRelevance?.youthRelevance}</p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Student Relevance</h4>
                  <p className="text-muted">{card.modernRelevance?.studentRelevance}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2">Practical Application</h4>
                <pre className="p-3 rounded-2xl bg-black/60 border border-border/40 text-gold-light font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {card.modernRelevance?.practicalApplication}
                </pre>
              </div>
            </div>
          </div>

          {/* Section 6: Reflection */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <FileText size={16} />
              <span>Section 6: Reflection</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-foreground mb-2">Reflection Questions (Literal Copyable)</h4>
                <pre className="p-3 rounded-2xl bg-black/60 border border-border/40 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {card.reflection?.reflectionQuestions}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2">Action Steps</h4>
                <pre className="p-3 rounded-2xl bg-black/60 border border-border/40 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {card.reflection?.actionSteps}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1">Personal Reflection</h4>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{card.reflection?.personalReflection}</p>
              </div>
            </div>
          </div>

          {/* Section 7: Conclusion */}
          <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-surface-alt via-surface-elevated to-surface-alt p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <CheckCircle2 size={16} />
              <span>Section 7: Conclusion</span>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">Summary Takeaway</h4>
              <p className="text-foreground/90 leading-relaxed">{card.conclusion?.summary}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gold/10 border border-gold/20 text-gold-light italic">
              <span className="font-bold uppercase tracking-wider block text-[10px] text-gold mb-1">Closing Reflection</span>
              &quot;{card.conclusion?.closingReflection}&quot;
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
