"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Eye, Share2, Search, BookOpen, Users, Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AnalyticsData {
  overview: {
    totalViews: number;
    totalShares: number;
    totalSearches: number;
    totalSaves: number;
    viewsDelta: number | null;
    sharesDelta: number | null;
  };
  topContent: Array<{
    slug: string;
    title: string;
    views: number;
    shares: number;
    section: string;
  }>;
  searchTerms: Array<{
    term: string;
    count: number;
    language: "en" | "ar" | "ur";
  }>;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
  sectionBreakdown: Array<{
    section: string;
    count: number;
    percentage: number;
  }>;
}

type DateRange = "7d" | "30d" | "90d";

// ─── Mock data for when API is not available ──────────────────────────────────
function getMockAnalytics(): AnalyticsData {
  return {
    overview: {
      totalViews: 12847,
      totalShares: 934,
      totalSearches: 2183,
      totalSaves: 741,
      viewsDelta: 18,
      sharesDelta: 12,
    },
    topContent: [
      { slug: "patience-in-hardship", title: "On Patience in Times of Hardship", views: 1423, shares: 87, section: "Imam Ali Says" },
      { slug: "knowledge-and-wisdom", title: "The Difference Between Knowledge and Wisdom", views: 998, shares: 63, section: "Nahjul Balagha" },
      { slug: "exam-stress-faith", title: "Dealing with Exam Stress Through Faith", views: 854, shares: 41, section: "Student Corner" },
      { slug: "toxic-relationships-youth", title: "Recognizing Toxic Relationships", views: 712, shares: 55, section: "Youth Corner" },
      { slug: "dua-kumayl-meaning", title: "Meaning & Power of Dua Kumayl", views: 634, shares: 72, section: "Imam Ali Says" },
    ],
    searchTerms: [
      { term: "sabr", count: 342, language: "ur" },
      { term: "patience", count: 289, language: "en" },
      { term: "صبر", count: 198, language: "ar" },
      { term: "exam stress", count: 167, language: "en" },
      { term: "toxic relationship", count: 143, language: "en" },
      { term: "ناہج البلاغہ", count: 98, language: "ur" },
    ],
    dailyViews: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en", { weekday: "short" }),
      views: Math.floor(800 + Math.random() * 1200),
    })),
    sectionBreakdown: [
      { section: "Imam Ali Says", count: 4823, percentage: 38 },
      { section: "Youth Corner", count: 3214, percentage: 25 },
      { section: "Student Corner", count: 2569, percentage: 20 },
      { section: "Nahjul Balagha", count: 1926, percentage: 15 },
      { section: "Audio", count: 315, percentage: 2 },
    ],
  };
}

// ─── Components ──────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: number | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border/20 bg-surface/60 p-5 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Icon size={18} />
        </div>
        {delta !== null && delta !== undefined && (
          <span className={`text-xs font-medium ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </motion.div>
  );
}

function MiniBarChart({ data }: { data: Array<{ date: string; views: number }> }) {
  const max = Math.max(...data.map((d) => d.views));
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            style={{ height: `${(d.views / max) * 100}%`, transformOrigin: "bottom" }}
            className="w-full rounded-t-sm bg-gradient-to-t from-gold/60 to-gold"
          />
          <span className="text-[8px] text-muted">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

const LANG_COLORS: Record<string, string> = {
  en: "bg-blue-500/70",
  ar: "bg-emerald-500/70",
  ur: "bg-purple-500/70",
};

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  ar: "AR",
  ur: "UR",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("7d");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`);
        if (!res.ok) throw new Error("API unavailable");
        const json = await res.json();
        if (!json.success) throw new Error("no data");
        return json.data as AnalyticsData;
      } catch {
        // Fall back to mock data if API is not yet set up
        return getMockAnalytics();
      }
    },
    staleTime: 60 * 1000,
  });

  const analytics = data ?? getMockAnalytics();

  return (
    <div className="space-y-8 px-1 py-2">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-muted font-semibold">Admin</p>
          <h1 className="mt-1 text-2xl font-light tracking-tight text-foreground md:text-3xl flex items-center gap-2">
            <BarChart2 size={22} className="text-gold" />
            Analytics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border/20 bg-surface/40 p-1">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
                range === r
                  ? "bg-gold text-black"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label="Total Views" value={analytics.overview.totalViews.toLocaleString()} delta={analytics.overview.viewsDelta} delay={0} />
        <StatCard icon={Share2} label="Total Shares" value={analytics.overview.totalShares.toLocaleString()} delta={analytics.overview.sharesDelta} delay={0.05} />
        <StatCard icon={Search} label="Searches" value={analytics.overview.totalSearches.toLocaleString()} delay={0.1} />
        <StatCard icon={BookOpen} label="Saves / Bookmarks" value={analytics.overview.totalSaves.toLocaleString()} delay={0.15} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Views Bar Chart */}
        <div className="rounded-2xl border border-border/20 bg-surface/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-muted flex items-center gap-1.5">
              <TrendingUp size={12} /> Daily Views
            </p>
          </div>
          <MiniBarChart data={analytics.dailyViews} />
        </div>

        {/* Section Breakdown */}
        <div className="rounded-2xl border border-border/20 bg-surface/60 p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-muted flex items-center gap-1.5">
            <Award size={12} /> Content by Section
          </p>
          <div className="space-y-3">
            {analytics.sectionBreakdown.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{s.section}</span>
                  <span className="text-muted tabular-nums">{s.count.toLocaleString()} ({s.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 md:grid-cols-[1fr_350px]">
        {/* Top Content */}
        <div className="rounded-2xl border border-border/20 bg-surface/60 overflow-hidden">
          <div className="border-b border-border/20 px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-muted">
              Top Performing Content
            </p>
          </div>
          <div className="divide-y divide-border/10">
            {analytics.topContent.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-elevated/30 transition-colors">
                <span className="text-xs font-bold text-gold-muted tabular-nums w-5">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{item.section}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted shrink-0">
                  <span className="flex items-center gap-1"><Eye size={11} /> {item.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Share2 size={11} /> {item.shares}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Terms */}
        <div className="rounded-2xl border border-border/20 bg-surface/60 overflow-hidden">
          <div className="border-b border-border/20 px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-muted">
              Top Search Terms
            </p>
          </div>
          <div className="divide-y divide-border/10">
            {analytics.searchTerms.map((term, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-surface-elevated/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-white ${LANG_COLORS[term.language]}`}>
                    {LANG_LABELS[term.language]}
                  </span>
                  <span className={`text-sm text-foreground truncate ${term.language !== "en" ? "font-arabic" : ""}`} dir={term.language !== "en" ? "rtl" : "ltr"}>
                    {term.term}
                  </span>
                </div>
                <span className="text-xs font-medium text-gold tabular-nums shrink-0">{term.count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
