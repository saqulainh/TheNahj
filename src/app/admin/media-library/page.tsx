"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageIcon, Search, UploadCloud, Trash2, Copy, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  variants?: Array<{ width: number; url: string; format: string; fileName: string }>;
  created_at: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const mediaQuery = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const res = await fetch("/api/media");
      const json = await res.json();
      return (json.items ?? []) as MediaItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const response = await new Promise<MediaItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/media");
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        };
        xhr.onload = () => {
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && parsed.success) {
              resolve(parsed.item as MediaItem);
            } else {
              reject(new Error(parsed.error || "Upload failed"));
            }
          } catch {
            reject(new Error("Invalid upload response"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      return response;
    },
    onSuccess: (item) => {
      toast.success("Upload complete", { description: item.title });
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Asset removed");
    },
    onError: (error) => {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    },
  });

  const assets = useMemo(() => {
    const all = mediaQuery.data || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((item) => item.title.toLowerCase().includes(q) || item.fileName.toLowerCase().includes(q));
  }, [mediaQuery.data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Media Library</h1>
          <p className="mt-2 text-sm text-muted">Unified media manager for hero images, card backgrounds, inline visuals, and banners.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-border/30 bg-surface/70 p-5">
          <h2 className="text-sm font-medium text-foreground">Upload</h2>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/35 bg-background p-6 text-center">
            <UploadCloud size={18} className="mb-2" />
            <span className="text-xs text-muted">Drop or select image/audio</span>
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
            <div className="mt-4 rounded-xl border border-border/30 bg-background p-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="animate-spin" size={12} /> Uploading {uploadProgress}%
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface-elevated">
                <div className="h-2 rounded-full bg-gold/70 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search uploaded assets"
              className="w-full rounded-xl border border-border/35 bg-surface/70 py-3 pl-9 pr-3 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mediaQuery.isLoading && <p className="text-sm text-muted">Loading media...</p>}
            {assets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-xl border border-border/30 bg-surface/70">
                <div className="flex h-36 items-center justify-center bg-background">
                  {asset.mimeType.startsWith("image/") ? (
                    <img src={asset.url} alt={asset.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-xs uppercase tracking-[0.2em] text-gold-muted">Audio</div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <h3 className="line-clamp-1 text-sm text-foreground">{asset.title}</h3>
                  <p className="text-[11px] text-muted">{formatSize(asset.size)}</p>
                  {asset.variants?.length ? (
                    <p className="text-[11px] text-gold-muted">{asset.variants.length} responsive variants</p>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        toast.success("URL copied", { description: asset.url });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/35 px-2 py-1 text-[11px] text-muted hover:text-foreground"
                    >
                      <Copy size={11} /> Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(asset.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/35 px-2 py-1 text-[11px] text-muted hover:text-red-400"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!mediaQuery.isLoading && assets.length === 0 && (
              <div className="col-span-full rounded-xl border border-border/30 bg-surface/70 p-8 text-center text-sm text-muted">
                <ImageIcon className="mx-auto mb-2" size={18} />
                No assets found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
