"use client";

import { useState } from "react";
import { useFlashcards } from "@/lib/flashcards";
import { Brain, ArrowRight, ArrowLeft, RefreshCw, Layers, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardsPage() {
  const { deck, loading, reviewCard, getDueCards } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const dueCards = getDueCards();
  const currentCard = dueCards[currentIndex];

  const handleReview = (difficulty: "hard" | "good" | "easy") => {
    if (!currentCard) return;
    reviewCard(currentCard.id, difficulty);
    setIsFlipped(false);

    if (currentIndex + 1 >= dueCards.length) {
      setSessionCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gold"><RefreshCw className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-semibold">
          <ArrowLeft size={16} /> Back Home
        </Link>
        <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-widest text-xs">
          <Brain size={16} />
          <span>AI Memory Flashcards</span>
        </div>
      </div>

      {sessionCompleted || dueCards.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-3xl border border-gold/40 bg-gradient-to-br from-surface-alt via-surface-elevated to-surface-alt p-10 text-center space-y-6 shadow-2xl"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 text-gold mx-auto border border-gold/30">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">You're All Caught Up!</h2>
            <p className="text-sm text-muted">You have reviewed all your due flashcards for today. Imam Ali (AS) says, "There is no wealth like wisdom."</p>
          </div>
          <Link href="/wisdom" className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-black hover:scale-105 transition-transform">
            Read More Wisdom
          </Link>
        </motion.div>
      ) : (
        <div className="w-full max-w-lg space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Card {currentIndex + 1} of {dueCards.length}</span>
            <span className="flex items-center gap-1"><Layers size={14} /> Spaced Repetition</span>
          </div>

          {/* Flashcard 3D Flip Container */}
          <div 
            className="relative w-full h-[350px] perspective-1000 cursor-pointer"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <motion.div
              className="w-full h-full relative preserve-3d transition-all duration-500"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden rounded-3xl border border-border/40 bg-surface-alt/90 p-8 shadow-xl flex flex-col items-center justify-center text-center">
                <Brain size={32} className="text-gold/40 absolute top-6 right-6" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  {currentCard.front}
                </h3>
                <p className="absolute bottom-6 text-xs font-bold uppercase tracking-widest text-gold animate-pulse">
                  Tap to flip & reveal
                </p>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-gold/40 bg-gradient-to-br from-surface via-surface-elevated to-surface p-8 shadow-2xl flex flex-col items-center justify-center text-center overflow-y-auto">
                <p className="font-arabic text-3xl text-gold leading-relaxed mb-6" dir="rtl">
                  {currentCard.backArabic}
                </p>
                <p className="text-sm md:text-base text-foreground/90 font-medium leading-relaxed mb-4">
                  "{currentCard.backEnglish}"
                </p>
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">
                  — {currentCard.source}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons (Only show when flipped) */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 pt-4"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview("hard"); }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors flex flex-col items-center gap-1"
                >
                  <XCircle size={16} /> Hard (Review Soon)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview("good"); }}
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 py-3 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors flex flex-col items-center gap-1"
                >
                  <RotateCcw size={16} /> Good
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview("easy"); }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors flex flex-col items-center gap-1"
                >
                  <CheckCircle2 size={16} /> Easy
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}
