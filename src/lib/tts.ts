"use client";

// Define callback types for state updates (e.g. isSpeaking)
export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: any) => void;
}

/**
 * Stop any currently playing TTS
 */
export function stopTTS() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Intelligently chunks text by language script (Latin vs Arabic/Urdu) 
 * and plays each chunk with the most appropriate native voice sequentially.
 */
export function speakMultilingualText(text: string, callbacks?: TTSCallbacks) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    callbacks?.onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean markdown out of the text (like asterisks or link tags)
  const cleanText = text.replace(/[*#_`]/g, "").replace(/\[.*?\]\(.*?\)/g, "");

  // Split the text into segments.
  // The regex captures blocks of Arabic/Urdu characters along with their attached punctuation/spaces.
  const segments = cleanText.split(/([\u0600-\u06FF\s،؟]+)/).filter(s => s.trim().length > 0);

  const utterances: SpeechSynthesisUtterance[] = [];
  const voices = window.speechSynthesis.getVoices();

  // Pre-find best voices for each language
  const arVoice = voices.find(v => v.lang.startsWith("ar"));
  const urVoice = voices.find(v => v.lang.startsWith("ur"));
  const enVoice = 
    voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google"))) || 
    voices.find(v => v.lang.startsWith("en"));

  segments.forEach((segment) => {
    const isArabicScript = /[\u0600-\u06FF]/.test(segment);
    const utterance = new SpeechSynthesisUtterance(segment.trim());
    
    if (isArabicScript) {
      // Very basic heuristic to check if the Arabic script is Urdu rather than Arabic
      const isUrdu = segment.includes('ہے') || segment.includes('یں') || segment.includes('کیا') || segment.includes('کی') || segment.includes('کے');
      
      if (isUrdu && urVoice) {
        utterance.voice = urVoice;
        utterance.lang = "ur-PK";
      } else if (arVoice) {
        utterance.voice = arVoice;
        utterance.lang = "ar-SA";
      } else if (urVoice) {
        utterance.voice = urVoice; 
        utterance.lang = "ur-PK";
      }
      utterance.rate = 0.85; // Slightly slower for Arabic/Urdu clarity
    } else {
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.lang = "en-US";
      utterance.rate = 0.95;
    }
    
    utterances.push(utterance);
  });

  if (utterances.length === 0) {
    callbacks?.onEnd?.();
    return;
  }

  // Hook up callbacks to the queue
  utterances[0].onstart = () => {
    callbacks?.onStart?.();
  };

  utterances.forEach((u, index) => {
    u.onerror = (e) => {
      console.warn("TTS Error on segment:", e);
      // Keep going if possible, or trigger error
      if (index === utterances.length - 1) {
        callbacks?.onError?.(e);
        callbacks?.onEnd?.();
      }
    };
    
    if (index === utterances.length - 1) {
      u.onend = () => {
        callbacks?.onEnd?.();
      };
    }
  });

  // Speak them all in sequence. The browser queues them automatically.
  utterances.forEach(u => window.speechSynthesis.speak(u));
}
