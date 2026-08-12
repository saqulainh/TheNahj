"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/brand";
import { BookOpen, Users, FileText, Headphones, ArrowRight, Home, AlertCircle, Search, Sparkles, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
}

type ReflectionRange = "24h" | "7d" | "30d";

function formatDelta(value: number | null) {
  if (value === null) return "No baseline";
  if (value === 0) return "0% vs previous";
  return `${value > 0 ? "+" : ""}${value}% vs previous`;
}

function deltaClassName(value: number | null) {
  if (value === null || value === 0) return "text-muted";
  return value > 0 ? "text-emerald-400" : "text-red-400";
}

export default function AdminDashboardPage() {
  const [reflectionRange, setReflectionRange] = useState<ReflectionRange>("7d");

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load stats");
      return json as {
        stats: {
          wisdomCardsCount: number;
          articlesCount: number;
          audioReflectionsCount: number;
          usersCount: number;
        };
        recentActivity: Array<{
          action: string;
          target: string;
          time: string;
        }>;
      };
    },
    retry: 1,
  });

  const statsList = [
    { label: "Total Wisdom Cards", value: statsLoading ? "..." : String(adminStats?.stats.wisdomCardsCount ?? 0), icon: BookOpen, change: "Real-time count" },
    { label: "Articles Published", value: statsLoading ? "..." : String(adminStats?.stats.articlesCount ?? 0), icon: FileText, change: "Real-time count" },
    { label: "Audio Reflections", value: statsLoading ? "..." : String(adminStats?.stats.audioReflectionsCount ?? 0), icon: Headphones, change: "Real-time count" },
    { label: "Total Users", value: statsLoading ? "..." : String(adminStats?.stats.usersCount ?? 1), icon: Users, change: "Unique participants" },
  ];

  const recentActivityList = adminStats?.recentActivity ?? [];

  const { error } = useQuery({
    queryKey: ["content-list-check"],
    queryFn: async () => {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load content");
      return json.items;
    },
    retry: 1,
  });

  const { data: reflectionSummary } = useQuery({
    queryKey: ["reflection-analytics-summary", reflectionRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/reflection?range=${reflectionRange}&top=50`);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to load reflection analytics");
      }
      return json.summary as {
        periodEvents: number;
        completedSessions: number;
        uniqueArticles: number;
        completionRatePct: number;
        range: ReflectionRange;
        sparklineEvents: number[];
        topPracticedArticles: Array<{
          articleSlug: string;
          articleTitle: string;
          events: number;
          completedSessions: number;
        }>;
        trend: {
          periodEventsDeltaPct: number | null;
          completedSessionsDeltaPct: number | null;
          uniqueArticlesDeltaPct: number | null;
          completionRateDeltaPct: number | null;
        };
      };
    },
    retry: 1,
  });

  const sparklineEvents = reflectionSummary?.sparklineEvents ?? [0, 0, 0, 0, 0, 0, 0];
  const sparklineMax = Math.max(1, ...sparklineEvents);
  const topPracticedArticles = reflectionSummary?.topPracticedArticles ?? [];
  const { data: ingestionHealth } = useQuery({
    queryKey: ["reflection-ingestion-health"],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/reflection/health`);
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || "Failed to load ingestion health");
      return j.recent as { lastEventAt: string | null; lastHour: number; last24h: number };
    },
    retry: 1,
  });

  const lastEventAt = ingestionHealth?.lastEventAt ? new Date(ingestionHealth.lastEventAt) : null;
  const now = Date.now();
  const minutesSinceLast = lastEventAt ? Math.round((now - lastEventAt.getTime()) / 60000) : Infinity;
  const [topPage, setTopPage] = useState(1);
  const TOP_PAGE_SIZE = 5;
  const topPageCount = Math.max(1, Math.ceil(topPracticedArticles.length / TOP_PAGE_SIZE));
  const topPageItems = topPracticedArticles.slice((topPage - 1) * TOP_PAGE_SIZE, topPage * TOP_PAGE_SIZE);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-red-400">Database Connection Issue Detected</h3>
              <p className="text-sm text-red-300/90">
                Failed to load articles: <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-red-300">{error instanceof Error ? error.message : String(error)}</code>
              </p>
              <div className="text-xs text-red-300/80 space-y-1 mt-2 border-t border-red-500/10 pt-2">
                <p className="font-medium text-red-300">How to solve this:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-white font-medium">Supabase Dashboard</a></li>
                  <li>Go to the <strong>SQL Editor</strong> tab</li>
                  <li>Copy and paste the contents of the file <code className="bg-black/30 px-1 py-0.2 rounded font-mono">supabase/migrations/001_articles_unified.sql</code></li>
                  <li>Click <strong>Run</strong> to create the <code className="bg-black/30 px-1 py-0.2 rounded font-mono">articles_unified</code> table and its supporting relations.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Welcome to {SITE_NAME} CMS. Here is an overview of your platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/ai-studio"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            <Sparkles size={16} />
            <span>AI Master Studio</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/40 bg-surface-alt text-gold font-semibold text-xs transition-colors hover:bg-surface-elevated"
          >
            <BarChart3 size={16} />
            <span>AI Analytics & Telemetry</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsList.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between text-muted">
                <span className="text-sm font-medium">{stat.label}</span>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-medium text-foreground">{stat.value}</span>
              </div>
              <div className="mt-2 text-xs text-gold-muted">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium text-foreground">Reflection Analytics</h2>
              <div className="text-sm text-muted">
                <span className={`inline-block mr-2 rounded-full h-2 w-2 ${minutesSinceLast <= 5 ? 'bg-emerald-400' : minutesSinceLast <= 60 ? 'bg-amber-400' : 'bg-red-400'}`} />
                <span className="align-middle">{minutesSinceLast === Infinity ? 'No data' : `${minutesSinceLast}m since last event`}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 p-1">
                {(["24h", "7d", "30d"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReflectionRange(option)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      reflectionRange === option
                        ? "bg-gold/20 text-gold-light"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Events ({reflectionSummary?.range ?? reflectionRange})</p>
              <p className="mt-2 text-2xl font-medium text-foreground">{reflectionSummary?.periodEvents ?? 0}</p>
              <p className={`mt-1 text-xs ${deltaClassName(reflectionSummary?.trend.periodEventsDeltaPct ?? null)}`}>
                {formatDelta(reflectionSummary?.trend.periodEventsDeltaPct ?? null)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Completed Sessions</p>
              <p className="mt-2 text-2xl font-medium text-foreground">{reflectionSummary?.completedSessions ?? 0}</p>
              <p className={`mt-1 text-xs ${deltaClassName(reflectionSummary?.trend.completedSessionsDeltaPct ?? null)}`}>
                {formatDelta(reflectionSummary?.trend.completedSessionsDeltaPct ?? null)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Articles Practiced</p>
              <p className="mt-2 text-2xl font-medium text-foreground">{reflectionSummary?.uniqueArticles ?? 0}</p>
              <p className={`mt-1 text-xs ${deltaClassName(reflectionSummary?.trend.uniqueArticlesDeltaPct ?? null)}`}>
                {formatDelta(reflectionSummary?.trend.uniqueArticlesDeltaPct ?? null)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Completion Rate</p>
              <p className="mt-2 text-2xl font-medium text-foreground">{reflectionSummary?.completionRatePct ?? 0}%</p>
              <p className={`mt-1 text-xs ${deltaClassName(reflectionSummary?.trend.completionRateDeltaPct ?? null)}`}>
                {formatDelta(reflectionSummary?.trend.completionRateDeltaPct ?? null)}
              </p>
            </div>
          </div>
          <div className="border-t border-border/70 px-6 pb-6 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Event Trend</p>
              <p className="text-[11px] text-muted">7-point sparkline</p>
            </div>
            <div className="flex h-14 items-end gap-1.5">
              {sparklineEvents.map((value, index) => {
                const normalized = value / sparklineMax;
                const height = Math.max(8, Math.round(normalized * 48));
                return (
                  <div
                    key={`spark-${index}`}
                    className="w-full rounded-sm bg-gold/60"
                    style={{ height }}
                    title={`Bucket ${index + 1}: ${value} events`}
                  />
                );
              })}
            </div>
          </div>
          <div className="border-t border-border/70 px-6 pb-6 pt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Top Practiced Articles</p>
              <div className="space-y-2">
                {topPracticedArticles.length === 0 ? (
                  <p className="text-sm text-muted">No practice data in this range yet.</p>
                ) : (
                  <>
                    {topPageItems.map((item) => (
                      <div key={item.articleSlug} className="rounded-lg border border-border/60 bg-background p-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <Link
                            href={`/admin/studio?slug=${encodeURIComponent(item.articleSlug)}`}
                            className="truncate text-sm text-foreground/90 transition-colors hover:text-gold-light"
                          >
                            {item.articleTitle}
                          </Link>
                          <Link
                            href={`/wisdom/${encodeURIComponent(item.articleSlug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs text-gold-muted transition-colors hover:text-gold-light"
                          >
                            Open Public
                          </Link>
                        </div>
                        <p className="mt-1 text-xs text-muted">{item.events} events · {item.completedSessions} completed</p>
                      </div>
                    ))}

                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <div>
                        Page {topPage} of {topPageCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                          disabled={topPage === 1}
                          className="rounded px-2 py-1 bg-background/70 disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopPage((p) => Math.min(topPageCount, p + 1))}
                          disabled={topPage === topPageCount}
                          className="rounded px-2 py-1 bg-background/70 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-6">
            <h2 className="font-medium text-foreground">Quick Actions</h2>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <Link 
              href="/admin/studio"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-gold-muted" />
                <span className="text-sm font-medium">Content Studio</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
            <Link 
              href="/admin/audio-reflections"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <div className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-gold-muted" />
                <span className="text-sm font-medium">Upload Audio</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
            <Link 
              href="/admin/studio?category=Articles"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gold-muted" />
                <span className="text-sm font-medium">Write Article</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
            <Link 
              href="/search"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gold-muted" />
                <span className="text-sm font-medium">Open Search</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
            <Link 
              href="/admin/homepage"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-gold-muted" />
                <span className="text-sm font-medium">Edit Homepage</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-6">
            <h2 className="font-medium text-foreground">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentActivityList.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted">{activity.target}</p>
                    <p className="mt-1 text-xs text-muted/60">{formatRelativeTime(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


