"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { beforeYouTextPrompts } from "@/data/mock";
import { ShieldAlert, Sparkles, PenTool, CheckCircle, RotateCcw, ChevronLeft, ChevronRight, Share2, Save, HelpCircle } from "lucide-react";

const MOODS = [
  { id: "angry", emoji: "😤", label: "Angry" },
  { id: "sad", emoji: "😔", label: "Sad / Hurt" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
  { id: "lonely", emoji: "💔", label: "Lonely" },
  { id: "confused", emoji: "🤔", label: "Confused" },
];

const QUOTES_MAP: Record<string, { quote: string; source: string }> = {
  angry: {
    quote: "Anger is a fire kindled; he who restrains it extinguishes it, and he who lets it loose is the first to be consumed by it.",
    source: "Nahjul Balagha"
  },
  sad: {
    quote: "Do not let your difficulties fill you with anxiety, after all it is only in the darkest nights that stars shine more brightly.",
    source: "Imam Ali (AS)"
  },
  anxious: {
    quote: "O my God! When I look at my sins I become fearful, but when I look at Your generosity I gain hope.",
    source: "Munajat of Imam Ali (AS)"
  },
  lonely: {
    quote: "To lose friends is to become a stranger in one’s own land. Be patient with your loneliness, for it is better than toxic company.",
    source: "Nahjul Balagha, Saying 65"
  },
  confused: {
    quote: "He who has a thousand friends has not a friend to spare, and he who has one enemy will meet him everywhere. Guard your dignity.",
    source: "Imam Ali (AS)"
  }
};

export function ReflectionFlow() {
  const [step, setStep] = useState(-2); // -2 is Mood Selector, -1 is Intro, 0+ are prompts
  const [mood, setMood] = useState<string | null>(null);
  const [journalText, setJournalText] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, "yes" | "no" | null>>({});
  const [savedToHistory, setSavedToHistory] = useState(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleAnswer = (val: "yes" | "no") => {
    setAnswers(prev => ({ ...prev, [step]: val }));
  };

  const resetAll = () => {
    setStep(-2);
    setMood(null);
    setAnswers({});
    setJournalText({});
    setSavedToHistory(false);
  };

  const handleSaveToHistory = () => {
    if (typeof window === "undefined") return;
    try {
      const history = JSON.parse(localStorage.getItem("reflection-history") || "[]");
      history.push({
        date: new Date().toISOString(),
        mood,
        answers,
        journal: journalText,
      });
      localStorage.setItem("reflection-history", JSON.stringify(history));
      setSavedToHistory(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareSummary = async () => {
    const text = `I just completed a self-reflection before texting someone. It helped me protect my peace and dignity.\n\nTry it at TheNahj: https://thenahj.live/focus/before-you-text`;
    if (navigator.share) {
      await navigator.share({ title: "TheNahj Reflection", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Link copied!");
    }
  };

  // 1. MOOD SELECTOR SCREEN
  if (step === -2) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-auto max-w-xl text-center px-4"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold-muted font-medium">
          Check In
        </span>
        <h2 className="mt-4 text-3xl font-light tracking-tight text-[#F5F5F0] sm:text-4xl">
          How are you feeling right now?
        </h2>
        <p className="mt-4 text-sm text-muted/70">
          Identifying your emotion is the first step to controlling it.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => {
                setMood(m.id);
                next();
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/20 bg-surface/40 p-6 transition-all hover:border-gold/40 hover:bg-surface/80"
            >
              <span className="text-4xl">{m.emoji}</span>
              <span className="text-xs font-medium text-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // 2. INTRO SCREEN
  if (step === -1) {
    const quoteData = mood ? QUOTES_MAP[mood] : QUOTES_MAP["sad"];
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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

        <div className="mt-8 rounded-2xl border border-border/20 bg-surface/30 p-6 italic text-secondary/80">
          "{quoteData.quote}"
          <span className="block mt-4 text-[10px] font-bold uppercase not-italic tracking-wider text-gold-muted">
            — {quoteData.source}
          </span>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted/70 font-light">
          Take a deep breath. Answer five honest questions for your own soul before you hit send.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <button
            onClick={next}
            className="group relative flex items-center justify-center gap-4 rounded-full bg-[#F5F5F0] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_35px_-5px_rgba(255,255,255,0.25)]"
          >
            Start Reflection
            <Sparkles size={14} className="transition-transform duration-300 group-hover:rotate-12" />
          </button>
        </div>
      </motion.div>
    );
  }

  const currentPrompt = beforeYouTextPrompts[step];
  const totalSteps = beforeYouTextPrompts.length;
  const isFinished = step === totalSteps;

  // 4. COMPLETE SCREEN
  if (isFinished) {
    const yesCount = Object.values(answers).filter(v => v === "yes").length;
    let guidanceText = "";
    
    if (yesCount >= 3) {
      guidanceText = "You seem to be acting from a place of emotional clarity and dignity. If you must reach out, do so with boundaries and respect for yourself.";
    } else if (yesCount === 2) {
      guidanceText = "You are in a gray area. There is still lingering attachment or fear driving this text. Wait 24 hours before sending anything.";
    } else {
      guidanceText = "Your emotional state is compromised. This text is likely driven by validation-seeking or anxiety. Silence is your best armor right now.";
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-2xl px-4"
      >
        <div className="rounded-3xl border border-border/20 bg-surface/60 p-8 md:p-12 shadow-2xl backdrop-blur-xl text-center">
          
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
            <CheckCircle size={32} />
          </div>

          <h2 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">
            Reflection Complete
          </h2>
          
          <p className="mt-6 text-sm leading-relaxed text-secondary/90 md:text-base max-w-lg mx-auto">
            {guidanceText}
          </p>

          <div className="mt-8 rounded-2xl border border-border/10 bg-background/40 p-6 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-muted mb-4">
              Your Private Journal
            </h4>
            
            <div className="space-y-4">
              {Object.entries(journalText).map(([stepIdx, text]) => {
                if (!text.trim()) return null;
                const prompt = beforeYouTextPrompts[parseInt(stepIdx)];
                return (
                  <div key={stepIdx} className="border-l-2 border-gold/20 pl-4">
                    <p className="text-[10px] text-muted mb-1">{prompt.question}</p>
                    <p className="text-sm text-foreground/90 italic">&quot;{text}&quot;</p>
                  </div>
                );
              })}
              {Object.values(journalText).every(t => !t.trim()) && (
                <p className="text-xs text-muted italic">No journal entries written.</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={handleSaveToHistory}
              disabled={savedToHistory}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/30 bg-surface/40 py-4 text-sm font-medium text-foreground transition-all hover:bg-surface/80 disabled:opacity-50"
            >
              {savedToHistory ? <CheckCircle size={16} className="text-green-400" /> : <Save size={16} />}
              {savedToHistory ? "Saved to History" : "Save Journal to Device"}
            </button>
            <button
              onClick={handleShareSummary}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 text-sm font-bold text-black transition-all hover:bg-gold-light"
            >
              <Share2 size={16} /> Share Experience
            </button>
          </div>

          <button
            onClick={resetAll}
            className="mt-10 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted hover:text-foreground transition-colors mx-auto"
          >
            <RotateCcw size={14} />
            Start Over
          </button>
        </div>
      </motion.div>
    );
  }

  // 3. Q&A SCREEN
  const progressPercentage = ((step) / totalSteps) * 100;
  const progressDasharray = `${progressPercentage} 100`;

  return (
    <div className="mx-auto max-w-xl px-4 w-full">
      {/* Header controls */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={back}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        
        {/* Circular Progress Indicator */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              className="text-border/30"
              strokeDasharray="100 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
            <motion.path
              className="text-gold"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: progressDasharray }}
              transition={{ duration: 0.5 }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-foreground">
            {step + 1}/{totalSteps}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="rounded-3xl border border-border/20 bg-surface/60 p-6 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-8">
            {/* Question */}
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium leading-snug text-foreground">
                {currentPrompt.question}
              </h3>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer("yes")}
                className={`flex items-center justify-center rounded-xl border p-4 text-sm font-semibold transition-all duration-200 ${
                  answers[step] === "yes"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border/20 bg-surface-elevated text-muted hover:border-gold/30 hover:text-foreground"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer("no")}
                className={`flex items-center justify-center rounded-xl border p-4 text-sm font-semibold transition-all duration-200 ${
                  answers[step] === "no"
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : "border-border/20 bg-surface-elevated text-muted hover:border-red-400/30 hover:text-foreground"
                }`}
              >
                No
              </button>
            </div>

            {/* Logic & Journal (Only show after answering) */}
            <AnimatePresence>
              {answers[step] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-6">
                    {/* The Logic Explanation */}
                    <div className="rounded-xl border border-gold/10 bg-gold/5 p-4 text-sm leading-relaxed text-secondary/90 italic">
                      {answers[step] === "yes" ? currentPrompt.yesLogic : currentPrompt.noLogic}
                    </div>

                    {/* Private Journal */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        <PenTool size={14} />
                        Private Journal Note (Optional)
                      </label>
                      <textarea
                        value={journalText[step] || ""}
                        onChange={(e) => setJournalText(prev => ({ ...prev, [step]: e.target.value }))}
                        placeholder="Write down exactly why you feel this way. Get it out of your system..."
                        className="w-full rounded-xl border border-border/20 bg-background/50 p-4 text-sm text-foreground outline-none transition-colors focus:border-gold/50 min-h-[100px] resize-none"
                      />
                    </div>

                    <button
                      onClick={next}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 text-sm font-bold text-black transition-all hover:bg-gold-light"
                    >
                      {isFinished ? "See Result" : "Continue"}
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
