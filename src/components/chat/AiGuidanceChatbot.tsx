"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useChat } from "ai/react";
import { BreathingWidget } from "@/components/chat/widgets/BreathingWidget";
import { InteractiveQuizWidget } from "@/components/chat/widgets/InteractiveQuizWidget";
import { ReflectionTimerWidget } from "@/components/chat/widgets/ReflectionTimerWidget";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Memory / Persistent Context ---
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("thenahj_chat_history");
    if (saved) {
      try {
        setInitialMessages(JSON.parse(saved));
      } catch (e) {}
    } else {
      setInitialMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Peace be upon you! I am **TheNahj AI Guidance Assistant**. How can I help you today using the wisdom of Imam Ali (AS)?",
        }
      ]);
    }
    setIsLoaded(true);
  }, []);

  // --- 2. Vercel AI SDK Integration ---
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: "/api/ai/chat",
    initialMessages: initialMessages,
    onFinish: (message) => {
      // Save to localStorage when response finishes
      // We read the latest from setMessages by letting the effect below handle it
    },
  });

  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      localStorage.setItem("thenahj_chat_history", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // --- 3. Voice Input (Speech to Text) ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            handleInputChange({ target: { value: input + (input ? " " : "") + finalTranscript } } as any);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [input, handleInputChange]);

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

  // --- 4. Voice Output (Text to Speech) ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Clean up markdown before speaking
    const cleanText = text.replace(/[*#_]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    localStorage.removeItem("thenahj_chat_history");
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. Peace be upon you! How can I help you today?",
      }
    ]);
  };

  if (!isLoaded) return null;

  return (
    <>
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/90 to-gold px-4 py-3 shadow-[0_4px_25px_rgba(199,166,84,0.4)] text-black font-semibold text-xs tracking-wider transition-all hover:brightness-110"
      >
        <Sparkles size={16} className="animate-pulse" />
        <span className="hidden sm:inline">Ask Imam Ali's Wisdom</span>
      </motion.button>

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
                    <p className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online</p>
                    <button onClick={handleClearHistory} className="text-[10px] text-muted hover:text-red-400">Clear</button>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface-elevated hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs leading-relaxed scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {msg.role === "assistant" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20 mt-1">
                        <Bot size={12} />
                      </div>
                    )}
                    
                    {msg.role === "user" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-muted border border-border/40 mt-1">
                        <User size={12} />
                      </div>
                    )}

                    <div className="space-y-2 w-full">
                      <div className={`rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-gold text-black font-medium rounded-tr-sm" : "bg-surface-elevated/70 text-foreground border border-border/30 rounded-tl-sm"}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Render Tool Invocations */}
                        {msg.toolInvocations?.map((toolInvocation) => {
                          const { toolName, toolCallId, state } = toolInvocation;
                          if (state === 'result') {
                            const result = toolInvocation.result;
                            if (toolName === 'triggerBreathingWidget') {
                              return <div key={toolCallId} className="mt-3"><BreathingWidget title={result.title} /></div>;
                            }
                            if (toolName === 'triggerQuizWidget') {
                              return (
                                <div key={toolCallId} className="mt-3">
                                  <InteractiveQuizWidget 
                                    question={result.question} 
                                    options={result.options} 
                                    correctIndex={result.correctIndex} 
                                    explanation={result.explanation} 
                                  />
                                </div>
                              );
                            }
                            if (toolName === 'triggerReflectionWidget') {
                              return <div key={toolCallId} className="mt-3"><ReflectionTimerWidget prompt={result.prompt} /></div>;
                            }
                          } else {
                            return <div key={toolCallId} className="mt-2 text-gold/70 text-[10px] animate-pulse">Loading {toolName}...</div>;
                          }
                        })}
                      </div>

                      {/* Text-to-Speech Button for Assistant Messages */}
                      {msg.role === "assistant" && !msg.toolInvocations?.length && (
                        <div className="flex justify-start px-1">
                          <button 
                            onClick={() => speakText(msg.content)}
                            className="text-muted hover:text-gold transition-colors flex items-center gap-1 text-[10px]"
                            title="Read aloud"
                          >
                            {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-muted text-xs pl-8">
                  <Loader2 size={14} className="animate-spin text-gold" />
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => append({ role: 'user', content: prompt })}
                      className="rounded-full border border-border/40 bg-surface-elevated/50 px-2.5 py-1 text-[10px] text-foreground/80 hover:border-gold/40 hover:text-gold transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/20 bg-surface-alt/70 p-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  isListening 
                    ? "bg-red-500/20 text-red-500 border-red-500/50 animate-pulse" 
                    : "border-border/40 bg-surface-elevated text-gold hover:border-gold/50"
                }`}
                title="Voice Typing"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Imam Ali's wisdom..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
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
