"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Filter, 
  Calendar, 
  Clock, 
  BookOpen, 
  Eye, 
  Loader2 
} from "lucide-react";
import Link from "next/link";
import ImageRole from "@/components/ui/ImageRole";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  hero_image: string | null;
  reading_time: number;
  status: "draft" | "scheduled" | "published";
  updated_at: string;
  created_at: string;
}

interface ArticlesManagerProps {
  categoryFilter?: string;
  title: string;
  description: string;
}

export function ArticlesManager({ categoryFilter, title, description }: ArticlesManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["content-list", categoryFilter],
    queryFn: async () => {
      const url = categoryFilter 
        ? `/api/content?category=${encodeURIComponent(categoryFilter)}`
        : "/api/content";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load content");
      return (json.items ?? []) as ArticleItem[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      return true;
    },
    onSuccess: () => {
      toast.success("Article deleted successfully");
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["content-list"] });
    },
    onError: (error) => {
      toast.error("Failed to delete", {
        description: error instanceof Error ? error.message : "Request failed"
      });
    }
  });

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const studioLink = categoryFilter
    ? `/admin/studio?category=${encodeURIComponent(categoryFilter)}`
    : "/admin/studio";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "scheduled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Imam Ali Says":
        return "bg-gold/10 text-gold-light border-gold/20";
      case "Student Corner":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Youth Corner":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Nahjul Balagha":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Articles":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <Link
          href={studioLink}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/15 border border-gold/25 px-4 py-2.5 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
        >
          <Plus size={16} />
          Create New
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, or summary..."
            className="w-full rounded-xl border border-border/40 bg-surface/40 py-3 pl-10 pr-4 text-sm focus:border-gold/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gold-muted font-medium flex items-center gap-1.5 mr-2">
            <Filter size={12} /> Status:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              statusFilter === "all"
                ? "bg-gold/20 text-gold-light font-medium border border-gold/20"
                : "bg-surface/50 border border-border/30 text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              statusFilter === "published"
                ? "bg-gold/20 text-gold-light font-medium border border-gold/20"
                : "bg-surface/50 border border-border/30 text-muted hover:text-foreground"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter("scheduled")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              statusFilter === "scheduled"
                ? "bg-gold/20 text-gold-light font-medium border border-gold/20"
                : "bg-surface/50 border border-border/30 text-muted hover:text-foreground"
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              statusFilter === "draft"
                ? "bg-gold/20 text-gold-light font-medium border border-gold/20"
                : "bg-surface/50 border border-border/30 text-muted hover:text-foreground"
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Content Table / List */}
      <div className="overflow-hidden rounded-2xl border border-border/30 bg-surface/65 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Fetching content from database...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-400">
            Failed to load articles: {error instanceof Error ? error.message : "Database error"}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted gap-3">
            <FileText size={32} className="text-gold/40" />
            <p className="text-sm font-medium">No assets found</p>
            <p className="text-xs max-w-xs text-muted/60">
              {search || statusFilter !== "all" 
                ? "Try adjusting your search query or status filter."
                : "Get started by creating your first wisdom card or editorial article!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/30 bg-background/30 text-[10px] uppercase tracking-wider font-semibold text-gold-muted/80">
                  <th className="p-4 pl-6">Title & Summary</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stats</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredArticles.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-background/20 transition-colors group"
                  >
                    <td className="p-4 pl-6 max-w-md">
                      <div className="flex items-center gap-3">
                        {item.featured_image ? (
                          <ImageRole src={item.featured_image} alt={item.title || ""} role="card" className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border/30" focalPoint={null} />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-border/30 text-gold/40">
                            <BookOpen size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link 
                            href={`/admin/studio?slug=${item.slug}`}
                            className="block font-medium text-foreground hover:text-gold-light truncate transition-colors"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-muted line-clamp-1 mt-0.5">{item.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase font-medium tracking-wider font-display ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase font-medium tracking-wider font-display ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gold/40" />
                        <span>{item.reading_time || 1} min read</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {new Date(item.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/articles/${item.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-muted hover:bg-background hover:text-gold-light transition-all duration-300"
                          title="Open public live page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href={`/admin/studio?slug=${item.slug}`}
                          className="rounded-lg p-2 text-muted hover:bg-background hover:text-gold-light transition-all duration-300"
                          title="Edit in Content Studio"
                        >
                          <Edit size={14} />
                        </Link>
                        
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg p-1">
                            <button
                              onClick={() => deleteMutation.mutate(item.id)}
                              disabled={deleteMutation.isPending}
                              className="text-[10px] uppercase tracking-wider font-semibold text-red-400 hover:text-red-300 px-1.5 py-0.5"
                            >
                              {deleteMutation.isPending ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground px-1.5 py-0.5 border-l border-border/30"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                            title="Delete article"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
