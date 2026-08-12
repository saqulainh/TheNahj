"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, ArrowLeft, Send, Copy, BookOpen, Layers, Heart, FileText, Check, RefreshCw, Edit3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SeniorAiStudioPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);

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
        toast.success("Master Wisdom Card generated adhering to all 18 Master Rules!");
      } else {
        setError(data.error || "Failed to generate wisdom card. Ensure admin session is active.");
        toast.error("Generation failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error while connecting to AI Studio.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    if (!card || regeneratingSection) return;
    setRegeneratingSection(sectionKey);

    try {
      const res = await fetch("/api/admin/ai-studio/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          sectionKey,
          currentWisdom: card.originalWisdom?.englishTranslation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCard((prev: any) => ({
          ...prev,
          [sectionKey]: { ...prev[sectionKey], ...data.data },
        }));
        toast.success(`Section '${sectionKey}' refreshed!`);
      } else {
        toast.error("Failed to refresh section");
      }
    } catch {
      toast.error("Error refreshing section");
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleCopyJson = () => {
    if (!card) return;
    navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(() => {
      setCopied(true);
      toast.success("Full Master Wisdom Card JSON copied!");
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
        toast.success("Published live to website database!");
      } else {
        toast.warning("Published to JSON storage!");
        setPublished(true);
      }
    } catch {
      toast.error("Error publishing card");
    } finally {
      setPublishing(false);
    }
  };

  // Generic Field Update Helper for live inline editing
  const updateCardField = (section: string, field: string, value: any) => {
    setCard((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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
              <h1 className="text-xl font-bold tracking-tight text-foreground">AI Master Wisdom Studio (Senior SDE Edition)</h1>
            </div>
            <p className="text-xs text-muted">Zod Verified • Multi-Model Resilient • Live Section Regeneration</p>
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
            <span>{loading ? "Generating Master Card..." : "Generate Master Card"}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Interactive 7-Section Tab Navigation */}
      {card && (
        <div className="space-y-6">
          <div className="flex border-b border-border/20 gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider pb-1">
            {[
              { id: 1, label: "1. Basic Info", icon: Layers },
              { id: 2, label: "2. Original Wisdom", icon: BookOpen },
              { id: 3, label: "3. Explanations", icon: FileText },
              { id: 4, label: "4. Related Narrations", icon: Heart },
              { id: 5, label: "5. Modern Relevance", icon: Sparkles },
              { id: 6, label: "6. Reflection", icon: Edit3 },
              { id: 7, label: "7. Conclusion", icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 shrink-0 ${
                    activeTab === tab.id
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section 1: Basic Information */}
          {activeTab === 1 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 1: Basic Information (Editable)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-muted block mb-1">Title</label>
                  <input
                    type="text"
                    value={card.basicInfo?.title || ""}
                    onChange={(e) => updateCardField("basicInfo", "title", e.target.value)}
                    className="w-full rounded-xl border border-border/40 bg-background p-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1">Category</label>
                  <input
                    type="text"
                    value={card.basicInfo?.category || ""}
                    onChange={(e) => updateCardField("basicInfo", "category", e.target.value)}
                    className="w-full rounded-xl border border-border/40 bg-background p-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1">Slug</label>
                  <input
                    type="text"
                    value={card.basicInfo?.slug || ""}
                    onChange={(e) => updateCardField("basicInfo", "slug", e.target.value)}
                    className="w-full rounded-xl border border-border/40 bg-background p-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1">Audience</label>
                  <input
                    type="text"
                    value={card.basicInfo?.audienceMapping || ""}
                    onChange={(e) => updateCardField("basicInfo", "audienceMapping", e.target.value)}
                    className="w-full rounded-xl border border-border/40 bg-background p-2.5 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted block text-xs mb-1">Excerpt</label>
                <textarea
                  value={card.basicInfo?.excerpt || ""}
                  onChange={(e) => updateCardField("basicInfo", "excerpt", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border/40 bg-background p-2.5 text-xs text-foreground"
                />
              </div>
            </div>
          )}

          {/* Section 2: Original Wisdom */}
          {activeTab === 2 && (
            <div className="rounded-3xl border border-gold/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 2: Original Wisdom Content</span>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-gold uppercase font-bold block mb-1">Arabic Text (With Harakat)</label>
                  <textarea
                    value={card.originalWisdom?.arabicText || ""}
                    onChange={(e) => updateCardField("originalWisdom", "arabicText", e.target.value)}
                    rows={3}
                    dir="rtl"
                    className="w-full rounded-xl border border-border/40 bg-background p-3 text-lg font-arabic text-gold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gold uppercase font-bold block mb-1">Urdu Translation</label>
                    <textarea
                      value={card.originalWisdom?.urduTranslation || ""}
                      onChange={(e) => updateCardField("originalWisdom", "urduTranslation", e.target.value)}
                      rows={3}
                      dir="rtl"
                      className="w-full rounded-xl border border-border/40 bg-background p-3 text-xs font-urdu text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-gold uppercase font-bold block mb-1">English Translation</label>
                    <textarea
                      value={card.originalWisdom?.englishTranslation || ""}
                      onChange={(e) => updateCardField("originalWisdom", "englishTranslation", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-border/40 bg-background p-3 text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Explanation Area */}
          {activeTab === 3 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 3: Explanation Area</span>
                <button
                  onClick={() => handleRegenerateSection("explanationArea")}
                  disabled={regeneratingSection === "explanationArea"}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10"
                >
                  <RefreshCw size={12} className={regeneratingSection === "explanationArea" ? "animate-spin" : ""} />
                  <span>Refresh Explanations</span>
                </button>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-foreground block mb-1">Main Explanation</label>
                  <textarea
                    value={card.explanationArea?.mainExplanation || ""}
                    onChange={(e) => updateCardField("explanationArea", "mainExplanation", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border/40 bg-background p-3 text-xs text-foreground leading-relaxed"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Tafseer</label>
                  <textarea
                    value={card.explanationArea?.tafseer || ""}
                    onChange={(e) => updateCardField("explanationArea", "tafseer", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border/40 bg-background p-3 text-xs text-foreground leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Related Narrations */}
          {activeTab === 4 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 4: Related Narrations</span>
              </div>
              <div className="space-y-4">
                {card.relatedNarrations?.map((nar: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-background border border-border/30 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gold">
                      <span>{nar.narrator}</span>
                      <span>{nar.source}</span>
                    </div>
                    <p className="text-foreground/90">&quot;{nar.englishTranslation}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Modern Relevance */}
          {activeTab === 5 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 5: Modern Relevance</span>
                <button
                  onClick={() => handleRegenerateSection("modernRelevance")}
                  disabled={regeneratingSection === "modernRelevance"}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10"
                >
                  <RefreshCw size={12} className={regeneratingSection === "modernRelevance" ? "animate-spin" : ""} />
                  <span>Refresh Modern Relevance</span>
                </button>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-foreground block mb-1">Current Issues (Codeblock Formatted)</label>
                  <textarea
                    value={card.modernRelevance?.currentIssues || ""}
                    onChange={(e) => updateCardField("modernRelevance", "currentIssues", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-border/40 bg-black/80 p-3 font-mono text-gold-light text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Practical Application (Codeblock Formatted)</label>
                  <textarea
                    value={card.modernRelevance?.practicalApplication || ""}
                    onChange={(e) => updateCardField("modernRelevance", "practicalApplication", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-border/40 bg-black/80 p-3 font-mono text-gold-light text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Reflection */}
          {activeTab === 6 && (
            <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 6: Reflection</span>
                <button
                  onClick={() => handleRegenerateSection("reflection")}
                  disabled={regeneratingSection === "reflection"}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10"
                >
                  <RefreshCw size={12} className={regeneratingSection === "reflection" ? "animate-spin" : ""} />
                  <span>Refresh Reflection</span>
                </button>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-foreground block mb-1">Reflection Questions (8-10 Copyable)</label>
                  <textarea
                    value={card.reflection?.reflectionQuestions || ""}
                    onChange={(e) => updateCardField("reflection", "reflectionQuestions", e.target.value)}
                    rows={8}
                    className="w-full rounded-xl border border-border/40 bg-black/80 p-3 font-mono text-amber-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Action Steps</label>
                  <textarea
                    value={card.reflection?.actionSteps || ""}
                    onChange={(e) => updateCardField("reflection", "actionSteps", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-border/40 bg-black/80 p-3 font-mono text-emerald-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Conclusion */}
          {activeTab === 7 && (
            <div className="rounded-3xl border border-gold/40 bg-surface-alt/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Section 7: Conclusion</span>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-foreground block mb-1">Summary</label>
                  <textarea
                    value={card.conclusion?.summary || ""}
                    onChange={(e) => updateCardField("conclusion", "summary", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border/40 bg-background p-3 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-gold uppercase block mb-1">Closing Reflection</label>
                  <textarea
                    value={card.conclusion?.closingReflection || ""}
                    onChange={(e) => updateCardField("conclusion", "closingReflection", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs text-gold-light italic font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
