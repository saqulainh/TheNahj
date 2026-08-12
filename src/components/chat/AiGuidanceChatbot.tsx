"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { BreathingWidget } from "@/components/chat/widgets/BreathingWidget";
import { InteractiveQuizWidget } from "@/components/chat/widgets/InteractiveQuizWidget";
import { ReflectionTimerWidget } from "@/components/chat/widgets/ReflectionTimerWidget";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  widget?: any;
  relatedWisdom?: Array<{ title: string; slug: string; quote: string }>;
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

export function AiGuidanceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            "Peace be upon you! I am **TheNahj AI Guidance Assistant**. How can I help you today using the wisdom of Imam Ali (AS)?",
        },
      ]);
    }
    setIsLoaded(true);
  }, []);

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
      localStorage.setItem("thenahj_chat_history", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

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
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            widget: data.widget,
            relatedWisdom: data.relatedWisdom,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.error || "Sorry, I encountered an issue. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  if (!isLoaded) return null;

  return (
    <>
      {/* ─── Floating Trigger Button ─── */}
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/90 to-gold px-4 py-3 shadow-[0_4px_25px_rgba(199,166,84,0.4)] text-black font-semibold text-xs tracking-wider transition-all hover:brightness-110"
        aria-label="Open AI Guidance Assistant"
      >
        <Sparkles size={16} className="animate-pulse" />
        <span className="hidden sm:inline">Ask Imam Ali's Wisdom</span>
      </motion.button>

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
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
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
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Voice Read Button for Assistant */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
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

                    {/* Generative UI Dynamic Widgets */}
                    {msg.widget && msg.widget.type === "breathing" && (
                      <BreathingWidget title={msg.widget.title} />
                    )}

                    {msg.widget && msg.widget.type === "quiz" && (
                      <InteractiveQuizWidget
                        question={msg.widget.question}
                        options={msg.widget.options}
                        correctIndex={msg.widget.correctIndex}
                        explanation={msg.widget.explanation}
                      />
                    )}

                    {msg.widget && msg.widget.type === "reflection" && (
                      <ReflectionTimerWidget prompt={msg.widget.prompt} />
                    )}

                    {/* Related Wisdom Card Snippets */}
                    {msg.relatedWisdom && msg.relatedWisdom.length > 0 && (
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

              {loading && (
                <div className="flex items-center gap-2 text-muted text-xs pl-8">
                  <Loader2 size={14} className="animate-spin text-gold" />
                  <span className="animate-pulse">Seeking wisdom...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets */}
            {messages.length <= 1 && !loading && (
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
                placeholder="Ask Imam Ali's wisdom..."
                disabled={loading}
                className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-black transition-all hover:bg-gold-light disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
