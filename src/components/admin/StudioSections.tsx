"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, UploadCloud, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Narration } from "@/lib/content-schema";
import type { UseFormReturn } from "react-hook-form";

/* ── Shared input classes ── */
const inputCls = "w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/40 focus:outline-none transition-colors";
const textareaCls = `${inputCls} resize-y`;
const labelCls = "space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block";
const sectionCardCls = "rounded-2xl border border-border/30 bg-surface/65 overflow-hidden";

/* ── Collapsible Section Shell ── */
export function SectionShell({ number, title, subtitle, children, defaultOpen = false }: {
  number: number; title: string; subtitle: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={sectionCardCls}>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-surface-elevated/40 transition-colors">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-[11px] font-bold text-gold">{number}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted truncate">{subtitle}</p>
        </div>
        {open ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
      </button>
      {open && <div className="border-t border-border/20 px-5 py-5 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Field helpers ── */
export function TextField({ label, register, placeholder, dir }: {
  label: string; register: any; placeholder?: string; dir?: string;
}) {
  return (
    <label className={labelCls}>
      {label}
      <input {...register} className={`${inputCls} ${dir === "rtl" ? "font-arabic text-right" : ""}`} placeholder={placeholder} dir={dir} />
    </label>
  );
}

export function TextAreaField({ label, register, placeholder, rows = 3, dir, fontClass }: {
  label: string; register: any; placeholder?: string; rows?: number; dir?: string; fontClass?: string;
}) {
  return (
    <label className={labelCls}>
      {label}
      <textarea {...register} rows={rows} className={`${textareaCls} ${dir === "rtl" ? "text-right" : ""} ${fontClass || ""}`} placeholder={placeholder} dir={dir} />
    </label>
  );
}

/* ── Topic Selector (smart tag chips) ── */
export function TopicSelectorField({ selectedTags, onChange, category }: {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  category: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const { data: suggestedTags = [], isLoading } = useQuery({
    queryKey: ["tags-by-category", category],
    queryFn: async () => {
      const res = await fetch(`/api/tags?category=${encodeURIComponent(category)}`);
      const json = await res.json();
      return (json.tags ?? []) as string[];
    },
    staleTime: 30_000,
  });

  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned) return;
    if (selectedTags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) return;
    onChange([...selectedTags, cleaned]);
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }
    if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Suggestions that are not already selected
  const availableSuggestions = suggestedTags.filter(
    (tag) => !selectedTags.some((s) => s.toLowerCase() === tag.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <span className={labelCls}>Topic / Tags</span>

      {/* Selected tags as removable chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[36px] rounded-xl border border-border/40 bg-background px-2 py-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-gold/15 border border-gold/25 px-2.5 py-1 text-xs font-medium text-gold-light"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        <div className="flex-1 flex items-center min-w-[180px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? "Type a topic and press Enter..." : "Add more..."}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => {
                addTag(inputValue);
                setInputValue("");
              }}
              className="ml-2 shrink-0 inline-flex items-center gap-1 rounded-lg bg-gold/20 border border-gold/30 px-2.5 py-1 text-[11px] font-semibold text-gold-light hover:bg-gold/35 transition-all"
            >
              <Plus size={11} /> Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      </div>

      {/* Suggested tags from database */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted font-medium">Suggested topics for {category}</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/35 bg-surface/50 px-2.5 py-1 text-xs text-muted hover:border-gold/30 hover:text-gold-light hover:bg-gold/5 transition-all"
              >
                <Plus size={10} /> {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <p className="text-[10px] text-muted flex items-center gap-1.5">
          <Loader2 size={10} className="animate-spin" /> Loading suggested topics...
        </p>
      )}

      {!isLoading && suggestedTags.length === 0 && (
        <p className="text-[10px] text-muted">No existing topics for "{category}" yet. Type a new one above.</p>
      )}
    </div>
  );
}

/* ── Narrations Manager (Section 4) ── */
export function NarrationsManager({ form }: { form: UseFormReturn<any> }) {
  const narrations: Narration[] = form.watch("narrations") || [];

  const addNarration = () => {
    const current = form.getValues("narrations") || [];
    form.setValue("narrations", [...current, {
      id: `narr-${Date.now()}`, narration: "", narrator: "", source: "", explanation: "",
    }], { shouldDirty: true });
  };

  const removeNarration = (id: string) => {
    const current: Narration[] = form.getValues("narrations") || [];
    form.setValue("narrations", current.filter((n) => n.id !== id), { shouldDirty: true });
  };

  const updateNarration = (id: string, field: keyof Narration, value: string) => {
    const current: Narration[] = form.getValues("narrations") || [];
    form.setValue("narrations", current.map((n) => n.id === id ? { ...n, [field]: value } : n), { shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      {narrations.map((n, i) => (
        <div key={n.id} className="rounded-xl border border-border/30 bg-background/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Narration {i + 1}</span>
            <button type="button" onClick={() => removeNarration(n.id)} className="rounded-full p-1 text-muted hover:text-red-400">
              <Trash2 size={12} />
            </button>
          </div>
          <textarea value={n.narration} onChange={(e) => updateNarration(n.id, "narration", e.target.value)}
            rows={2} className={textareaCls} placeholder="Narration text..." />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={n.narrator} onChange={(e) => updateNarration(n.id, "narrator", e.target.value)}
              className={inputCls} placeholder="Narrator" />
            <input value={n.source} onChange={(e) => updateNarration(n.id, "source", e.target.value)}
              className={inputCls} placeholder="Source" />
          </div>
          <textarea value={n.explanation} onChange={(e) => updateNarration(n.id, "explanation", e.target.value)}
            rows={2} className={textareaCls} placeholder="Explanation of this narration..." />
        </div>
      ))}
      <button type="button" onClick={addNarration}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gold/30 py-3 text-xs font-semibold text-gold hover:bg-gold/5 transition-colors">
        <Plus size={14} /> Add Narration
      </button>
    </div>
  );
}

/* ── Media Picker (click-to-assign) ── */
export function MediaPickerField({ label, currentUrl, onSelect, onUpload, isUploading }: {
  label: string; currentUrl: string | null; onSelect: () => void; onUpload: (file: File) => void; isUploading: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{label}</span>
      {currentUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border/30 h-28 w-full group">
          <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
          <button 
            type="button" 
            onClick={() => {
              onSelect();
              fileInputRef.current?.click();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium"
          >
            {isUploading ? "Uploading..." : "Change Image"}
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }} 
          />
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center h-28 w-full rounded-xl border border-dashed border-border/40 bg-background p-4 text-center hover:border-gold/30 transition-colors">
          {isUploading ? <Loader2 className="animate-spin mb-1" size={16} /> : <UploadCloud className="mb-1" size={16} />}
          <span className="text-[11px] text-muted">{isUploading ? "Uploading..." : "Upload or drop image"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }} />
        </label>
      )}
    </div>
  );
}

/* ── Live Card Preview ── */
export function WisdomCardPreview({ data }: {
  data: { arabic_text: string; urdu_translation: string; english_translation: string; source: string; category: string; reading_time: number; hero_image: string | null; };
}) {
  return (
    <div className="wisdom-classic-card group relative overflow-hidden" style={{ minHeight: 320 }}>
      {data.hero_image && (
        <div className="absolute inset-0 z-0">
          <img src={data.hero_image} alt="" className="h-full w-full object-cover opacity-15 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex flex-col justify-center py-5 text-center flex-grow">
        {data.arabic_text ? (
          <p className="wisdom-classic-title text-[1.5rem] leading-[2.1] font-arabic text-foreground" dir="rtl" lang="ar">
            {data.arabic_text}
          </p>
        ) : (
          <p className="text-sm italic text-muted/50">Arabic text will appear here...</p>
        )}
        {data.urdu_translation && (
          <p className="wisdom-classic-subtitle font-urdu text-[13px] leading-[1.95] text-foreground/80 mt-2" dir="rtl">
            {data.urdu_translation.length > 120 ? data.urdu_translation.slice(0, 120) + "..." : data.urdu_translation}
          </p>
        )}
        {data.english_translation && (
          <p className="wisdom-classic-translation text-[12.5px] leading-relaxed text-secondary/80 mt-2">
            {data.english_translation.length > 140 ? data.english_translation.slice(0, 140) + "..." : data.english_translation}
          </p>
        )}
      </div>
      <div className="relative z-10 mt-auto pt-3 text-center">
        <div className="wisdom-classic-indicator text-foreground/90">
          <span className="wisdom-classic-indicator-amount">{data.category || "Wisdom"}</span>
          {data.source && <> / <span className="wisdom-classic-indicator-percentage">{data.source}</span></>}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted">{data.reading_time || 1} min read</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-semibold text-gold">
          <span>Read Reflection</span><span>→</span>
        </div>
      </div>
    </div>
  );
}
