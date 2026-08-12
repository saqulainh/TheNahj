"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { BreathingWidget } from "@/components/chat/widgets/BreathingWidget";
import { InteractiveQuizWidget } from "@/components/chat/widgets/InteractiveQuizWidget";
import { ReflectionTimerWidget } from "@/components/chat/widgets/ReflectionTimerWidget";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  widget?: any;
  relatedWisdom?: Array<{ title: string; slug: string; quote: string }>;
}

const PRESET_PROMPTS = [
  "How to deal with exam anxiety & stress?",
  "Overcoming laziness & building self-discipline",
  "Imam Ali's advice on time management",
  "Dealing with loneliness and distraction",
];

export function AiGuidanceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Peace be upon you! I am **TheNahj AI Guidance Assistant**. How can I help you navigate your studies, focus, or personal life today using the wisdom of Imam Ali (AS)?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const base64Data = result.split(",")[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type,
          url: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if ((!text && !selectedImage) || loading) return;

    const currentImage = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text || (currentImage ? "📷 [Uploaded Image for Analysis]" : ""),
      image: currentImage?.url,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      // Build conversation history for multi-turn context
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const payload: any = { message: text, history };
      if (currentImage) {
        payload.image = {
          mimeType: currentImage.mimeType,
          data: currentImage.data,
        };
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            content: data.error || "Sorry, I encountered an issue fetching advice. Please try again.",
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
            className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[calc(100vw-3rem)] max-w-[420px] flex-col rounded-3xl border border-gold/30 bg-surface/95 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 bg-surface-alt/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">TheNahj AI Guidance</h3>
                  <p className="text-[10px] text-muted">Imam Ali (AS) Wisdom Assistant</p>
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
                      {msg.image && (
                        <div className="mb-2 overflow-hidden rounded-xl border border-black/10 max-w-[200px]">
                          <img src={msg.image} alt="Uploaded attachment" className="w-full h-auto object-cover max-h-40" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

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
                  <span>Seeking wisdom...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Suggested Questions:</p>
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

            {/* Selected Image Preview Chip */}
            {selectedImage && (
              <div className="flex items-center gap-2 border-t border-border/20 bg-surface-alt/90 px-3 py-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gold/40">
                  <img src={selectedImage.url} alt="Attached preview" className="h-full w-full object-cover" />
                </div>
                <span className="text-[10px] text-gold font-medium truncate flex-1">Vision AI will analyze this photo</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="rounded-full p-1 text-muted hover:bg-surface-elevated hover:text-foreground"
                >
                  <X size={14} />
                </button>
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
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo for Vision AI analysis"
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/40 bg-surface-elevated text-gold transition-colors hover:border-gold/50 disabled:opacity-40"
              >
                <ImageIcon size={15} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Add optional message..." : "Ask or attach a photo..."}
                disabled={loading}
                className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || loading}
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
