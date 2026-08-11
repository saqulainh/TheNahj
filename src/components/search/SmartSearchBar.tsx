"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SmartSearchBarProps {
  initialQuery: string;
  initialSection: string;
}

export function SmartSearchBar({ initialQuery, initialSection }: SmartSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [section, setSection] = useState(initialSection);
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Detect if text is Arabic/Urdu (RTL)
  const isRtl = /[\u0600-\u06FF]/.test(query);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US'; // Default, but can be improved
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Auto submit after voice
      setTimeout(() => formRef.current?.requestSubmit(), 300);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <form 
      ref={formRef}
      action="/search" 
      onSubmit={() => setIsPending(true)}
      className="flex flex-col gap-3 md:flex-row md:items-center rounded-[1.5rem] border border-border/20 bg-surface/60 p-4"
    >
      <div className="relative flex-1">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Arabic, Urdu, or English..."
          dir={isRtl ? "rtl" : "ltr"}
          className={`w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-gold/50 ${isRtl ? "font-arabic pr-10" : "pl-4 pr-10"}`}
        />
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`absolute top-1/2 -translate-y-1/2 p-2 transition-colors ${isRtl ? "left-2" : "right-2"} ${isListening ? "text-red-500 animate-pulse" : "text-muted hover:text-gold"}`}
          title="Voice Search"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      <select
        name="section"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground outline-none w-full md:w-[220px]"
      >
        <option value="">All Sections</option>
        <option value="Imam Ali Says">Imam Ali Says</option>
        <option value="Nahjul Balagha">Nahjul Balagha</option>
        <option value="Student Corner">Student Corner</option>
        <option value="Youth Corner">Youth Corner</option>
        <option value="Articles">Articles</option>
      </select>

      <button 
        type="submit"
        disabled={isPending}
        className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-gold px-6 font-bold text-black transition-all hover:bg-gold-light w-full md:w-auto min-w-[120px] disabled:opacity-70"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        {isPending ? "Searching" : "Search"}
      </button>
    </form>
  );
}
