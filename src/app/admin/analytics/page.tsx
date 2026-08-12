"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bot, RefreshCw, ArrowLeft, Sparkles, Database, Globe, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");
      return json.analytics;
    },
  });

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/agent/sync-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://imamandscience.com/" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSyncResult(`Successfully indexed ${json.indexedChunksCount} chunks from ${json.sourceTitle}`);
        refetch();
      } else {
        setSyncResult(`Sync warning: ${json.error || "Failed"}`);
      }
    } catch {
      setSyncResult("Network error triggering agent sync.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/20 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-surface-alt hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-gold" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">Executive AI Command & Telemetry</h1>
            </div>
            <p className="text-xs text-muted">Real-time user search intent, autonomous agent logs, and daily AI briefings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-studio"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-black font-bold text-xs shadow-md hover:bg-gold-light transition-all"
          >
            <Sparkles size={14} />
            <span>Open AI Master Studio</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted gap-2 text-sm">
          <Loader2 size={18} className="animate-spin text-gold" />
          <span>Analyzing system telemetry & generating AI briefing...</span>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Executive AI Briefing Panel */}
          <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-surface-alt via-surface-elevated to-surface-alt p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                <Sparkles size={16} className="animate-pulse" />
                <span>Daily AI Executive Briefing</span>
              </div>
              <span className="text-[10px] text-muted">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="space-y-2">
              {data?.insights?.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Knowledge Agent Control Panel */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/20 pb-3">
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                <Bot size={16} />
                <span>Autonomous Knowledge Agent Panel</span>
              </div>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/40 bg-gold/10 text-gold text-xs font-semibold hover:bg-gold/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                <span>{syncing ? "Syncing..." : "Sync Knowledge Now"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-background border border-border/30">
                <span className="text-muted block text-[10px] uppercase font-semibold">Agent Status</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5 mt-1">
                  <CheckCircle size={14} /> {data?.agentStatus?.status}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/30">
                <span className="text-muted block text-[10px] uppercase font-semibold">Target Source</span>
                <span className="text-gold font-semibold text-xs truncate block mt-1">
                  {data?.agentStatus?.targetSite}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/30">
                <span className="text-muted block text-[10px] uppercase font-semibold">Indexed Vectors</span>
                <span className="text-foreground font-extrabold text-lg block mt-1">
                  {data?.agentStatus?.indexedChunks}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/30">
                <span className="text-muted block text-[10px] uppercase font-semibold">Last Auto-Sync</span>
                <span className="text-muted font-medium text-xs block mt-1">
                  {data?.agentStatus?.lastScraped}
                </span>
              </div>
            </div>

            {syncResult && (
              <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-gold text-xs">
                {syncResult}
              </div>
            )}
          </div>

          {/* User Search & Chat Intent Telemetry */}
          <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold border-b border-border/20 pb-3">
              <TrendingUp size={16} />
              <span>User Search & Chat Intent Breakdown</span>
            </div>

            <div className="space-y-3">
              {data?.topSearchTopics?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>{item.topic}</span>
                    <span className="text-gold">{item.count} queries ({item.percentage})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border/20">
                    <div
                      className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-700"
                      style={{ width: item.percentage }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
