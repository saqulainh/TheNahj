"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { beforeYouTextPrompts } from "@/data/mock";
import { ShieldAlert, Sparkles, BookOpen, PenTool, CheckCircle, RotateCcw, Heart, Shield, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";

// Curated Imam Ali (AS) quotes for each emotional state
const quotesMap: Record<string, { quote: string; source: string }> = {
  loneliness: {
    quote: "To lose friends is to become a stranger in one’s own land. Be patient with your loneliness, for it is better than toxic company.",
    source: "Nahjul Balagha, Saying 65"
  },
  "self-respect": {
    quote: "A man's worth is in accordance with his aspirations, and his truthfulness is in proportion to his self-respect.",
    source: "Nahjul Balagha, Saying 47"
  },
  "haram-relationships": {
    quote: "Dignity is in escaping what is low, and nobility is in guarding yourself from that which demeans your character.",
    source: "Nahjul Balagha, Sermon 83"
  },
  spirituality: {
    quote: "He who is certain of Allah's reward does not hesitate to be generous with his patience and prayers.",
    source: "Nahjul Balagha, Saying 124"
  },
  "toxic-attachment": {
    quote: "The tongue is like a sharp sword; if you do not control it, it will wound you. Protect your heart through the beauty of silence.",
    source: "Nahjul Balagha, Saying 381"
  }
};

export function ReflectionFlow() {
  const [step, setStep] = useState(-1); // -1 is intro
  const [journalText, setJournalText] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, "yes" | "no" | null>>({});

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleAnswer = (val: "yes" | "no") => {
    setAnswers(prev => ({ ...prev, [step]: val }));
  };

  const resetAll = () => {
    setStep(-1);
    setAnswers({});
    setJournalText({});
  };

  // Intro Screen
  if (step === -1) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-xl text-center px-4"
      >
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold mb-8 animate-float">
          <div className="absolute inset-0 rounded-full bg-gold/5 blur-md" />
          <ShieldAlert size={38} className="relative z-10" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.3em] text-gold-muted font-medium">
          A Moment of Pause
        </span>

        <h2 className="mt-4 text-3xl font-light tracking-tight text-[#F5F5F0] sm:text-4xl">
          Before You Text Them
        </h2>

        <p className="mt-6 text-sm leading-relaxed text-muted/70 font-light">
          Dignity is often the message we do not send. When emotional impulse takes over, our judgment clouds. Take a breath and answer five honest questions for your own soul.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <button
            onClick={next}
            className="group relative flex items-center justify-center gap-4 rounded-full bg-[#F5F5F0] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_35px_-5px_rgba(255,255,255,0.25)]"
          >
            Start Reflection
            <Sparkles size={14} className="transition-transform duration-300 group-hover:rotate-12" />
          </button>
          
          <span className="text-[10px] text-muted/40 font-light">
            Fully private. Your entries never leave your device.
          </span>
        </div>
      </motion.div>
    );
  }

  const currentPrompt = beforeYouTextPrompts[step];
  const totalSteps = beforeYouTextPrompts.length;
  const isFinished = step === totalSteps;

  // Complete Screen
  if (isFinished) {
    const yesCount = Object.values(answers).filter(v => v === "yes").length;
    let guidanceText = "";
    if (yesCount >= 4) {
      guidanceText = "Your answers indicate deep emotional impulse or attachment right now. Releasing this text may disrupt your inner peace. Let it rest tonight.";
    } else if (yesCount >= 2) {
      guidanceText = "You are somewhat conflicted. There is wisdom in waiting. Write down the draft on a piece of paper, wait 24 hours, and then review it.";
    } else {
      guidanceText = "You seem clear-headed and grounded. If you decide to send the message, ensure it is spoken with ultimate kindness, truth, and respect.";
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-xl px-4"
      >
        <div className="noise-overlay relative overflow-hidden rounded-3xl border border-gold/10 bg-gradient-to-b from-gold/[0.04] to-transparent p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl -z-10" />
          
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold mb-6">
            <CheckCircle size={28} />
          </div>

          <span className="text-[9px] uppercase tracking-[0.25em] text-gold-muted font-medium">
            Reflection Complete
          </span>

          <h2 className="mt-3 text-2xl font-light text-[#F5F5F0]">
            The Gift of Restraint
          </h2>

          <div className="my-8 rounded-2xl bg-black/35 border border-white/[0.03] p-6 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted font-medium mb-3 flex items-center gap-2">
              <Shield size={12} /> Guided Advice
            </p>
            <p className="text-sm leading-relaxed text-muted/80 font-light">
              {guidanceText}
            </p>
          </div>

          {/* Imam Ali (AS) Complete Quote Panel */}
          <div className="relative border-y border-gold/15 py-8 my-8 text-center px-4">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-xs font-serif text-gold italic">
              Imam Ali (AS) says:
            </span>
            <p className="font-serif text-base italic leading-relaxed text-gold-light/90">
              \"Silence is the best answer to anger, and restraint is the ultimate sign of dignity.\"
            </p>
            <p className="mt-2 text-[9px] uppercase tracking-widest text-muted/40">
              Ghurar al-Hikam, Saying 492
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={() => window.location.href = "/focus"}
              className="w-full rounded-full border border-gold/30 bg-gold/5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light transition-all hover:bg-gold/10 hover:shadow-[0_0_20px_-5px_rgba(201,162,39,0.15)]"
            >
              Enter Immersive Focus Mode
            </button>
            <div className="flex gap-3">
              <button
                onClick={resetAll}
                className="flex-1 rounded-full border border-border/40 bg-surface/40 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:border-gold/20 hover:text-foreground transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw size={12} /> Start Over
                </span>
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 rounded-full border border-border/40 bg-surface/40 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:border-gold/20 hover:text-foreground transition-all"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const activeQuote = quotesMap[currentPrompt.category] || { quote: "", source: "" };

  return (
    <div className="mx-auto max-w-xl px-4">
      {/* Step Header */}
      <div className="mb-6 flex items-center justify-between border-b border-white/[0.04] pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
            Prompt {step + 1} of {totalSteps}
          </span>
          <span className="text-xs text-muted/40 mt-1 capitalize">
            Focus: {currentPrompt.category.replace("-", " ")}
          </span>
        </div>
        <div className="h-1.5 w-24 rounded-full bg-white/[0.03] overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          {/* Question Text */}
          <h3 className="text-xl leading-relaxed text-[#F5F5F0] font-light md:text-2xl">
            {currentPrompt.question}
          </h3>

          {/* Simple Yes / No Buttons */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer("yes")}
              className={`rounded-2xl border py-4 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                answers[step] === "yes"
                  ? "border-gold bg-gold/10 text-gold-light"
                  : "border-border bg-surface/50 text-muted hover:border-gold/25 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Heart size={12} /> Yes, Honestly
              </span>
            </button>
            <button
              onClick={() => handleAnswer("no")}
              className={`rounded-2xl border py-4 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                answers[step] === "no"
                  ? "border-gold bg-gold/10 text-gold-light"
                  : "border-border bg-surface/50 text-muted hover:border-gold/25 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Shield size={12} /> No, Not Really
              </span>
            </button>
          </div>

          {/* Optional Journaling Area */}
          <div className="mt-8 rounded-2xl bg-black/25 border border-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted/50 mb-3">
              <PenTool size={12} />
              <span>Pour your thoughts out (Optional)</span>
            </div>
            <textarea
              rows={3}
              value={journalText[step] || ""}
              onChange={(e) => setJournalText(prev => ({ ...prev, [step]: e.target.value }))}
              placeholder="Writing down the raw emotions can break the cycle of immediate reaction..."
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/30 focus:border-gold/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Connected Imam Ali (AS) Quote */}
          {activeQuote.quote && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 rounded-2xl border border-gold/10 bg-gold/[0.02] p-5 md:p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium mb-3 flex items-center gap-2">
                <BookOpen size={12} /> Wisdom for Restraint
              </p>
              <p className="font-serif italic text-sm leading-relaxed text-gold-light/80">
                \"{activeQuote.quote}\"
              </p>
              <p className="mt-2 text-right text-[9px] tracking-wider text-muted/40">
                — {activeQuote.source}
              </p>
            </motion.div>
          )}

          {/* Next / Back controls */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/[0.04]">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors disabled:opacity-0"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button
              onClick={next}
              disabled={answers[step] === undefined}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                answers[step] === undefined
                  ? "bg-white/[0.03] text-muted/35 cursor-not-allowed border border-white/[0.03]"
                  : "bg-white text-black hover:bg-neutral-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              }`}
            >
              <span>{step === totalSteps - 1 ? "Complete" : "Continue"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
