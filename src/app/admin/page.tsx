"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/brand";
import { BookOpen, Users, FileText, Headphones, ArrowRight, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

const stats = [
  { label: "Total Wisdom Cards", value: "142", icon: BookOpen, change: "+12 this week", trend: "up" },
  { label: "Articles Published", value: "24", icon: FileText, change: "+2 this week", trend: "up" },
  { label: "Audio Reflections", value: "38", icon: Headphones, change: "+5 this week", trend: "up" },
  { label: "Total Users", value: "1,204", icon: Users, change: "+84 this week", trend: "up" },
];

const recentActivity = [
  { action: "Published Wisdom Card", target: "The Value of Patience", time: "2 hours ago" },
  { action: "Updated Homepage", target: "Hero Section", time: "5 hours ago" },
  { action: "Added Audio", target: "Reflection on Loneliness", time: "1 day ago" },
  { action: "Published Article", target: "Understanding Digital Diseases", time: "2 days ago" },
];

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
      const response = await fetch(`/api/analytics/reflection?range=${reflectionRange}`);
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

      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Welcome to {SITE_NAME} CMS. Here is an overview of your platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
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
                topPracticedArticles.map((item) => (
                  <div key={item.articleSlug} className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-2.5">
                    <span className="truncate pr-3 text-sm text-foreground/90">{item.articleTitle}</span>
                    <span className="shrink-0 text-xs text-muted">{item.events} events · {item.completedSessions} completed</span>
                  </div>
                ))
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
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted">{activity.target}</p>
                    <p className="mt-1 text-xs text-muted/60">{activity.time}</p>
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


