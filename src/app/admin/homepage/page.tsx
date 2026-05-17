"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Check, Loader2 } from "lucide-react";

export default function HomepageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [heroForm, setHeroForm] = useState({
    headline: "",
    subtext: "",
    ctaText: "",
    ctaLink: "",
    bgImage: "",
    mobileBgImage: "",
    bgVideo: "",
    bgMode: "video" as "image" | "video",
    focalPoint: "center",
    overlayBrightness: 60,
    overlayBlur: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [fullConfig, setFullConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        setFullConfig(data);
        setBlocks(data.homepage.blocks);
        setHeroForm(data.homepage.hero);
      } catch (error) {
        console.error("Failed to load CMS config", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving...");
    
    const newConfig = {
      ...fullConfig,
      homepage: {
        hero: heroForm,
        blocks: blocks
      }
    };

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      
      if (res.ok) {
        setStatus("Homepage successfully updated!");
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("Failed to save.");
      }
    } catch (error) {
      setStatus("Error saving.");
    }
  };

  const toggleBlock = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Homepage Management</h1>
        <p className="mt-2 text-sm text-muted">Dynamically manage hero content, featured sections, and block ordering.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">Hero Section Content</h2>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-gold-muted">Hero Heading</span>
                  <input
                    type="text"
                    value={heroForm.headline}
                    onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                  />
                </label>
                
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-gold-muted">Hero Subheading</span>
                  <textarea
                    value={heroForm.subtext}
                    onChange={(e) => setHeroForm({ ...heroForm, subtext: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                  />
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Primary CTA Text</span>
                    <input
                      type="text"
                      value={heroForm.ctaText}
                      onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Primary CTA Link</span>
                    <input
                      type="text"
                      value={heroForm.ctaLink}
                      onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Background Mode</span>
                    <select
                      value={heroForm.bgMode}
                      onChange={(e) => setHeroForm({ ...heroForm, bgMode: e.target.value as "image" | "video" })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    >
                      <option value="image">Cinematic Image</option>
                      <option value="video">Cinematic Video</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Focal Point (Image Only)</span>
                    <select
                      value={heroForm.focalPoint}
                      onChange={(e) => setHeroForm({ ...heroForm, focalPoint: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                </div>

                {heroForm.bgMode === "image" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-gold-muted">Desktop Image (URL)</span>
                      <input
                        type="text"
                        value={heroForm.bgImage}
                        onChange={(e) => setHeroForm({ ...heroForm, bgImage: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                        placeholder="/hero-bg.jpg"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-gold-muted">Mobile Image (URL)</span>
                      <input
                        type="text"
                        value={heroForm.mobileBgImage}
                        onChange={(e) => setHeroForm({ ...heroForm, mobileBgImage: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                        placeholder="/hero-bg-mobile.jpg"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Background Video (URL)</span>
                    <input
                      type="text"
                      value={heroForm.bgVideo}
                      onChange={(e) => setHeroForm({ ...heroForm, bgVideo: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                      placeholder="https://.../video.mp4"
                    />
                  </label>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Overlay Brightness (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={heroForm.overlayBrightness}
                      onChange={(e) => setHeroForm({ ...heroForm, overlayBrightness: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-gold-muted">Overlay Blur (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={heroForm.overlayBlur}
                      onChange={(e) => setHeroForm({ ...heroForm, overlayBlur: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gold/15 px-6 py-3 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
              {status && (
                <span className="text-sm text-gold-muted animate-in fade-in slide-in-from-left-2">
                  {status}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar Blocks Manager */}
        <div>
          <div className="rounded-xl border border-border bg-surface p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Section Ordering</h2>
              <button className="p-1 text-muted hover:text-foreground transition-colors" title="Add Block">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted mb-6">
              Drag to reorder. Toggle to hide/show sections on the live homepage.
            </p>
            
            <div className="space-y-3">
              {blocks.map((block) => (
                <div 
                  key={block.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${block.enabled ? 'border-border bg-background' : 'border-transparent bg-background/50 opacity-60'}`}
                >
                  <button className="cursor-grab text-muted hover:text-foreground p-1 shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium flex-1">{block.title}</span>
                  <button 
                    onClick={() => toggleBlock(block.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${block.enabled ? 'bg-gold/30' : 'bg-surface border border-border'}`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-gold-light transition-transform ${block.enabled ? 'translate-x-5' : 'translate-x-0 bg-muted'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
