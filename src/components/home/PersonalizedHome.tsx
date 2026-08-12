"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePersonalization } from "@/lib/personalization";

interface Section {
  id: string;
  keywords: string[];
  content: ReactNode;
  score?: number;
}

export function PersonalizedHome({ 
  hero, 
  showcase, 
  youth, 
  student, 
  diseases, 
  newsletter, 
  corner 
}: { 
  hero: ReactNode;
  showcase: ReactNode;
  youth: ReactNode;
  student: ReactNode;
  diseases: ReactNode;
  newsletter: ReactNode;
  corner: ReactNode;
}) {
  const { topTopics } = usePersonalization();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default Order
  const defaultSections: Section[] = [
    { id: "showcase", keywords: ["wisdom", "daily"], content: showcase },
    { id: "youth", keywords: ["youth", "loneliness", "validation", "identity"], content: youth },
    { id: "student", keywords: ["student", "exam", "focus", "knowledge", "procrastination"], content: student },
    { id: "diseases", keywords: ["digital", "anxiety", "addiction", "social media", "doomscrolling"], content: diseases },
    { id: "corner", keywords: ["explore", "topics"], content: corner },
  ];

  let orderedSections = defaultSections;

  if (mounted && topTopics.length > 0) {
    // Score each section based on user's top topics
    const scoredSections = defaultSections.map(section => {
      let score = 0;
      topTopics.slice(0, 3).forEach((topic, index) => {
        if (section.keywords.some(kw => kw.toLowerCase().includes(topic.toLowerCase()))) {
          score += (3 - index); // Higher weight for top 1
        }
      });
      return { ...section, score };
    });

    // Sort by score descending, stable sort for equals
    orderedSections = scoredSections.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return (
    <>
      {hero}
      
      {orderedSections.map((section) => (
        <div key={section.id} className="animate-in fade-in duration-700 relative">
          {mounted && (section.score ?? 0) > 0 && (
            <div className="absolute -top-4 right-8 z-10 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] text-gold-light uppercase tracking-widest backdrop-blur-md">
              Recommended for you
            </div>
          )}
          {section.content}
        </div>
      ))}
      
      {newsletter}
    </>
  );
}
