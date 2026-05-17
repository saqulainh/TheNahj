"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Plus, Trash2, Search, Link as LinkIcon, UploadCloud, Loader2, Music } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface MediaAsset {
  id: string;
  title: string;
  url: string;
  type: string;
  size: string;
  tags: string[];
}

const mockAssets: MediaAsset[] = [
  {
    id: "m1",
    title: "Cinematic Reflection Backdrop",
    url: "/backgrounds/reflection-1.png",
    type: "image/png",
    size: "1.4 MB",
    tags: ["backdrop", "cinematic", "sermon"],
  },
  {
    id: "m2",
    title: "Abstract Gradient Pattern",
    url: "/textures/abstract.png",
    type: "image/png",
    size: "450 KB",
    tags: ["texture", "abstract", "purple"],
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  // Form states for uploading/adding
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAssets(mockAssets);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from("media").list(undefined, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) throw error;

      if (data) {
        const mapped: MediaAsset[] = data.map((file) => {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(file.name);
          const sizeMB = file.metadata ? (file.metadata.size / (1024 * 1024)).toFixed(2) : "0.1";
          
          return {
            id: file.id || file.name,
            title: file.name.split("-").slice(1).join("-") || file.name,
            url: urlData.publicUrl,
            type: file.metadata?.mimetype || (file.name.endsWith(".mp3") ? "audio/mpeg" : "image/jpeg"),
            size: `${sizeMB} MB`,
            tags: file.name.endsWith(".mp3") ? ["audio"] : ["image"],
          };
        });
        setAssets(mapped);
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
      setStatus("Failed to load live assets. Ensure 'media' bucket is configured.");
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus("Please select a file first.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Local fallback simulation
      const mockNew: MediaAsset = {
        id: `mock-${Date.now()}`,
        title: newTitle || selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        type: selectedFile.type,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      setAssets([mockNew, ...assets]);
      setSelectedFile(null);
      setNewTitle("");
      setNewTags("");
      setStatus("Simulated upload successful (Local fallback active).");
      return;
    }

    setUploading(true);
    setStatus("Uploading to Supabase Storage...");

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const sanitizedTitle = (newTitle || selectedFile.name.split(".")[0])
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const fileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setStatus("Asset uploaded successfully! Fetching library...");
      setSelectedFile(null);
      setNewTitle("");
      setNewTags("");
      await fetchAssets();
    } catch (err) {
      console.error("Upload error:", err);
      setStatus(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setStatus(`Copied: ${url}`);
    setTimeout(() => setStatus(null), 3000);
  };

  const deleteAsset = async (asset: MediaAsset) => {
    if (!isSupabaseConfigured || !supabase) {
      setAssets(assets.filter((a) => a.id !== asset.id));
      setStatus("Asset deleted locally.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${asset.title}"?`)) return;

    setStatus("Deleting asset...");
    try {
      // Extract file name from public URL
      const urlParts = asset.url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage.from("media").remove([fileName]);
      if (error) throw error;

      setStatus("Asset deleted successfully.");
      await fetchAssets();
    } catch (err) {
      console.error("Delete error:", err);
      setStatus("Failed to delete asset from Storage.");
    }
  };

  const filtered = assets.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-gold" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground">Media Library</h1>
            <p className="mt-1 text-sm text-muted">Upload and manage audio reflections and image banners directly in Supabase Storage.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upload Form */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface p-6 space-y-6 self-start">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-gold-muted" /> Live File Upload
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-border bg-background hover:bg-surface/50 cursor-pointer transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted" />
                  <p className="text-xs text-muted">
                    {selectedFile ? (
                      <span className="font-semibold text-gold-light">{selectedFile.name}</span>
                    ) : (
                      <span>Click to upload image or audio (.mp3, .png, .jpg)</span>
                    )}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,audio/mpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setNewTitle(e.target.files[0].name.split(".")[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Asset Title (Optional)</span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Focus Sermon"
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold/15 py-3 text-xs font-semibold text-gold-light hover:bg-gold/25 disabled:opacity-50 transition-colors border border-gold/25"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                "Upload to Supabase Storage"
              )}
            </button>
          </form>
        </div>

        {/* Media List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted/65" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full rounded-xl border border-border bg-surface pl-11 pr-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted bg-surface/30 rounded-2xl border border-border/20">
              <Loader size="8rem" />
              <p className="mt-4 text-xs tracking-widest text-gold-muted uppercase">Loading media assets...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((asset) => (
                <div key={asset.id} className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col justify-between">
                  {/* Visual Thumbnail */}
                  <div className="h-32 bg-background relative overflow-hidden flex items-center justify-center border-b border-border">
                    {asset.type.startsWith("audio/") || asset.url.endsWith(".mp3") ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-gold">
                        <Music className="h-8 w-8 text-gold-muted" />
                        <span className="text-[10px] uppercase tracking-wider font-medium text-gold/80">Audio Reflection</span>
                      </div>
                    ) : (
                      <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1">{asset.title}</h3>
                      <p className="text-xs text-muted font-mono line-clamp-1 mt-0.5">{asset.url}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-background text-muted px-2 py-0.5 rounded border border-border">{t}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted">
                      <span>{asset.size}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyUrl(asset.url)}
                          className="p-1.5 hover:text-gold-light rounded bg-background border border-border"
                          title="Copy Public URL"
                        >
                          <LinkIcon size={12} />
                        </button>
                        <button
                          onClick={() => deleteAsset(asset)}
                          className="p-1.5 hover:text-red-400 rounded bg-background border border-border"
                          title="Delete Asset"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-10 text-xs text-muted">
                  No assets found matching the search query.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {status && (
        <div className="rounded-lg bg-surface p-4 text-xs text-gold-muted border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
