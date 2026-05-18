"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Save, UploadCloud, Loader2, Trash2, Eye, RefreshCw, GripVertical, History } from "lucide-react";
import {
  articlePayloadSchema,
  blockTypes,
  unifiedCategories,
  type ContentBlock,
} from "@/lib/content-schema";
import { useContentStudioStore } from "@/lib/stores/contentStudioStore";

const formSchema = articlePayloadSchema.extend({
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MediaItem {
  id: string;
  title: string;
  url: string;
  mimeType: string;
  size: number;
  variants?: Array<{ width: number; url: string; format: string; fileName: string }>;
}

interface RevisionItem {
  id: string;
  article_slug: string;
  title: string;
  excerpt: string;
  content_blocks: ContentBlock[];
  status: "draft" | "scheduled" | "published";
  created_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function estimateReadingTime(blocks: ContentBlock[]) {
  const words = blocks
    .map((block) => [block.value, ...(block.values ?? [])].join(" ").trim())
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

async function saveContent(payload: FormValues) {
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
  return json.data;
}

export default function ContentStudioPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { draft, setDraft } = useContentStudioStore();
  const [isDirty, setIsDirty] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"english" | "arabic" | "urdu">("english");
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSyncKeyRef = useRef<string>("");
  const setDraftRef = useRef(setDraft);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ...draft,
      category: (unifiedCategories.includes(draft.category as any)
        ? draft.category
        : "Imam Ali Says") as any,
      layout_type: "editorial",
      tagsInput: draft.tags.join(", "),
    } as any,
  });

  const mediaQuery = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const res = await fetch("/api/media");
      const json = await res.json();
      return (json.items ?? []) as MediaItem[];
    },
  });

  const values = form.watch();

  const revisionsQuery = useQuery({
    queryKey: ["content-revisions", values.slug || values.title],
    queryFn: async () => {
      const slug = slugify(values.slug || values.title || "");
      if (!slug) return [] as RevisionItem[];
      const res = await fetch(`/api/content/revisions?slug=${slug}`);
      const json = await res.json();
      return (json.items ?? []) as RevisionItem[];
    },
    enabled: Boolean((values.slug || values.title || "").trim()),
  });

  const contentMutation = useMutation({
    mutationFn: saveContent,
    onMutate: async (payload) => {
      setIsDirty(false);
      await queryClient.cancelQueries({ queryKey: ["content-list"] });
      const previous = queryClient.getQueryData(["content-list"]);
      queryClient.setQueryData(["content-list"], (old: unknown) => old || []);
      return { previous, payload };
    },
    onSuccess: () => {
      toast.success("Content saved", {
        description: "Article was saved to the unified content engine.",
      });
      queryClient.invalidateQueries({ queryKey: ["content-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-content"] });
      queryClient.invalidateQueries({ queryKey: ["content-revisions"] });
    },
    onError: (error, _payload, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["content-list"], context.previous);
      }
      setIsDirty(true);
      toast.error("Save failed", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    },
  });

  const mutateContentRef = useRef(contentMutation.mutate);

  useEffect(() => {
    setDraftRef.current = setDraft;
  }, [setDraft]);

  useEffect(() => {
    mutateContentRef.current = contentMutation.mutate;
  }, [contentMutation.mutate]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
      return json.item as MediaItem;
    },
    onSuccess: (item) => {
      toast.success("Media uploaded", { description: item.title });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Could not upload",
      });
    },
  });

  useEffect(() => {
    const requestedCategory = searchParams.get("category");
    if (!requestedCategory) return;
    if (!unifiedCategories.includes(requestedCategory as (typeof unifiedCategories)[number])) return;
    form.setValue("category", requestedCategory as (typeof unifiedCategories)[number], {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [form, searchParams]);

  useEffect(() => {
    const subscription = form.watch((next) => {
      if (!next) return;
      const nextDraft = {
        title: next.title || "",
        slug: next.slug || "",
        excerpt: next.excerpt || "",
        category: next.category || unifiedCategories[0],
        tags: (next.tagsInput || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured_image: next.featured_image || null,
        hero_image: next.hero_image || null,
        sidebar_banner: next.sidebar_banner || null,
        arabic_content: next.arabic_content || null,
        english_content: next.english_content || null,
        urdu_content: next.urdu_content || null,
        seo_title: next.seo_title || null,
        seo_description: next.seo_description || null,
        schedule_publish_at: next.schedule_publish_at || null,
        status: next.status || "draft",
        content_blocks: next.content_blocks || [],
        reading_time: next.reading_time || 0,
        featured: Boolean(next.featured),
      };

      const nextDraftKey = JSON.stringify(nextDraft);
      if (nextDraftKey !== draftSyncKeyRef.current) {
        draftSyncKeyRef.current = nextDraftKey;
        setDraftRef.current(nextDraft as any);
      }

      setIsDirty(true);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        if (!form.formState.isValid) return;
        const payload = {
          ...next,
          tags: (next.tagsInput || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          reading_time: estimateReadingTime((next.content_blocks || []) as any[]),
          slug: slugify(next.slug || next.title || "article"),
        } as FormValues;
        mutateContentRef.current(payload);
      }, 1200);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const addBlock = (type: (typeof blockTypes)[number]) => {
    const current = form.getValues("content_blocks") || [];
    const block: ContentBlock = {
      id: `${type}-${Date.now()}`,
      type,
      value: "",
      values: type === "timeline" ? [""] : undefined,
    };
    form.setValue("content_blocks", [...current, block], { shouldValidate: true, shouldDirty: true });
  };

  const removeBlock = (id: string) => {
    const current = form.getValues("content_blocks") || [];
    form.setValue(
      "content_blocks",
      current.filter((block) => block.id !== id),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const moveBlock = (fromId: string, toId: string) => {
    const current = [...(form.getValues("content_blocks") || [])];
    const fromIndex = current.findIndex((block) => block.id === fromId);
    const toIndex = current.findIndex((block) => block.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    form.setValue("content_blocks", current, { shouldDirty: true, shouldValidate: true });
  };

  const handlePublish = form.handleSubmit(
    (input) => {
      const payload = {
        ...input,
        status: input.status,
        tags: (input.tagsInput || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        slug: slugify(input.slug || input.title),
        reading_time: estimateReadingTime(input.content_blocks as any[]),
      } as unknown as FormValues;
      contentMutation.mutate(payload);
    },
    (errors) => {
      console.error("Form Validation Errors:", errors);
      const errorMsg = Object.entries(errors)
        .map(([field, err]) => `${field}: ${err?.message || "Invalid value"}`)
        .join(", ");
      toast.error("Form validation failed", {
        description: `Please fix the following issues: ${errorMsg}`,
      });
    }
  );

  const mediaCards = useMemo(() => mediaQuery.data || [], [mediaQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Unified Content Studio</h1>
          <p className="mt-2 text-sm text-muted">
            One centralized engine for all categories with block-based multilingual publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["media"] })}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-4 py-2 text-xs text-muted hover:text-foreground"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="submit"
            form="content-studio-form"
            disabled={contentMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/20 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold/30 disabled:opacity-60"
          >
            {contentMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {contentMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form id="content-studio-form" onSubmit={handlePublish} className="space-y-5 rounded-2xl border border-border/30 bg-surface/65 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-muted">
              Title
              <input
                {...form.register("title")}
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
                placeholder="Build disciplined hearts in distracted times"
              />
            </label>
            <label className="space-y-1 text-xs text-muted">
              Slug
              <input
                {...form.register("slug")}
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
                placeholder="build-disciplined-hearts"
              />
            </label>
          </div>

          <label className="space-y-1 text-xs text-muted block">
            Excerpt
            <textarea
              {...form.register("excerpt")}
              rows={2}
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-xs text-muted block">
              Category
              <select {...form.register("category")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm">
                {unifiedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted block">
              Status
              <select {...form.register("status")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted block">
              Schedule publish
              <input
                type="datetime-local"
                {...form.register("schedule_publish_at")}
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="space-y-1 text-xs text-muted block">
            Tags (comma separated)
            <input
              {...form.register("tagsInput")}
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm"
              placeholder="discipline, youth, spirituality"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-xs text-muted block">
              Featured image
              <input {...form.register("featured_image")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs text-muted block">
              Hero image
              <input {...form.register("hero_image")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs text-muted block">
              Sidebar banner
              <input {...form.register("sidebar_banner")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Content blocks</h3>
              <div className="flex flex-wrap gap-1">
                {blockTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="rounded-full border border-border/35 px-2.5 py-1 text-[10px] uppercase text-muted hover:text-foreground"
                  >
                    <Plus size={10} className="inline" /> {type.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(values.content_blocks || []).map((block, idx) => (
                <div
                  key={block.id}
                  className={`rounded-xl border bg-surface-elevated/60 p-3 ${draggingBlockId === block.id ? "border-gold/40" : "border-border/35"}`}
                  draggable
                  onDragStart={() => setDraggingBlockId(block.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingBlockId) moveBlock(draggingBlockId, block.id);
                    setDraggingBlockId(null);
                  }}
                  onDragEnd={() => setDraggingBlockId(null)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                      <GripVertical size={11} />
                      {idx + 1}. {block.type.replaceAll("_", " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="rounded-full p-1 text-muted hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <textarea
                    value={block.value || ""}
                    onChange={(e) => {
                      const current = form.getValues("content_blocks");
                      const next = current.map((item) =>
                        item.id === block.id ? { ...item, value: e.target.value } : item
                      );
                      form.setValue("content_blocks", next, { shouldDirty: true, shouldValidate: true });
                    }}
                    rows={block.type === "paragraph" ? 4 : 2}
                    className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted">
              <button
                type="button"
                onClick={() => setActiveLocale("english")}
                className={`rounded-full px-3 py-1 ${activeLocale === "english" ? "bg-gold/20 text-gold-light" : "bg-surface text-muted"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale("arabic")}
                className={`rounded-full px-3 py-1 ${activeLocale === "arabic" ? "bg-gold/20 text-gold-light" : "bg-surface text-muted"}`}
              >
                Arabic
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale("urdu")}
                className={`rounded-full px-3 py-1 ${activeLocale === "urdu" ? "bg-gold/20 text-gold-light" : "bg-surface text-muted"}`}
              >
                Urdu
              </button>
            </div>

            {activeLocale === "english" && (
              <textarea {...form.register("english_content")} rows={5} className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm" />
            )}
            {activeLocale === "arabic" && (
              <textarea {...form.register("arabic_content")} dir="rtl" rows={5} className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm font-arabic" />
            )}
            {activeLocale === "urdu" && (
              <textarea {...form.register("urdu_content")} dir="rtl" rows={5} className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm font-urdu" />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-muted block">
              SEO title
              <input {...form.register("seo_title")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-xs text-muted block">
              SEO description
              <input {...form.register("seo_description")} className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 px-4 py-3 text-xs text-muted">
            <span>{isDirty ? "Unsaved changes" : "All changes saved"}</span>
            <span>{values.reading_time || estimateReadingTime(values.content_blocks || [])} min read</span>
          </div>
        </form>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border/30 bg-surface/65 p-5">
            <h2 className="text-sm font-medium text-foreground">Media manager</h2>
            <p className="mt-1 text-xs text-muted">Upload once and reuse as hero, cards, inline blocks, and sidebar banners.</p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-background p-5 text-center">
              <UploadCloud className="mb-2" size={16} />
              <span className="text-xs text-muted">Drop or click to upload image/audio</span>
              <input
                type="file"
                accept="image/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                }}
              />
            </label>

            {uploadMutation.isPending && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Loader2 className="animate-spin" size={14} /> Uploading...
              </div>
            )}

            <div className="mt-4 max-h-[26rem] space-y-2 overflow-auto">
              {mediaQuery.isLoading && <p className="text-xs text-muted">Loading media...</p>}
              {mediaCards.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    form.setValue("featured_image", item.url, { shouldDirty: true });
                    form.setValue("hero_image", item.url, { shouldDirty: true });
                    toast.success("Image selected", { description: item.title });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/30 bg-background p-2 text-left hover:border-gold/35"
                >
                  {item.mimeType.startsWith("image/") ? (
                    <img src={item.url} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-elevated text-xs text-muted">AUDIO</div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted">{Math.round(item.size / 1024)} KB</p>
                    {item.variants?.length ? (
                      <p className="text-[10px] text-gold-muted">{item.variants.length} optimized sizes</p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/30 bg-surface/65 p-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <History size={13} /> Revision history
            </h2>
            <p className="mt-1 text-xs text-muted">Restore a previous snapshot, then save to publish that version.</p>
            <div className="mt-3 max-h-56 space-y-2 overflow-auto">
              {revisionsQuery.isLoading && <p className="text-xs text-muted">Loading revisions...</p>}
              {(revisionsQuery.data || []).map((rev) => (
                <div key={rev.id} className="rounded-xl border border-border/30 bg-background p-3">
                  <p className="text-xs text-foreground line-clamp-1">{rev.title || "Untitled"}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted">
                    {new Date(rev.created_at).toLocaleString()} · {rev.status}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("title", rev.title || "", { shouldDirty: true });
                      form.setValue("excerpt", rev.excerpt || "", { shouldDirty: true });
                      form.setValue("content_blocks", rev.content_blocks || [], { shouldDirty: true, shouldValidate: true });
                      form.setValue("status", rev.status || "draft", { shouldDirty: true });
                      setIsDirty(true);
                      toast.success("Revision restored", { description: "Review changes and click Save." });
                    }}
                    className="mt-2 rounded-lg border border-border/35 px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                  >
                    Restore snapshot
                  </button>
                </div>
              ))}
              {!revisionsQuery.isLoading && (revisionsQuery.data || []).length === 0 && (
                <p className="text-xs text-muted">No revisions yet. Save to start history.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/30 bg-surface/65 p-5">
            <h2 className="text-sm font-medium text-foreground">Live preview</h2>
            <div className="mt-3 rounded-xl border border-border/35 bg-background p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">{values.category}</span>
              <h3 className="mt-2 text-lg text-foreground">{values.title || "Untitled reflection"}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{values.excerpt || "Add an excerpt to preview article intro."}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-muted">
                <span>{values.status}</span>
                <span>{estimateReadingTime(values.content_blocks || [])} min read</span>
              </div>
              <button type="button" className="mt-3 inline-flex items-center gap-2 text-xs text-gold-light">
                <Eye size={12} /> Immersive preview
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
