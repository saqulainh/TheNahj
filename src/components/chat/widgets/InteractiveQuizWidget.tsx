"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Award } from "lucide-react";

interface QuizProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function InteractiveQuizWidget({ question, options, correctIndex, explanation }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-gold/30 bg-surface-alt/90 p-4 shadow-lg backdrop-blur-md max-w-xs mx-auto my-3 text-left">
      <div className="flex items-center gap-1.5 text-gold text-[10px] uppercase font-bold tracking-widest mb-2">
        <Award size={13} />
        <span>Generative Knowledge Check</span>
      </div>

      <p className="text-xs font-semibold text-foreground mb-3 leading-snug">{question}</p>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === correctIndex;
          let btnClass = "border-border/40 bg-background hover:border-gold/50 text-foreground";

          if (selectedOption !== null) {
            if (isCorrect) {
              btnClass = "border-green-500/60 bg-green-500/10 text-green-300 font-semibold";
            } else if (isSelected) {
              btnClass = "border-red-500/60 bg-red-500/10 text-red-300";
            } else {
              btnClass = "opacity-40 border-border/20 bg-background";
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedOption !== null}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex items-center justify-between ${btnClass}`}
            >
              <span>{opt}</span>
              {selectedOption !== null && isCorrect && <CheckCircle2 size={14} className="text-green-400 shrink-0" />}
              {selectedOption !== null && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <div className="mt-3 p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-[10px] text-secondary leading-relaxed">
          <span className="font-bold text-gold uppercase tracking-wider block mb-0.5">
            {selectedOption === correctIndex ? "✓ Correct!" : "✗ Reflection:"}
          </span>
          {explanation}
        </div>
      )}
    </div>
  );
}
