"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Edit3, Save, Trash2, Heart, Award, ArrowRight, ShieldAlert } from "lucide-react";
import { formatReflection } from "@/lib/format";

interface InteractiveReflectionProps {
  wisdomId: string;
  reflectionQuestions: string[];
  actionSteps: string[];
  simpleMeaning?: string;
  whyToday?: string;
  deepReflection: string;
}

export function InteractiveReflection({
  wisdomId,
  reflectionQuestions = [],
  actionSteps = [],
  simpleMeaning,
  whyToday,
  deepReflection,
}: InteractiveReflectionProps) {
  // Load local state for checked questions, checked action steps, and journal entries
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [journalEntries, setJournalEntries] = useState<Record<number, string>>({});
  const [activeJournalIndex, setActiveJournalIndex] = useState<number | null>(null);
  const [tempJournalText, setTempJournalText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const qKey = `thenahj-q-${wisdomId}`;
      const sKey = `thenahj-s-${wisdomId}`;
      const jKey = `thenahj-j-${wisdomId}`;

      const savedQ = localStorage.getItem(qKey);
      const savedS = localStorage.getItem(sKey);
      const savedJ = localStorage.getItem(jKey);

      if (savedQ) setCheckedQuestions(JSON.parse(savedQ));
      if (savedS) setCheckedSteps(JSON.parse(savedS));
      if (savedJ) setJournalEntries(JSON.parse(savedJ));
    } catch (e) {
      console.error("Failed to load interactive states from localStorage", e);
    }
  }, [wisdomId]);

  // Persist helpers
  const saveQuestions = (next: Record<number, boolean>) => {
    setCheckedQuestions(next);
    localStorage.setItem(`thenahj-q-${wisdomId}`, JSON.stringify(next));
  };

  const saveSteps = (next: Record<number, boolean>) => {
    setCheckedSteps(next);
    localStorage.setItem(`thenahj-s-${wisdomId}`, JSON.stringify(next));
  };

  const saveJournal = (next: Record<number, string>) => {
    setJournalEntries(next);
    localStorage.setItem(`thenahj-j-${wisdomId}`, JSON.stringify(next));
  };

  // Toggle checks
  const toggleQuestion = (index: number) => {
    const next = { ...checkedQuestions, [index]: !checkedQuestions[index] };
    saveQuestions(next);
  };

  const toggleStep = (index: number) => {
    const next = { ...checkedSteps, [index]: !checkedSteps[index] };
    saveSteps(next);
  };

  // Open journaling
  const handleOpenJournal = (index: number) => {
    setActiveJournalIndex(index);
    setTempJournalText(journalEntries[index] || "");
  };

  // Save journaling entry
  const handleSaveJournal = (index: number) => {
    const next = { ...journalEntries, [index]: tempJournalText };
    saveJournal(next);
    setActiveJournalIndex(null);
  };

  // Delete journaling entry
  const handleDeleteJournal = (index: number) => {
    const next = { ...journalEntries };
    delete next[index];
    saveJournal(next);
    if (activeJournalIndex === index) {
      setActiveJournalIndex(null);
      setTempJournalText("");
    }
  };

  // Calculated stats
  const completedStepsCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalStepsCount = actionSteps.length;
  const progressPercent = totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0;

  if (!mounted) {
    // SSR Fallback (Non-interactive skeleton)
    return (
      <div className="space-y-12">
        {simpleMeaning && (
          <section>
            <h2 className="text-sm uppercase tracking-wider text-gold-muted">Simple meaning</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">{simpleMeaning}</p>
          </section>
        )}
        {whyToday && (
          <section>
            <h2 className="text-sm uppercase tracking-wider text-gold-muted">Why this matters today</h2>
            <p className="mt-4 leading-relaxed text-foreground/85">{whyToday}</p>
          </section>
        )}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-gold-muted">Deep reflection</h2>
          <div className="prose-reflection mt-6" dangerouslySetInnerHTML={{ __html: formatReflection(deepReflection) }} />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* 1. Core Meaning & Content Column */}
      <div className="space-y-12">
        {simpleMeaning && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs uppercase tracking-[0.2em] text-gold-muted font-medium">Simple Meaning</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90 font-light">{simpleMeaning}</p>
          </motion.section>
        )}

        {whyToday && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h2 className="text-xs uppercase tracking-[0.2em] text-gold-muted font-medium">Why This Matters Today</h2>
            <p className="mt-4 leading-relaxed text-muted/80 font-light">{whyToday}</p>
          </motion.section>
        )}

        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-xs uppercase tracking-[0.2em] text-gold-muted font-medium">Deep Reflection</h2>
          <div
            className="prose-reflection mt-6"
            dangerouslySetInnerHTML={{ __html: formatReflection(deepReflection) }}
          />
        </motion.section>
      </div>

      {/* 2. Interactive Reflection Questions (Journaling Hub) */}
      {reflectionQuestions.length > 0 && (
        <section className="rounded-3xl border border-white/[0.04] bg-surface/30 p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Heart size={16} className="text-gold" />
            <h2 className="text-sm uppercase tracking-wider text-gold-muted font-medium">Reflection Questions</h2>
          </div>

          <div className="space-y-4">
            {reflectionQuestions.map((q, idx) => {
              const isChecked = !!checkedQuestions[idx];
              const hasJournal = !!journalEntries[idx];
              const isEditing = activeJournalIndex === idx;

              return (
                <div 
                  key={idx} 
                  className={`rounded-2xl border p-5 transition-all duration-300 ${
                    isChecked 
                      ? "border-gold/15 bg-gold/[0.01]" 
                      : "border-border/40 bg-black/20 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Circle Checkbox */}
                    <button
                      onClick={() => toggleQuestion(idx)}
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isChecked 
                          ? "border-gold bg-gold text-black" 
                          : "border-border hover:border-gold-muted"
                      }`}
                    >
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </button>

                    <div className="flex-1">
                      <p 
                        onClick={() => toggleQuestion(idx)}
                        className={`text-sm leading-relaxed transition-all cursor-pointer ${
                          isChecked ? "text-muted/50 line-through" : "text-foreground/90 font-light"
                        }`}
                      >
                        {q}
                      </p>

                      {/* Saved Journal Entry Excerpt */}
                      {hasJournal && !isEditing && (
                        <div className="mt-4 rounded-xl bg-black/45 border border-white/[0.02] p-4 text-xs text-gold-light/80 italic leading-relaxed relative group">
                          <span className="text-[8px] uppercase tracking-widest text-muted/30 block mb-1">Your Reflection</span>
                          &ldquo;{journalEntries[idx]}&rdquo;
                          <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenJournal(idx)} className="text-muted hover:text-foreground">
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleDeleteJournal(idx)} className="text-muted hover:text-red-400">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Journal Editor */}
                      {isEditing ? (
                        <div className="mt-4 space-y-3">
                          <textarea
                            rows={3}
                            value={tempJournalText}
                            onChange={(e) => setTempJournalText(e.target.value)}
                            placeholder="Write your private thoughts here to integrate this wisdom into your character..."
                            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted/35 focus:border-gold/30 focus:outline-none transition-colors"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveJournalIndex(null)}
                              className="rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveJournal(idx)}
                              className="rounded-full bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-gold-light hover:bg-gold/20 transition-all flex items-center gap-1.5 font-medium"
                            >
                              <Save size={10} /> Save Entry
                            </button>
                          </div>
                        </div>
                      ) : (
                        !hasJournal && (
                          <button
                            onClick={() => handleOpenJournal(idx)}
                            className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted hover:text-gold-light transition-colors"
                          >
                            <Edit3 size={10} /> Write Reflection
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Practical Steps (Gamified Checklist) */}
      {actionSteps.length > 0 && (
        <section className="rounded-3xl border border-white/[0.04] bg-surface/30 p-6 md:p-8 backdrop-blur-md">
          <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-gold" />
              <h2 className="text-sm uppercase tracking-wider text-gold-muted font-medium">Practical Action Steps</h2>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted/50">
              {completedStepsCount} of {totalStepsCount} Completed
            </span>
          </div>

          {/* Action Progress Bar */}
          <div className="mb-8 h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
            />
          </div>

          <div className="space-y-4">
            {actionSteps.map((step, idx) => {
              const isChecked = !!checkedSteps[idx];

              return (
                <div 
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                    isChecked 
                      ? "border-gold/15 bg-gold/[0.01]" 
                      : "border-border/40 bg-black/20 hover:border-white/10"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 text-xs font-semibold ${
                    isChecked 
                      ? "bg-gold text-black" 
                      : "bg-gold/15 text-gold-light"
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <p className={`text-sm leading-relaxed transition-all ${
                    isChecked ? "text-muted/50 line-through" : "text-foreground/90 font-light"
                  }`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>

          {completedStepsCount === totalStepsCount && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-2xl border border-gold/20 bg-gold/[0.03] p-5 text-center"
            >
              <p className="text-xs uppercase tracking-widest text-gold-light font-semibold mb-1 flex items-center justify-center gap-1.5">
                🌟 All Steps Attempted!
              </p>
              <p className="text-xs text-muted/60 font-light">
                Imam Ali (AS) taught that action is the fruit of knowledge. You are living the wisdom today.
              </p>
            </motion.div>
          )}
        </section>
      )}
    </div>
  );
}
