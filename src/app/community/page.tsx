"use client";

import { useState, useEffect } from "react";
import { Users, Heart, Send, Sparkles, MessageCircleHeart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityWallPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [newTopic, setNewTopic] = useState("General Reflection");
  const [posting, setPosting] = useState(false);
  const [inspiredIds, setInspiredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      if (data.success) setReflections(data.reflections);
    } catch (e) {
      console.error("Failed to load community reflections", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim().length < 10 || posting) return;

    setPosting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText, topic: newTopic }),
      });
      const data = await res.json();
      if (data.success) {
        setReflections([data.reflection, ...reflections]);
        setNewText("");
      }
    } catch (e) {
      console.error("Failed to post", e);
    } finally {
      setPosting(false);
    }
  };

  const handleInspire = async (id: string) => {
    if (inspiredIds.has(id)) return; // Already inspired locally

    // Optimistic update
    setInspiredIds(new Set(inspiredIds).add(id));
    setReflections(reflections.map(r => r.id === id ? { ...r, inspiredCount: r.inspiredCount + 1 } : r));

    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inspire", id }),
      });
    } catch (e) {
      console.error("Failed to update inspire count", e);
    }
  };

  const topics = ["Patience", "Anxiety", "Focus", "Comparison", "General Reflection"];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-gold font-bold uppercase tracking-widest text-xs mx-auto w-max px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5">
          <Users size={14} /> Global Community Wall
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Anonymous Reflections
        </h1>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          Share a 1-sentence reflection on how Imam Ali's (AS) wisdom helped you today. 
          Your anonymous words might be exactly what another soul needs to read.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Post Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-surface-alt via-surface-elevated to-surface-alt p-6 shadow-2xl sticky top-24">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-gold" /> Post a Reflection
            </h2>
            
            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1.5">Topic</label>
                <select 
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs text-foreground focus:border-gold/60 focus:outline-none"
                >
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1.5">Your Reflection (Max 200 chars)</label>
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value.slice(0, 200))}
                  placeholder="Today I learned..."
                  rows={4}
                  className="w-full rounded-xl border border-border/40 bg-background px-4 py-3 text-sm text-foreground resize-none focus:border-gold/60 focus:outline-none"
                />
                <div className="text-right text-[10px] text-muted mt-1">{newText.length}/200</div>
              </div>

              <button
                type="submit"
                disabled={newText.length < 10 || posting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-xs font-bold text-black shadow-lg hover:bg-gold-light hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Share Anonymously</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <h3 className="text-sm font-bold text-foreground">Recent Community Thoughts</h3>
            <span className="text-xs text-muted flex items-center gap-1"><MessageCircleHeart size={14} /> Live Feed</span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center text-gold"><Loader2 size={24} className="animate-spin" /></div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-20 text-muted text-sm">Be the first to share a reflection!</div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reflections.map((ref) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/30 bg-surface-alt/70 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-gold/10 text-[10px] font-bold uppercase tracking-widest text-gold">
                        {ref.topic}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm md:text-base text-foreground/90 font-medium leading-relaxed">
                      "{ref.text}"
                    </p>

                    <div className="flex items-center justify-end pt-2 border-t border-border/20">
                      <button
                        onClick={() => handleInspire(ref.id)}
                        disabled={inspiredIds.has(ref.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          inspiredIds.has(ref.id) 
                            ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                            : "bg-surface-elevated text-muted border border-border/40 hover:text-red-400 hover:border-red-500/40"
                        }`}
                      >
                        <Heart size={14} fill={inspiredIds.has(ref.id) ? "currentColor" : "none"} />
                        <span>{ref.inspiredCount} {ref.inspiredCount === 1 ? "Soul Inspired" : "Souls Inspired"}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
