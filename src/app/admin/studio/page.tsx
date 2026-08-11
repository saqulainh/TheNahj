"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Save, Loader2, RefreshCw, History, RotateCcw, Image as ImageIcon, Sparkles } from "lucide-react";
import ImageCropModal from "@/components/admin/ImageCropModal";
import { wisdomArticleSchema, unifiedCategories } from "@/lib/content-schema";
import { createInitialDraft, useContentStudioStore } from "@/lib/stores/contentStudioStore";
import { SECTION_TAXONOMY, getThemesForSection, getTopicsForSection, normalizeThemeForSection } from "@/lib/taxonomy";
import {
  SectionShell, TextField, TextAreaField,
  NarrationsManager, MediaPickerField, WisdomCardPreview,
  TopicSelectorField,
} from "@/components/admin/StudioSections";
import FocalPicker from "@/components/admin/FocalPicker";
import { ImageRole } from "@/components/ui/ImageRole";

const formSchema = wisdomArticleSchema.extend({ tagsInput: z.string().optional() });
type FormValues = z.infer<typeof formSchema>;

interface MediaItem {
  id: string; title: string; url: string; mimeType: string; size: number;
  variants?: Array<{ width: number; url: string; format: string; fileName: string }>;
}
type MediaSlotKey = "hero" | "featured" | "sidebar";

interface CropState {
  imageUrl: string;
  targetSlot: MediaSlotKey;
  aspectRatio: number;
  label: string;
  /** Original file to re-upload as cropped version */
  originalFileName: string;
}

