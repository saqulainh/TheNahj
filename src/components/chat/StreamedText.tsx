"use client";

/**
 * StreamedText
 *
 * Reusable typewriter component that progressively reveals text word-by-word.
 * Use this anywhere AI-generated text is displayed outside the main chatbot.
 *
 * Props:
 *   text       – Full text to reveal (can arrive all at once or grow over time)
 *   speed      – Milliseconds between word reveals (default: 30ms)
 *   className  – Optional className for the outer span
 *   onComplete – Callback fired when the full text has been revealed
 *
 * Behaviour:
 *   - Reveals text in chunks of WORDS_PER_TICK words per interval tick
 *   - Clicking anywhere on the component skips to full reveal instantly
 *   - When `text` prop grows (e.g. streaming), picks up from where it left off
 *   - When `text` prop resets (empty string), resets the animation
 *
 * Usage:
 *   <StreamedText text={fullResponse} speed={30} />
 */

import { useState, useEffect, useRef, useCallback } from "react";

const WORDS_PER_TICK = 3;   // Words revealed per interval
const DEFAULT_SPEED = 30;   // ms between reveals

interface StreamedTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function StreamedText({ text, speed = DEFAULT_SPEED, className, onComplete }: StreamedTextProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const skippedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Split text into words once, not on every tick
  const wordsRef = useRef<string[]>([]);
  const prevTextRef = useRef("");

  // When text changes (grows or resets), update word array
  if (text !== prevTextRef.current) {
    if (text === "") {
      // Reset animation
      wordsRef.current = [];
      skippedRef.current = false;
      setDisplayIndex(0);
    } else {
      // Append new words (handles the case where text grows during streaming)
      wordsRef.current = text.split(/(\s+)/);
    }
    prevTextRef.current = text;
  }

  const totalWords = wordsRef.current.length;
  const isComplete = displayIndex >= totalWords && totalWords > 0;

  const skipToEnd = useCallback(() => {
    skippedRef.current = true;
    setDisplayIndex(totalWords);
  }, [totalWords]);

  // Typewriter interval
  useEffect(() => {
    if (skippedRef.current || totalWords === 0) return;
    if (displayIndex >= totalWords) {
      onCompleteRef.current?.();
      return;
    }

    const timer = setInterval(() => {
      setDisplayIndex((prev) => {
        const next = Math.min(prev + WORDS_PER_TICK, totalWords);
        if (next >= totalWords) {
          clearInterval(timer);
          onCompleteRef.current?.();
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [displayIndex, totalWords, speed]);

  // On skip, ensure onComplete fires
  useEffect(() => {
    if (skippedRef.current && isComplete) {
      onCompleteRef.current?.();
    }
  }, [isComplete]);

  const displayed = wordsRef.current.slice(0, displayIndex).join("");

  return (
    <span
      className={className}
      onClick={isComplete ? undefined : skipToEnd}
      style={{ cursor: isComplete ? "auto" : "pointer" }}
      title={isComplete ? undefined : "Click to reveal all"}
      aria-live="polite"
    >
      {displayed}
      {!isComplete && totalWords > 0 && (
        // Blinking cursor while streaming
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            background: "currentColor",
            marginLeft: "1px",
            verticalAlign: "text-bottom",
            animation: "thenahj-cursor-blink 0.8s step-end infinite",
          }}
        />
      )}
    </span>
  );
}
