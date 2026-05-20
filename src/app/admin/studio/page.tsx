"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Save, Loader2, RefreshCw, History, RotateCcw, Bookmark, Share2 } from "lucide-react";
import { wisdomArticleSchema, unifiedCategories } from "@/lib/content-schema";
import { useContentStudioStore } from "@/lib/stores/contentStudioStore";
import {
  SectionShell, TextField, TextAreaField,
  NarrationsManager, MediaPickerField, WisdomCardPreview,
} from "@/components/admin/StudioSections";

const formSchema = wisdomArticleSchema.extend({ tagsInput: z.string().optional() });
type FormValues = z.infer<typeof formSchema>;

interface MediaItem {
  id: string; title: string; url: string; mimeType: string; size: number;
  variants?: Array<{ width: number; url: string; format: string; fileName: string }>;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

function estimateReadingTime(vals: FormValues): number {
  const allText = [
    vals.arabic_text, vals.urdu_translation, vals.english_translation,
    vals.main_explanation, vals.detailed_explanation, vals.tafseer, vals.historical_context,
    vals.current_issues, vals.youth_relevance, vals.student_relevance, vals.practical_application,
    vals.reflection_questions, vals.action_steps, vals.personal_reflection,
    vals.summary, vals.closing_reflection,
    ...(vals.narrations || []).map((n) => `${n.narration} ${n.explanation}`),
  ].filter(Boolean).join(" ");
  const words = allText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

async function saveContent(payload: FormValues) {
  const res = await fetch("/api/content", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
  return json.data;
}

export default function ContentStudioPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { draft, setDraft, resetDraft } = useContentStudioStore();
  const [isDirty, setIsDirty] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"hero" | "featured" | "sidebar" | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSyncKeyRef = useRef<string>("");
  const setDraftRef = useRef(setDraft);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ...draft,
      category: (unifiedCategories.includes(draft.category as any) ? draft.category : "Imam Ali Says") as any,
      layout_type: "wisdom-editorial",
      tagsInput: draft.tags.join(", "),
    } as any,
  });

  const mediaQuery = useQuery({
    queryKey: ["media"],
    queryFn: async () => { const res = await fetch("/api/media"); const json = await res.json(); return (json.items ?? []) as MediaItem[]; },
  });

  const values = form.watch();

  const contentMutation = useMutation({
    mutationFn: saveContent,
    onMutate: async () => { setIsDirty(false); await queryClient.cancelQueries({ queryKey: ["content-list"] }); },
    onSuccess: () => {
      toast.success("Wisdom saved", { description: "Article saved to the editorial engine." });
      queryClient.invalidateQueries({ queryKey: ["content-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-content"] });
    },
    onError: (error) => {
      setIsDirty(true);
      toast.error("Save failed", { description: error instanceof Error ? error.message : "Request failed" });
    },
  });

  const mutateRef = useRef(contentMutation.mutate);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData(); fd.append("file", file); fd.append("title", file.name);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
      return json.item as MediaItem;
    },
    onSuccess: (item) => {
      toast.success("Image uploaded", { description: item.title });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (mediaTarget === "hero") { form.setValue("hero_image", item.url, { shouldDirty: true }); }
      else if (mediaTarget === "featured") { form.setValue("featured_image", item.url, { shouldDirty: true }); }
      else if (mediaTarget === "sidebar") { form.setValue("sidebar_banner", item.url, { shouldDirty: true }); }
      setMediaTarget(null);
    },
    onError: (error) => { toast.error("Upload failed", { description: error instanceof Error ? error.message : "Could not upload" }); },
  });

  useEffect(() => { setDraftRef.current = setDraft; }, [setDraft]);
  useEffect(() => { mutateRef.current = contentMutation.mutate; }, [contentMutation.mutate]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && unifiedCategories.includes(cat as any)) {
      form.setValue("category", cat as any, { shouldDirty: false, shouldValidate: true });
    }
  }, [form, searchParams]);

  /* ── Auto-sync draft to store + autosave ── */
  useEffect(() => {
    const sub = form.watch((next) => {
      if (!next) return;
      const key = JSON.stringify(next);
      if (key !== draftSyncKeyRef.current) {
        draftSyncKeyRef.current = key;
        setDraftRef.current({
          ...next,
          tags: (next.tagsInput || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        } as any);
      }
      setIsDirty(true);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        if (!form.formState.isValid) return;
        const payload = {
          ...next,
          tags: (next.tagsInput || "").split(",").map((t: string) => t.trim()).filter(Boolean),
          slug: slugify(next.slug || next.title || "article"),
          reading_time: estimateReadingTime(next as any),
        } as FormValues;
        mutateRef.current(payload);
      }, 1500);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const handlePublish = form.handleSubmit(
    (input) => {
      contentMutation.mutate({
        ...input,
        tags: (input.tagsInput || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        slug: slugify(input.slug || input.title),
        reading_time: estimateReadingTime(input),
      } as unknown as FormValues);
    },
    (errors) => {
      const msg = Object.entries(errors).map(([f, e]) => `${f}: ${(e as any)?.message || "Invalid"}`).join(", ");
      toast.error("Validation failed", { description: msg });
    }
  );

  const mediaCards = useMemo(() => mediaQuery.data || [], [mediaQuery.data]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Wisdom Editorial Studio</h1>
          <p className="mt-2 text-sm text-muted">Structured content engine for multilingual wisdom publishing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { resetDraft(); form.reset(); toast.success("Draft cleared"); }}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs text-muted hover:text-foreground">
            <RotateCcw size={13} /> New
          </button>
          <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["media"] })}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs text-muted hover:text-foreground">
            <RefreshCw size={13} /> Refresh
          </button>
          <button type="submit" form="wisdom-studio-form" disabled={contentMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/20 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold/30 disabled:opacity-60">
            {contentMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {contentMutation.isPending ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Two column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── LEFT: Editor Sections ── */}
        <form id="wisdom-studio-form" onSubmit={handlePublish} className="space-y-4">

          {/* Section 1: Basic Information */}
          <SectionShell number={1} title="Basic Information" subtitle="Title, slug, category, status, and tags" defaultOpen>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" register={form.register("title")} placeholder="The Value of Youth and Health" />
              <TextField label="Slug" register={form.register("slug")} placeholder="value-of-youth-and-health" />
            </div>
            <TextAreaField label="Excerpt" register={form.register("excerpt")} rows={2} placeholder="A brief summary of this wisdom..." />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block">
                Category
                <select {...form.register("category")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm">
                  {unifiedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block">
                Status
                <select {...form.register("status")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block">
                Schedule
                <input type="datetime-local" {...form.register("schedule_publish_at")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
              </label>
            </div>
            <TextField label="Tags (comma separated)" register={form.register("tagsInput")} placeholder="discipline, youth, health" />
          </SectionShell>

          {/* Section 2: Original Wisdom Content */}
          <SectionShell number={2} title="Original Wisdom Content" subtitle="Arabic, Urdu, English text and source references" defaultOpen>
            <TextAreaField label="Arabic Original Text" register={form.register("arabic_text")} rows={4} dir="rtl" fontClass="font-arabic" placeholder="اكتب النص العربي هنا..." />
            <TextAreaField label="Urdu Translation" register={form.register("urdu_translation")} rows={3} dir="rtl" fontClass="font-urdu" placeholder="اردو ترجمہ یہاں لکھیں..." />
            <TextAreaField label="English Translation" register={form.register("english_translation")} rows={3} placeholder="Write the English translation..." />
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Source" register={form.register("source")} placeholder="Ghurar al-Hikam" />
              <TextField label="Source Number" register={form.register("source_number")} placeholder="Hadith #42" />
              <TextField label="Book Name" register={form.register("book_name")} placeholder="Nahjul Balagha" />
            </div>
          </SectionShell>

          {/* Section 3: Explanation Area */}
          <SectionShell number={3} title="Explanation Area" subtitle="Main explanation, tafseer, and historical context">
            <TextAreaField label="Main Explanation" register={form.register("main_explanation")} rows={4} placeholder="Brief explanation of this wisdom..." />
            <TextAreaField label="Detailed Explanation" register={form.register("detailed_explanation")} rows={5} placeholder="In-depth analysis..." />
            <TextAreaField label="Tafseer" register={form.register("tafseer")} rows={4} placeholder="Scholarly tafseer and commentary..." />
            <TextAreaField label="Historical Context" register={form.register("historical_context")} rows={3} placeholder="When and why this was said..." />
          </SectionShell>

          {/* Section 4: Related Narrations */}
          <SectionShell number={4} title="Related Narrations" subtitle="Add unlimited supporting hadith and narrations">
            <NarrationsManager form={form} />
          </SectionShell>

          {/* Section 5: Modern Relevance */}
          <SectionShell number={5} title="Modern Relevance" subtitle="How this wisdom applies to today's youth and students">
            <TextAreaField label="Current Issues" register={form.register("current_issues")} rows={3} placeholder="How this relates to current issues..." />
            <TextAreaField label="Youth Relevance" register={form.register("youth_relevance")} rows={3} placeholder="Why this matters for young people..." />
            <TextAreaField label="Student Relevance" register={form.register("student_relevance")} rows={3} placeholder="Application for students..." />
            <TextAreaField label="Practical Application" register={form.register("practical_application")} rows={3} placeholder="Actionable steps from this wisdom..." />
          </SectionShell>

          {/* Section 6: Reflection */}
          <SectionShell number={6} title="Reflection" subtitle="Questions, action steps, and personal reflection">
            <TextAreaField label="Reflection Questions" register={form.register("reflection_questions")} rows={3} placeholder="Questions for the reader to ponder..." />
            <TextAreaField label="Action Steps" register={form.register("action_steps")} rows={3} placeholder="Steps the reader can take..." />
            <TextAreaField label="Personal Reflection" register={form.register("personal_reflection")} rows={3} placeholder="Your personal reflection on this wisdom..." />
          </SectionShell>

          {/* Section 7: Conclusion */}
          <SectionShell number={7} title="Conclusion" subtitle="Summary and closing reflection">
            <TextAreaField label="Summary" register={form.register("summary")} rows={3} placeholder="Summarize the key takeaways..." />
            <TextAreaField label="Closing Reflection" register={form.register("closing_reflection")} rows={3} placeholder="Final thoughts to leave the reader with..." />
          </SectionShell>

          {/* Section 8: SEO */}
          <SectionShell number={8} title="SEO" subtitle="Search engine optimization metadata">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="SEO Title" register={form.register("seo_title")} placeholder="Custom SEO title..." />
              <TextField label="SEO Description" register={form.register("seo_description")} placeholder="Meta description for search..." />
            </div>
          </SectionShell>

          {/* Section 9: Media */}
          <SectionShell number={9} title="Media" subtitle="Upload images — no URL inputs, media library only">
            <div className="grid gap-4 md:grid-cols-3">
              <MediaPickerField label="Hero Image" currentUrl={values.hero_image || null}
                onSelect={() => setMediaTarget("hero")} isUploading={uploadMutation.isPending && mediaTarget === "hero"}
                onUpload={(file) => { setMediaTarget("hero"); uploadMutation.mutate(file); }} />
              <MediaPickerField label="Card Background" currentUrl={values.featured_image || null}
                onSelect={() => setMediaTarget("featured")} isUploading={uploadMutation.isPending && mediaTarget === "featured"}
                onUpload={(file) => { setMediaTarget("featured"); uploadMutation.mutate(file); }} />
              <MediaPickerField label="Sidebar Banner" currentUrl={values.sidebar_banner || null}
                onSelect={() => setMediaTarget("sidebar")} isUploading={uploadMutation.isPending && mediaTarget === "sidebar"}
                onUpload={(file) => { setMediaTarget("sidebar"); uploadMutation.mutate(file); }} />
            </div>

            {/* Media Library */}
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Media Library — click to assign</p>
              <div className="max-h-48 space-y-2 overflow-auto">
                {mediaQuery.isLoading && <p className="text-xs text-muted">Loading media...</p>}
                {mediaCards.filter((m) => m.mimeType.startsWith("image/")).map((item) => (
                  <button key={item.id} type="button"
                    onClick={() => {
                      if (mediaTarget) {
                        const field = mediaTarget === "hero" ? "hero_image" : mediaTarget === "featured" ? "featured_image" : "sidebar_banner";
                        form.setValue(field, item.url, { shouldDirty: true });
                        toast.success(`${mediaTarget} image set`, { description: item.title });
                        setMediaTarget(null);
                      } else {
                        form.setValue("hero_image", item.url, { shouldDirty: true });
                        form.setValue("featured_image", item.url, { shouldDirty: true });
                        toast.success("Image applied", { description: item.title });
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/30 bg-background p-2 text-left hover:border-gold/35">
                    <img src={item.url} alt={item.title} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted">{Math.round(item.size / 1024)} KB</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SectionShell>

          {/* Status bar */}
          <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 px-4 py-3 text-xs text-muted">
            <span>{isDirty ? "● Unsaved changes" : "✓ All changes saved"}</span>
            <span>{estimateReadingTime(values as any)} min read</span>
          </div>
        </form>

        {/* ── RIGHT: Preview + History ── */}
        <aside className="space-y-5">
          {/* Live Wisdom Card Preview */}
          <section className="rounded-2xl border border-border/30 bg-surface/65 p-5">
            <h2 className="text-sm font-medium text-foreground mb-1">Live Card Preview</h2>
            <p className="text-[11px] text-muted mb-4">Auto-generated from your content in real time.</p>
            <WisdomCardPreview data={{
              arabic_text: values.arabic_text || "",
              urdu_translation: values.urdu_translation || "",
              english_translation: values.english_translation || "",
              source: values.source || "",
              category: values.category || "",
              reading_time: estimateReadingTime(values as any),
              hero_image: values.hero_image || null,
            }} />
          </section>

          {/* Revision History */}
          <section className="rounded-2xl border border-border/30 bg-surface/65 p-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <History size={13} /> Revision History
            </h2>
            <p className="mt-1 text-xs text-muted">Restore a previous snapshot then save to publish.</p>
            <div className="mt-3 max-h-56 space-y-2 overflow-auto">
              <p className="text-xs text-muted">Save to start tracking history.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
