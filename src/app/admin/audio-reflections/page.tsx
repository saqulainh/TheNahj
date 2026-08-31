"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, Plus, UploadCloud, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AudioTrackRecord {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  reciter?: string;
  duration?: string;
  cover_image?: string;
  audio_url?: string;
  is_focus_ambient?: boolean;
  created_at?: string;
}

const MEDIA_BUCKET = (process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media").trim();

/** Upload a file directly to Supabase Storage from the browser (bypasses Vercel 4.5MB limit) */
async function uploadDirectToSupabase(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(safeName, file, { contentType: file.type || "audio/mpeg", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
}

export default function AudioReflectionsPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Duas & Ziyarat");
  const [reciter, setReciter] = useState("");
  const [duration, setDuration] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isFocusAmbient, setIsFocusAmbient] = useState(false);

  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Fetch audio tracks from /api/audio
  const { data: tracks = [], isLoading } = useQuery<AudioTrackRecord[]>({
    queryKey: ["admin-audio-tracks"],
    queryFn: async () => {
      const res = await fetch("/api/audio");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Handle uploading audio file directly to Supabase Storage (no Vercel size limit)
  const handleAudioUpload = async (file: File) => {
    setIsUploadingAudio(true);
    try {
      const url = await uploadDirectToSupabase(file);
      setAudioUrl(url);
      toast.success("Audio uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload audio.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Handle uploading cover image directly to Supabase Storage
  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const url = await uploadDirectToSupabase(file);
      setCoverUrl(url);
      toast.success("Cover image uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Mutation to create new track
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          category,
          reciter,
          duration: duration || "3:30",
          cover_image: coverUrl,
          audio_url: audioUrl,
          is_focus_ambient: isFocusAmbient,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add track");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audio-tracks"] });
      setIsAdding(false);
      setTitle("");
      setSubtitle("");
      setReciter("");
      setDuration("");
      setAudioUrl("");
      setCoverUrl("");
      setIsFocusAmbient(false);
    },
  });

  // Toggle Focus Timer status for an existing track
  const toggleFocusMutation = useMutation({
    mutationFn: async ({ id, is_focus_ambient }: { id: string; is_focus_ambient: boolean }) => {
      const res = await fetch("/api/audio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_focus_ambient }),
      });
      if (!res.ok) throw new Error("Failed to update focus setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audio-tracks"] });
    },
  });

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audio Library CMS</h1>
          <p className="mt-1 text-sm text-muted">
            Manage Nohay, Duas & Ziyarat (Ziyarat-e-Ashura, Nade Ali, Dua-e-Kumail) and Audio Reflections with cover thumbnails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-black shadow-md hover:bg-gold-light transition-all"
        >
          <Plus size={16} /> Add Audio Track
        </button>
      </div>

      {/* Add New Track Modal/Form */}
      {isAdding && (
        <div className="rounded-2xl border border-gold/30 bg-surface/80 p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Add New Track (Nohay / Dua / Reflection)</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-medium uppercase tracking-wider text-muted">
              Track Title *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ziyarat-e-Ashura or Noha Title"
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-xs font-medium uppercase tracking-wider text-muted">
              Category *
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
              >
                <option value="Duas & Ziyarat">Duas & Ziyarat</option>
                <option value="Nohay">Nohay</option>
                <option value="Audio Reflections">Audio Reflections</option>
                <option value="Focus">Focus</option>
              </select>
            </label>

            <label className="space-y-1 text-xs font-medium uppercase tracking-wider text-muted">
              Reciter / Artist Name
              <input
                type="text"
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                placeholder="e.g. Reciter Name"
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-xs font-medium uppercase tracking-wider text-muted">
              Duration (mm:ss)
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 14:20"
                className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-1 text-xs font-medium uppercase tracking-wider text-muted block">
            Subtitle / Description
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Sacred supplication for Karbala martyrs..."
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
            />
          </label>

          {/* Uploads Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Audio Upload */}
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Audio File (MP3 / URL)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Paste audio URL or upload file..."
                  className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs font-medium hover:bg-surface-elevated">
                  {isUploadingAudio ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Cover Thumbnail Image Upload */}
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Cover Thumbnail Image</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Paste cover image URL..."
                  className="flex-1 rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:border-gold/40 focus:outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-surface px-3 py-2 text-xs font-medium hover:bg-surface-elevated">
                  {isUploadingCover ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                  <span>Thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Focus Timer Ambient Sound Checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors">
              <input
                type="checkbox"
                checked={isFocusAmbient}
                onChange={(e) => setIsFocusAmbient(e.target.checked)}
                className="h-4 w-4 rounded border-gold/40 text-gold focus:ring-gold"
              />
              <span>🎧 Show in Focus Timer Page as Ambient Sound</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-border/30 px-4 py-2 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!title || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="rounded-xl bg-gold px-5 py-2 text-xs font-semibold text-black hover:bg-gold-light disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Track"}
            </button>
          </div>
        </div>
      )}

      {/* Existing Tracks Table/List */}
      <div className="rounded-2xl border border-border/30 bg-surface/40 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-muted">
          Current Audio Tracks ({tracks.length})
        </h2>

        {isLoading ? (
          <p className="text-xs text-muted">Loading audio tracks...</p>
        ) : tracks.length === 0 ? (
          <p className="text-xs text-muted">No database tracks uploaded yet. Default curated tracks are currently showing on the public /audio page.</p>
        ) : (
          <div className="space-y-3">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/20 bg-background/60 p-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-surface flex items-center justify-center">
                    {t.cover_image ? (
                      <Image src={t.cover_image} alt={t.title} fill className="object-cover" />
                    ) : (
                      <Music size={18} className="text-gold" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
                    <p className="truncate text-xs text-muted">{t.reciter ? `${t.reciter} • ` : ""}{t.subtitle || t.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFocusMutation.mutate({ id: t.id, is_focus_ambient: !t.is_focus_ambient })}
                    className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase font-semibold transition-all ${
                      t.is_focus_ambient
                        ? "border-green-500/40 bg-green-500/10 text-green-400"
                        : "border-border/30 bg-surface text-muted hover:border-gold/30 hover:text-foreground"
                    }`}
                    title="Toggle whether this track shows in the Focus Timer page as Ambient Sound"
                  >
                    {t.is_focus_ambient ? "🎧 In Focus Timer" : "+ Add to Focus"}
                  </button>
                  <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] uppercase font-semibold text-gold-light">
                    {t.category}
                  </span>
                  <span className="text-xs text-muted tabular-nums">{t.duration || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
