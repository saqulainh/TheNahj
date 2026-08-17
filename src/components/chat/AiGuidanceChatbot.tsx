"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight, Mic, MicOff, Volume2, VolumeX, RotateCcw } from "lucide-react";
import Link from "next/link";
import { BreathingWidget } from "@/components/chat/widgets/BreathingWidget";
import { InteractiveQuizWidget } from "@/components/chat/widgets/InteractiveQuizWidget";
import { ReflectionTimerWidget } from "@/components/chat/widgets/ReflectionTimerWidget";
import { sanitizeAIResponse } from "@/lib/sanitizeAIResponse";
import { useStreamingResponse } from "@/lib/useStreamingResponse";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  widget?: any;
  relatedWisdom?: Array<{ title: string; slug: string; quote: string }>;
  /** True while this specific assistant message is still streaming */
  isStreaming?: boolean;
}

const PRESET_PROMPTS = [
  "How to deal with exam anxiety & stress?",
  "Overcoming laziness & building self-discipline",
  "Imam Ali's advice on time management",
];

// Extend window for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ─── Dynamic loading messages cycling while waiting for first token ───────────
const LOADING_STAGES = [
  "Searching Nahjul Balagha...",
  "Consulting wisdom sources...",
  "Composing response...",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AiGuidanceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Intro popup state ──
  const [showIntro, setShowIntro] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Streaming hook ──
  const {
    displayedText,
    isStreaming,
    statusMessage,
    metadata,
    error: streamError,
    skipToEnd,
    sendMessage: sendStreamingMessage,
  } = useStreamingResponse({ scrollRef: messagesEndRef as React.RefObject<HTMLElement | null> });

  // ID of the in-progress assistant message (so we can update it in place)
  const streamingMsgIdRef = useRef<string | null>(null);

  // --- Memory: Load from localStorage on mount ---
  useEffect(() => {
    const saved = localStorage.getItem("thenahj_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {}
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Peace be upon you! I am TheNahj AI Guidance Assistant. How can I help you today using the wisdom of Imam Ali (AS)?",
        },
      ]);
    }

    // Show intro popup on every visit
    setTimeout(() => setShowIntro(true), 800);
    setIsLoaded(true);
  }, []);

  // --- Dismiss intro popup ---
  const handleDismissIntro = () => {
    setShowIntro(false);
  };

  // --- Global Event Listener to Open Chat ---
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      setIsOpen(true);
      if (e.detail?.query) {
        setInput(e.detail.query);
      }
    };
    window.addEventListener("open-ai-chat", handleOpenChat as EventListener);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat as EventListener);
  }, []);

  // --- Memory: Save to localStorage on every change ---
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      // Don't persist the temporary streaming-in-progress message
      const toSave = messages.map((m) => ({ ...m, isStreaming: undefined }));
      localStorage.setItem("thenahj_chat_history", JSON.stringify(toSave));
    }
  }, [messages, isLoaded]);

  // --- Update the in-progress assistant message as tokens arrive ---
  useEffect(() => {
    const msgId = streamingMsgIdRef.current;
    if (!msgId) return;
    if (!displayedText && !streamError) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              content: streamError
                ? sanitizeAIResponse(displayedText) || streamError
                : sanitizeAIResponse(displayedText),
              isStreaming,
            }
          : m
      )
    );
  }, [displayedText, isStreaming, streamError]);

  // --- Finalize message when streaming completes ---
  useEffect(() => {
    if (isStreaming || !streamingMsgIdRef.current) return;
    const msgId = streamingMsgIdRef.current;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              isStreaming: false,
              widget: metadata?.widget,
              relatedWisdom: metadata?.relatedWisdom,
            }
          : m
      )
    );

    streamingMsgIdRef.current = null;
  }, [isStreaming, metadata]);

  // --- Voice Input (Speech to Text) ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setInput((prev) => prev + (prev ? " " : "") + transcript);
          }
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error", e);
      }
    }
  };

  // --- Voice Output (Text to Speech) ---
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speakText = (text: string, msgId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    if (speakingId === msgId) {
      setSpeakingId(null);
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // --- Send Message ---
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || input).trim();
      if (!text || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };

      // Create a placeholder assistant message that will be filled by streaming
      const assistantMsgId = (Date.now() + 1).toString();
      streamingMsgIdRef.current = assistantMsgId;

      const assistantPlaceholder: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      if (!textToSend) setInput("");

      const history = messages
        .filter((m) => m.id !== "welcome" && !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      // Kick off streaming — the hook updates displayedText via state
      await sendStreamingMessage({ message: text, history });
    },
    [input, isStreaming, messages, sendStreamingMessage]
  );

  const handleClearHistory = () => {
    localStorage.removeItem("thenahj_chat_history");
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. Peace be upon you! How can I help you today?",
      },
    ]);
  };

  // ─── Dynamic progress message ─────────────────────────────────────────────
  // While isStreaming and no text yet, cycle through loading stages
  const [stageIndex, setStageIndex] = useState(0);
  useEffect(() => {
    if (!isStreaming) {
      setStageIndex(0);
      return;
    }
    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % LOADING_STAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [isStreaming]);

  const currentStatusMessage =
    statusMessage ||
    (isStreaming ? LOADING_STAGES[stageIndex] : "");

  if (!isLoaded) return null;

  return (
    <>
      {/* ─── Glassmorphism Intro Popup ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-popup"
            layoutId="ai-trigger"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -60, y: -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-4 top-24 z-50 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-gold/35 bg-surface/80 p-5 shadow-[0_8px_40px_rgba(199,166,84,0.25)] backdrop-blur-2xl"
          >
            {/* Dismiss X */}
            <button
              onClick={handleDismissIntro}
              className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:text-foreground transition-colors"
              aria-label="Dismiss intro"
            >
              <X size={15} />
            </button>

            {/* Icon + Title */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-gold">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold font-semibold">TheNahj AI</p>
                <h3 className="text-sm font-bold text-foreground leading-tight">Your Wisdom Companion</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed text-muted mb-1">
              Grounded in <span className="text-foreground font-medium">Nahjul Balagha</span> — the peak of
              eloquence of Imam Ali ibn Abi Talib (AS) — this AI offers guidance on life, faith, focus, and
              character for modern Muslim youth.
            </p>
            <p className="text-xs leading-relaxed text-muted mb-4">
              Ask about stress, discipline, purpose, or relationships. Wisdom from 1,400 years ago, made
              relevant for today.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleDismissIntro(); setIsOpen(true); }}
                className="flex-1 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-black transition-all hover:brightness-110 active:scale-95"
              >
                Ask a Question
              </button>
              <button
                onClick={handleDismissIntro}
                className="rounded-xl border border-border/40 px-3 py-2 text-xs text-muted hover:text-foreground transition-colors"
              >
                Got It
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Trigger Button ─── */}
      <AnimatePresence>
        {!showIntro && (
          <motion.button
            key="ai-button"
            layoutId="ai-trigger"
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/90 to-gold px-4 py-2.5 shadow-[0_4px_25px_rgba(199,166,84,0.4)] text-black font-semibold text-xs tracking-wider transition-all hover:brightness-110"
            aria-label="Open AI Guidance Assistant"
          >
            <Sparkles size={15} className="animate-pulse" />
            <span className="hidden sm:inline">Ask Imam Ali's Wisdom</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Window Overlay ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[calc(100vw-3rem)] max-w-[420px] flex-col rounded-3xl border border-gold/30 bg-surface/95 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 bg-surface-alt/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">TheNahj AI</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {isStreaming ? "Thinking..." : "Online"}
                    </p>
                    <button onClick={handleClearHistory} className="text-[10px] text-muted hover:text-red-400 transition-colors">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20 mt-0.5">
                      <Bot size={12} />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-2`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gold text-black font-medium rounded-tr-xs"
                          : "bg-surface-elevated/70 text-foreground border border-border/30 rounded-tl-xs"
                      }`}
                    >
                      {msg.isStreaming && msg.content === "" ? (
                        /* ── Loading state: dynamic progress messages ── */
                        <div className="flex items-center gap-2 text-muted min-h-[1.2em]">
                          <Loader2 size={11} className="animate-spin text-gold shrink-0" />
                          <span className="animate-pulse transition-all duration-500">
                            {currentStatusMessage}
                          </span>
                        </div>
                      ) : (
                        /* ── Content: streaming or complete ── */
                        <div>
                          <p
                            className="whitespace-pre-wrap"
                            onClick={msg.isStreaming ? skipToEnd : undefined}
                            style={{ cursor: msg.isStreaming ? "pointer" : "auto" }}
                            title={msg.isStreaming ? "Click to reveal full response" : undefined}
                          >
                            {msg.content}
                            {/* Blinking cursor while streaming this specific message */}
                            {msg.isStreaming && (
                              <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-[0.9em] bg-gold ml-[1px] align-text-bottom animate-pulse"
                              />
                            )}
                          </p>
                          {msg.isStreaming && (
                            <button
                              onClick={skipToEnd}
                              className="mt-1 text-[10px] text-gold/60 hover:text-gold transition-colors"
                            >
                              Skip →
                            </button>
                          )}
                        </div>
                      )}

                      {/* Error / Retry State */}
                      {streamError && msg.id === streamingMsgIdRef.current && (
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-red-500/20 pt-2.5">
                          <span className="text-[10px] text-red-400 font-medium leading-tight max-w-[70%]">{streamError}</span>
                          <button
                            onClick={() => {
                              // Find the last user message
                              const lastUserMsg = messages.filter(m => m.role === "user").pop();
                              if (lastUserMsg) {
                                // Remove the failed assistant message and the user message so we don't duplicate
                                setMessages(prev => prev.filter(m => m.id !== msg.id && m.id !== lastUserMsg.id));
                                handleSend(lastUserMsg.content);
                              }
                            }}
                            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40"
                          >
                            <RotateCcw size={10} /> Retry
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Voice Read Button for completed Assistant messages */}
                    {msg.role === "assistant" && msg.id !== "welcome" && !msg.isStreaming && (
                      <div className="flex justify-start px-1">
                        <button
                          onClick={() => speakText(msg.content, msg.id)}
                          className="text-muted hover:text-gold transition-colors flex items-center gap-1 text-[10px]"
                          title="Read aloud"
                        >
                          {speakingId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          <span>{speakingId === msg.id ? "Stop" : "Listen"}</span>
                        </button>
                      </div>
                    )}

                    {/* Generative UI Dynamic Widgets (only after streaming complete) */}
                    {!msg.isStreaming && msg.widget?.type === "breathing" && (
                      <BreathingWidget title={msg.widget.title} />
                    )}

                    {!msg.isStreaming && msg.widget?.type === "quiz" && (
                      <InteractiveQuizWidget
                        question={msg.widget.question}
                        options={msg.widget.options}
                        correctIndex={msg.widget.correctIndex}
                        explanation={msg.widget.explanation}
                      />
                    )}

                    {!msg.isStreaming && msg.widget?.type === "reflection" && (
                      <ReflectionTimerWidget prompt={msg.widget.prompt} />
                    )}

                    {/* Related Wisdom Card Snippets (only after streaming complete) */}
                    {!msg.isStreaming && msg.relatedWisdom && msg.relatedWisdom.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">Related Reflection:</p>
                        {msg.relatedWisdom.map((w, idx) => (
                          <Link
                            key={idx}
                            href={`/wisdom/${w.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 p-2.5 transition-all hover:border-gold/40 hover:bg-gold/10"
                          >
                            <span className="truncate text-[11px] font-medium text-foreground group-hover:text-gold">
                              {w.title}
                            </span>
                            <ArrowRight size={12} className="text-gold shrink-0 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-muted border border-border/40 mt-0.5">
                      <User size={12} />
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Presets */}
            {messages.length <= 1 && !isStreaming && (
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border border-border/40 bg-surface-elevated/50 px-2.5 py-1 text-[10px] text-foreground/80 hover:border-gold/40 hover:text-gold transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-border/20 bg-surface-alt/70 p-3"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  isListening
                    ? "bg-red-500/20 text-red-500 border-red-500/50 animate-pulse"
                    : "border-border/40 bg-surface-elevated text-gold hover:border-gold/50"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStreaming ? "Receiving wisdom..." : "Ask Imam Ali's wisdom..."}
                disabled={isStreaming && !streamError}
                className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || (isStreaming && !streamError)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-black transition-all hover:bg-gold-light disabled:opacity-40"
              >
                {isStreaming && !streamError ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