const MEDIA_SLOT_CONFIG: Record<MediaSlotKey, { field: "hero_image" | "featured_image" | "sidebar_banner"; aspectRatio: number; label: string; recommendedLabel: string }> = {
  hero: { field: "hero_image", aspectRatio: 16 / 9, label: "Hero Image", recommendedLabel: "16:9 (e.g. 1600×900). Full-width hero banner." },
  featured: { field: "featured_image", aspectRatio: 1, label: "Card Background", recommendedLabel: "1:1 (e.g. 1200×1200). Card/grid previews." },
  sidebar: { field: "sidebar_banner", aspectRatio: 3 / 4, label: "Sidebar Banner", recommendedLabel: "3:4 (e.g. 1200×1600). Tall sidebar banners." },
};

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
    ...(vals.narrations || []).map((n: any) => `${(n.translation || n.urdu || n.arabic || "")} ${n.explanation || ""}`),
  ].filter(Boolean).join(" ");
  const words = allText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function getPublishReadinessIssues(vals: FormValues): string[] {
  const issues: string[] = [];
  const structuredCategory = Boolean(SECTION_TAXONOMY[vals.category || ""]);

  if (!vals.title?.trim()) issues.push("Title is required");
  if (!vals.slug?.trim()) issues.push("Slug is required");
  if (!vals.excerpt?.trim()) issues.push("Excerpt is required");

  if (structuredCategory) {
    if (!vals.theme?.trim()) issues.push("Theme mapping is required");
    if (!vals.topic?.trim()) issues.push("Topic mapping is required");
  }

  if (!vals.arabic_text?.trim()) issues.push("Arabic text is required");
  if (!vals.urdu_translation?.trim()) issues.push("Urdu translation is required");
  if (!vals.english_translation?.trim()) issues.push("English translation is required");
  if (!vals.source?.trim()) issues.push("Source is required");
  if (!vals.main_explanation?.trim()) issues.push("Main explanation is required");
  if (!vals.current_issues?.trim()) issues.push("Current issues is required");
  if (!vals.reflection_questions?.trim()) issues.push("Reflection questions are required");
  if (!vals.action_steps?.trim()) issues.push("Action steps are required");
  if (!vals.summary?.trim()) issues.push("Summary is required");

  if (!vals.hero_image?.trim()) issues.push("Hero image is required");
  if (!vals.featured_image?.trim()) issues.push("Card background image is required");

  return issues;
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
  const [uploadingSlots, setUploadingSlots] = useState<Record<MediaSlotKey, boolean>>({ hero: false, featured: false, sidebar: false });
  const [cropState, setCropState] = useState<CropState | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSyncKeyRef = useRef<string>("");
  const setDraftRef = useRef(setDraft);
  const isHydratingRef = useRef(false);

  const buildFreshFormValues = (category?: string) => {
    const nextCategory = unifiedCategories.includes(category as any) ? category : "Imam Ali Says";
    const fresh = createInitialDraft(nextCategory as string);
    return {
      ...fresh,
      category: nextCategory as any,
      layout_type: "wisdom-editorial",
      tagsInput: "",
    } as any;
  };

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
    onSuccess: (data) => {
      toast.success("Wisdom saved", { description: "Article saved to the editorial engine." });
      queryClient.invalidateQueries({ queryKey: ["content-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-content"] });
      if (data) {
        isHydratingRef.current = true;
        if (data.id) {
          form.setValue("id", data.id, { shouldDirty: false });
        }
        if (data.slug) {
          form.setValue("slug", data.slug, { shouldDirty: false });
          const params = new URLSearchParams(window.location.search);
          if (params.get("slug") !== data.slug) {
            params.set("slug", data.slug);
            params.delete("new");
            window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
          }
        }
        setDraft({ ...data, tags: data.tags || [] } as any);
        draftSyncKeyRef.current = JSON.stringify(form.getValues());
        setIsDirty(false);
        isHydratingRef.current = false;
      }
    },
    onError: (error) => {
      setIsDirty(true);
      toast.error("Save failed", { description: error instanceof Error ? error.message : "Request failed" });
    },
  });

  const mutateRef = useRef(contentMutation.mutate);

  /** Upload a file to /api/media and return the MediaItem */
  const uploadFileToServer = useCallback(async (file: File | Blob, title: string): Promise<MediaItem> => {
    const fd = new FormData();
    fd.append("file", file instanceof File ? file : new File([file], title, { type: file.type }));
    fd.append("title", title);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
    return json.item as MediaItem;
  }, []);

  /** Per-slot upload handler: uploads file, then opens crop modal */
  const handleSlotUpload = useCallback(async (slot: MediaSlotKey, file: File) => {
    const config = MEDIA_SLOT_CONFIG[slot];
    setUploadingSlots((prev) => ({ ...prev, [slot]: true }));
    try {
      const item = await uploadFileToServer(file, file.name);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      // Open crop modal with the uploaded image URL
      setCropState({
        imageUrl: item.url,
        targetSlot: slot,
        aspectRatio: config.aspectRatio,
        label: config.label,
        originalFileName: file.name,
      });
    } catch (error) {
      toast.error("Upload failed", { description: error instanceof Error ? error.message : "Could not upload" });
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [slot]: false }));
    }
  }, [uploadFileToServer, queryClient]);

  /** Called when user confirms the crop — re-uploads the cropped blob */
  const handleCropConfirm = useCallback(async (croppedBlob: Blob) => {
    if (!cropState) return;
    const { targetSlot, originalFileName } = cropState;
    const config = MEDIA_SLOT_CONFIG[targetSlot];
    setCropState(null);
    setUploadingSlots((prev) => ({ ...prev, [targetSlot]: true }));
    try {
      const croppedName = `cropped-${originalFileName.replace(/\.[^.]+$/, "")}.webp`;
      const item = await uploadFileToServer(croppedBlob, croppedName);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      form.setValue(config.field, item.url, { shouldDirty: true });
      toast.success(`${config.label} cropped & set`, { description: croppedName });
    } catch (error) {
      toast.error("Crop upload failed", { description: error instanceof Error ? error.message : "Could not upload cropped image" });
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [targetSlot]: false }));
    }
  }, [cropState, uploadFileToServer, queryClient, form]);

  /** Called when user skips cropping — use the original uploaded URL directly */
  const handleCropSkip = useCallback(() => {
    if (!cropState) return;
    const { targetSlot, imageUrl } = cropState;
    const config = MEDIA_SLOT_CONFIG[targetSlot];
    form.setValue(config.field, imageUrl, { shouldDirty: true });
    toast.success(`${config.label} set`, { description: "Original image applied without cropping." });
    setCropState(null);
  }, [cropState, form]);

  /** Assign a media library item to a specific slot */
  const assignMediaToSlot = useCallback((slot: MediaSlotKey, url: string, title: string) => {
    const config = MEDIA_SLOT_CONFIG[slot];
    setCropState({
      imageUrl: url,
      targetSlot: slot,
      aspectRatio: config.aspectRatio,
      label: config.label,
      originalFileName: title,
    });
  }, []);

  useEffect(() => { setDraftRef.current = setDraft; }, [setDraft]);
  useEffect(() => { mutateRef.current = contentMutation.mutate; }, [contentMutation.mutate]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && unifiedCategories.includes(cat as any)) {
      form.setValue("category", cat as any, { shouldDirty: false, shouldValidate: true });
    }
  }, [form, searchParams]);

  // Force a clean editor state when explicitly opening a new post.
  useEffect(() => {
    const isNew = searchParams.get("new") === "1";
    if (!isNew) return;

    const cat = searchParams.get("category") || "Imam Ali Says";
    const nextValues = buildFreshFormValues(cat);

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    resetDraft();
    setDraft({ category: nextValues.category, tags: [] } as any);
    draftSyncKeyRef.current = "";
    form.reset(nextValues);
    setIsDirty(false);
    toast.success("Fresh editor ready", { description: "New post form has been reset." });
  }, [form, resetDraft, searchParams, setDraft]);

  // When opening studio with ?slug=..., hydrate form from that article.
  useEffect(() => {
    const slug = searchParams.get("slug");
    if (!slug) return;

    let cancelled = false;
    isHydratingRef.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/content?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        const item = (json.items || [])[0];
        if (!res.ok || !item || cancelled) return;

        const nextValues = {
          ...buildFreshFormValues(item.category),
          ...item,
          tagsInput: (item.tags || []).join(", "),
        };

        draftSyncKeyRef.current = "";
        form.reset(nextValues as any);
        setDraft({ ...item, tags: item.tags || [] } as any);
        setIsDirty(false);
      } catch (e) {
        // Ignore load errors and keep current draft state.
      } finally {
        isHydratingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      isHydratingRef.current = false;
    };
  }, [form, searchParams, setDraft]);

  /* ── Auto-sync draft to store + autosave ── */
  useEffect(() => {
    const sub = form.watch((next) => {
      if (!next) return;
      if (isHydratingRef.current) return;
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
      if (input.status === "published") {
        const issues = getPublishReadinessIssues(input);
        if (issues.length > 0) {
          toast.error("Cannot publish yet", {
            description: `Resolve required items: ${issues.slice(0, 3).join(", ")}${issues.length > 3 ? "..." : ""}`,
          });
          return;
        }
      }

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
  const structuredCategory = Boolean(SECTION_TAXONOMY[values.category || ""]);
  const selectedSectionThemes = getThemesForSection(values.category || "");
  const selectedTheme = normalizeThemeForSection(values.category || "", values.theme || "") || "";
  const selectedThemeTopics = getTopicsForSection(values.category || "", selectedTheme || null);
  const publishReadinessIssues = useMemo(() => getPublishReadinessIssues(values as FormValues), [values]);
  const publishBlocked = values.status === "published" && publishReadinessIssues.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Wisdom Editorial Studio</h1>
          <p className="mt-2 text-sm text-muted">Structured content engine for multilingual wisdom publishing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => {
            const nextValues = buildFreshFormValues(values.category);
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
            resetDraft();
            setDraft({ category: nextValues.category, tags: [] } as any);
            draftSyncKeyRef.current = "";
            form.reset(nextValues);
            setIsDirty(false);
            toast.success("Draft cleared");
          }}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs text-muted hover:text-foreground">
            <RotateCcw size={13} /> New
          </button>
          <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["media"] })}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs text-muted hover:text-foreground">
            <RefreshCw size={13} /> Refresh
          </button>
          <button type="submit" form="wisdom-studio-form" disabled={contentMutation.isPending || publishBlocked}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/20 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold/30 disabled:opacity-60">
            {contentMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {contentMutation.isPending ? "Saving..." : publishBlocked ? "Resolve Checklist" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Two column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── LEFT: Editor Sections ── */}
        <form id="wisdom-studio-form" onSubmit={handlePublish} className="space-y-4">

          <SectionShell number={0} title="Publish Readiness" subtitle="Mandatory fields before publishing" defaultOpen>
            <div className="rounded-xl border border-border/30 bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Checklist status</p>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${publishReadinessIssues.length === 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"}`}>
                  {publishReadinessIssues.length === 0 ? "Ready" : `${publishReadinessIssues.length} pending`}
                </span>
              </div>

              {publishReadinessIssues.length === 0 ? (
                <p className="text-sm text-emerald-400">All mandatory fields are complete for publishing.</p>
              ) : (
                <ul className="space-y-2 text-sm text-muted">
                  {publishReadinessIssues.map((issue) => (
                    <li key={issue} className="rounded-lg border border-border/20 bg-surface/60 px-3 py-2">• {issue}</li>
                  ))}
                </ul>
              )}

              <p className="text-[11px] text-muted/80">
                Draft and scheduled saves are allowed. Direct publish is blocked until required fields are complete.
              </p>
            </div>
          </SectionShell>

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

            {structuredCategory && (
              <div className="rounded-2xl border border-border/30 bg-background/50 p-4 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">Taxonomy Mapping & Topic Assignment</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block">
                    Primary Topic / Category
                    <select
                      value={values.topic || values.theme || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        form.setValue("topic", val || null, { shouldDirty: true });
                        form.setValue("theme", val || selectedSectionThemes[0] || null, { shouldDirty: true });
                        if (val && !values.tags?.includes(val)) {
                          form.setValue("tags", [...(values.tags || []), val], { shouldDirty: true });
                        }
                      }}
                      className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Primary Topic</option>
                      {selectedSectionThemes.map((t) => <option key={t} value={t}>{t}</option>)}
                      {selectedThemeTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted block">
                    Theme / Focus Area (Optional)
                    <select
                      value={values.theme || ""}
                      onChange={(e) => {
                        const nextTheme = e.target.value;
                        form.setValue("theme", nextTheme || null, { shouldDirty: true });
                      }}
                      className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Theme</option>
                      {selectedSectionThemes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
                    </select>
                  </label>
                </div>

                <div className="pt-2">
                  <TopicSelectorField
                    selectedTags={values.tags || []}
                    onChange={(newTags) => form.setValue("tags", newTags, { shouldDirty: true })}
                    category={values.category || "Student Corner"}
                  />
                  <p className="mt-1 text-[10px] text-muted">
                    💡 <strong>Multi-Topic Mapping:</strong> You can select multiple topic tags here. This card will automatically show up in all selected topics!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Audience Mapping</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "general", label: "General" },
                      { key: "student", label: "Student" },
                      { key: "youth", label: "Youth" },
                    ].map((opt) => {
                      const current = values.audiences || ["general"];
                      const active = current.includes(opt.key as any);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? current.filter((a: string) => a !== opt.key)
                              : [...current, opt.key];
                            form.setValue("audiences", next.length ? (Array.from(new Set(next)) as any) : ["general"], { shouldDirty: true, shouldValidate: true });
                          }}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${active ? "border-gold/40 bg-gold/15 text-gold-light" : "border-border/40 bg-surface text-muted hover:text-foreground"}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <TopicSelectorField
              selectedTags={(values.tagsInput || "").split(",").map((t: string) => t.trim()).filter(Boolean)}
              onChange={(newTags) => form.setValue("tagsInput", newTags.join(", "), { shouldDirty: true })}
              category={values.category || "Imam Ali Says"}
            />
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
          <SectionShell 
            number={6} 
            title="Reflection" 
            subtitle="Questions, action steps, and personal reflection"
            action={
              <button
                type="button"
                onClick={async () => {
                  const title = form.getValues("title");
                  const content = form.getValues("main_explanation") || form.getValues("arabic_text") || form.getValues("title");
                  if (!content) {
                    toast.error("Please enter a title or main content first.");
                    return;
                  }
                  const loadingToast = toast.loading("Generating AI enhancements...");
                  try {
                    const res = await fetch("/api/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title, text: content }),
                    });
                    const data = await res.json();
                    toast.dismiss(loadingToast);
                    if (data.success && data.result) {
                      const { reflection_questions, action_steps, youth_relevance, seo_description } = data.result;
                      if (reflection_questions?.length) {
                        form.setValue("reflection_questions", reflection_questions.join("\n"));
                      }
                      if (action_steps?.length) {
                        form.setValue("action_steps", action_steps.join("\n"));
                      }
                      if (youth_relevance) {
                        form.setValue("youth_relevance", youth_relevance);
                      }
                      if (seo_description) {
                        form.setValue("seo_description", seo_description);
                      }
                      toast.success("AI content generated successfully!");
                    } else {
                      toast.error(data.error || "Failed to generate AI content");
                    }
                  } catch {
                    toast.dismiss(loadingToast);
                    toast.error("Error connecting to AI service.");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-colors"
              >
                <Sparkles size={14} />
                Auto-Enhance with AI
              </button>
            }
          >
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
          <SectionShell number={9} title="Media" subtitle="Independent uploads per slot — crop to exact dimensions">
            <div className="grid gap-6 md:grid-cols-3">
              {/* ── Hero Image Slot ── */}
              <div>
                <MediaPickerField
                  label="Hero Image"
                  currentUrl={values.hero_image || null}
                  isUploading={uploadingSlots.hero}
                  aspectLabel={MEDIA_SLOT_CONFIG.hero.recommendedLabel}
                  onUpload={(file) => handleSlotUpload("hero", file)}
                  onClear={() => { form.setValue("hero_image", null, { shouldDirty: true }); form.setValue("hero_focal_point", null, { shouldDirty: true }); }}
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal X (%)
                    <input type="number" {...form.register("hero_focal_point.x" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal Y (%)
                    <input type="number" {...form.register("hero_focal_point.y" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                </div>
                {values.hero_image && (
                  <FocalPicker src={values.hero_image} value={values.hero_focal_point || null} onChange={(p) => form.setValue("hero_focal_point", p, { shouldDirty: true })} />
                )}
              </div>

              {/* ── Card Background Slot ── */}
              <div>
                <MediaPickerField
                  label="Card Background"
                  currentUrl={values.featured_image || null}
                  isUploading={uploadingSlots.featured}
                  aspectLabel={MEDIA_SLOT_CONFIG.featured.recommendedLabel}
                  onUpload={(file) => handleSlotUpload("featured", file)}
                  onClear={() => { form.setValue("featured_image", null, { shouldDirty: true }); form.setValue("featured_focal_point", null, { shouldDirty: true }); }}
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal X (%)
                    <input type="number" {...form.register("featured_focal_point.x" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal Y (%)
                    <input type="number" {...form.register("featured_focal_point.y" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                </div>
                {values.featured_image && (
                  <FocalPicker src={values.featured_image} value={values.featured_focal_point || null} onChange={(p) => form.setValue("featured_focal_point", p, { shouldDirty: true })} />
                )}
              </div>

              {/* ── Sidebar Banner Slot ── */}
              <div>
                <MediaPickerField
                  label="Sidebar Banner"
                  currentUrl={values.sidebar_banner || null}
                  isUploading={uploadingSlots.sidebar}
                  aspectLabel={MEDIA_SLOT_CONFIG.sidebar.recommendedLabel}
                  onUpload={(file) => handleSlotUpload("sidebar", file)}
                  onClear={() => { form.setValue("sidebar_banner", null, { shouldDirty: true }); form.setValue("sidebar_focal_point", null, { shouldDirty: true }); }}
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal X (%)
                    <input type="number" {...form.register("sidebar_focal_point.x" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                  <label className="space-y-1 text-[11px] text-muted">
                    Focal Y (%)
                    <input type="number" {...form.register("sidebar_focal_point.y" as const, { valueAsNumber: true })} min={0} max={100} className="w-full rounded-xl border border-border/40 bg-background px-2 py-1 text-sm" />
                  </label>
                </div>
                {values.sidebar_banner && (
                  <FocalPicker src={values.sidebar_banner} value={values.sidebar_focal_point || null} onChange={(p) => form.setValue("sidebar_focal_point", p, { shouldDirty: true })} />
                )}
              </div>
            </div>

            {/* ── Media Library with explicit slot assignment ── */}
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Media Library — assign to a specific slot</p>
              <div className="max-h-56 space-y-2 overflow-auto">
                {mediaQuery.isLoading && <p className="text-xs text-muted">Loading media...</p>}
                {mediaCards.filter((m) => m.mimeType.startsWith("image/")).map((item) => (
                  <div key={item.id} className="flex w-full items-center gap-3 rounded-xl border border-border/30 bg-background p-2">
                    <ImageRole src={item.url} alt={item.title} role="card" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted">{Math.round(item.size / 1024)} KB</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => assignMediaToSlot("hero", item.url, item.title)}
                        className="rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted hover:text-gold-light hover:border-gold/30 hover:bg-gold/5 transition-all">
                        <ImageIcon size={10} className="inline mr-0.5" /> Hero
                      </button>
                      <button type="button" onClick={() => assignMediaToSlot("featured", item.url, item.title)}
                        className="rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted hover:text-gold-light hover:border-gold/30 hover:bg-gold/5 transition-all">
                        <ImageIcon size={10} className="inline mr-0.5" /> Card
                      </button>
                      <button type="button" onClick={() => assignMediaToSlot("sidebar", item.url, item.title)}
                        className="rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted hover:text-gold-light hover:border-gold/30 hover:bg-gold/5 transition-all">
                        <ImageIcon size={10} className="inline mr-0.5" /> Side
                      </button>
                    </div>
                  </div>
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
              hero_focal_point: values.hero_focal_point || null,
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

      {/* ── Crop Modal (rendered as a portal-like overlay) ── */}
      {cropState && (
        <ImageCropModal
          imageUrl={cropState.imageUrl}
          aspectRatio={cropState.aspectRatio}
          label={cropState.label}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
          onCancel={() => setCropState(null)}
        />
      )}
    </div>
  );
}
