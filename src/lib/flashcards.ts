"use client";

import { useState, useEffect } from "react";
import { getCMSConfig } from "@/lib/cms";

export interface Flashcard {
  id: string;
  front: string; // The topic or excerpt
  backArabic: string;
  backEnglish: string;
  source: string;
  nextReviewDate: string;
  level: number; // 0 = New, 1 = Hard, 2 = Good, 3 = Easy
}

const FLASHCARDS_KEY = "thenahj_flashcards_deck";

export function useFlashcards() {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will initialize the deck from local storage or create a default one from CMS data
    const loadDeck = async () => {
      const stored = localStorage.getItem(FLASHCARDS_KEY);
      if (stored) {
        setDeck(JSON.parse(stored));
        setLoading(false);
      } else {
        // Fallback demo flashcards if none exist (ideally fetched from wisdom_cards)
        const initialDeck: Flashcard[] = [
          {
            id: "fc_1",
            front: "What did Imam Ali (AS) say about the value of time?",
            backArabic: "إِضَاعَةُ الْفُرْصَةِ غُصَّةٌ",
            backEnglish: "Wasting an opportunity results in grief.",
            source: "Saying 118",
            nextReviewDate: new Date().toISOString(),
            level: 0,
          },
          {
            id: "fc_2",
            front: "What is the greatest wealth according to Imam Ali (AS)?",
            backArabic: "لَا غِنَى كَالْعَقْلِ",
            backEnglish: "There is no wealth like wisdom.",
            source: "Saying 54",
            nextReviewDate: new Date().toISOString(),
            level: 0,
          },
          {
            id: "fc_3",
            front: "How should we treat people?",
            backArabic: "خَالِطُوا النَّاسَ مُخَالَطَةً إِنْ مِتُّمْ مَعَهَا بَكَوْا عَلَيْكُمْ، وَإِنْ عِشْتُمْ حَنُّوا إِلَيْكُمْ",
            backEnglish: "Associate with people in such a manner that if you die they weep for you, and if you live they long for your company.",
            source: "Saying 10",
            nextReviewDate: new Date().toISOString(),
            level: 0,
          }
        ];
        setDeck(initialDeck);
        localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(initialDeck));
        setLoading(false);
      }
    };
    loadDeck();
  }, []);

  const reviewCard = (id: string, difficulty: "hard" | "good" | "easy") => {
    setDeck((prevDeck) => {
      const updated = prevDeck.map((card) => {
        if (card.id !== id) return card;
        
        let newLevel = card.level;
        let daysToAdd = 1;

        if (difficulty === "hard") {
          newLevel = Math.max(0, card.level - 1);
          daysToAdd = 1;
        } else if (difficulty === "good") {
          newLevel = card.level + 1;
          daysToAdd = newLevel * 2; // e.g. 2, 4, 6 days
        } else if (difficulty === "easy") {
          newLevel = card.level + 2;
          daysToAdd = newLevel * 3; // e.g. 6, 9, 12 days
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        return { ...card, level: newLevel, nextReviewDate: nextDate.toISOString() };
      });

      localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getDueCards = () => {
    const today = new Date().getTime();
    return deck.filter((card) => new Date(card.nextReviewDate).getTime() <= today);
  };

  return { deck, loading, reviewCard, getDueCards };
}
