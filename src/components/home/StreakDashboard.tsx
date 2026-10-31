"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Trophy, Calendar, Star, Sparkles, Moon, BookOpen, Sun, Compass } from "lucide-react";
import { useStreak, getHeatmapData } from "@/lib/streak";

export function StreakDashboard({ variant = "full" }: { variant?: "teaser" | "full" } = {}) {
  const { streak } = useStreak();

  const heatmap = getHeatmapData(streak.readDates);
  const earnedBadges = streak.badges.filter((b) => b.earned);
  const nextBadge = streak.badges.find((b) => !b.earned);

  const getIcon = (iconName: string, className: string = "") => {
    switch (iconName) {
      case "sparkles": return <Sparkles className={className} />;
      case "moon": return <Moon className={className} />;
      case "book-open": return <BookOpen className={className} />;
      case "star": return <Star className={className} />;
      case "sun": return <Sun className={className} />;
      case "compass": return <Compass className={className} />;
      default: return <Star className={className} />;
    }
  };

  if (variant === "teaser") {
    return (
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/10 bg-[#1c1915] p-5 text-[#f7f1e7] shadow-[0_24px_70px_-45px_rgba(28,20,10,.75)] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-48 w-48 rounded-full bg-[#c7a654]/10 blur-[70px]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d9bb79]/25 bg-[#d9bb79]/10 text-[#e2c583]">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#c8a95f]">Your practice</p>
              <h3 className="mt-1 font-display text-lg font-semibold">Nur Journey</h3>
            </div>
          </div>
          <div className="flex items-center gap-5 sm:gap-7">
            <div>
              <p className="font-display text-3xl font-semibold leading-none tracking-tight text-[#e2c583] tabular-nums">{streak.currentStreak}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.14em] text-white/45">Nur days</p>
            </div>
            <div className="hidden h-9 w-px bg-white/10 sm:block" />
            <div>
              <p className="font-display text-2xl font-semibold leading-none tabular-nums">{streak.totalDays}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.14em] text-white/45">Days read</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:justify-end">
            <Link href="/daily" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7f1e7] px-5 text-xs font-semibold text-[#211b14] transition-colors hover:bg-[#e2c583]">
              Read today <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/profile" className="text-xs text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">Full journey</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#1c1915] p-5 text-[#f7f1e7] shadow-[0_28px_80px_-40px_rgba(28,20,10,.75)] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#c7a654]/10 blur-[90px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#fff_0.7px,transparent_0.7px)] [background-size:14px_14px]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d9bb79]/25 bg-[#d9bb79]/10 text-[#e2c583]">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-[#c8a95f]">Your practice</p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl">Nur Journey</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#d9bb79]/25 bg-[#d9bb79]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[#e2c583]">
              Level {Math.max(1, Math.floor(streak.currentStreak / 7) + 1)}
            </span>
            <Link href="/daily" className="group inline-flex items-center gap-1.5 text-xs font-medium text-white/75 transition-colors hover:text-white">
              Read today <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid gap-5 py-5 sm:grid-cols-[.9fr_1.1fr] sm:items-stretch sm:gap-7 sm:py-6">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-white/45">Current rhythm</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold leading-none tracking-[-.06em] text-[#e2c583] tabular-nums">{streak.currentStreak}</span>
                <span className="text-sm text-white/65">Nur days</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[.08] bg-white/[.035] p-3.5">
                <Trophy size={15} className="mb-2 text-[#d9bb79]" />
                <p className="text-xl font-semibold tabular-nums">{streak.longestStreak}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[.13em] text-white/45">Best streak</p>
              </div>
              <div className="rounded-2xl border border-white/[.08] bg-white/[.035] p-3.5">
                <Calendar size={15} className="mb-2 text-[#d9bb79]" />
                <p className="text-xl font-semibold tabular-nums">{streak.totalDays}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[.13em] text-white/45">Days read</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[.08] bg-black/15 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/75">A little, often</p>
                <p className="mt-1 text-xs text-white/40">Your last 90 days</p>
              </div>
              <span className="text-[10px] text-white/45">{earnedBadges.length} of {streak.badges.length} badges</span>
            </div>
            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 sm:gap-[5px]">
              {heatmap.map((day) => (
                <div
                  key={day.date}
                  className={`aspect-square rounded-[3px] transition-colors ${day.count > 0 ? "bg-[#d9bb79] shadow-[0_0_10px_rgba(217,187,121,.22)]" : "bg-white/[.075]"}`}
                  title={`${day.date}: ${day.count > 0 ? "Read" : "Missed"}`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-3">
              <div className="flex items-center gap-2 text-[10px] text-white/45">
                <span className="h-2 w-2 rounded-sm bg-white/10" /> Less
                <span className="h-2 w-2 rounded-sm bg-[#d9bb79]/55" />
                <span className="h-2 w-2 rounded-sm bg-[#d9bb79]" /> More
              </div>
              {nextBadge && <p className="max-w-[52%] truncate text-[10px] text-[#e2c583]">Next: {nextBadge.name}</p>}
            </div>
          </div>
        </div>

        {streak.badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="mr-1 text-[9px] font-semibold uppercase tracking-[.18em] text-white/40">Milestones</span>
            {streak.badges.map((badge) => (
              <span
                key={badge.id}
                title={badge.description}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] transition-colors ${badge.earned ? "border-[#d9bb79]/30 bg-[#d9bb79]/10 text-[#e2c583]" : "border-white/[.08] text-white/35"}`}
              >
                {getIcon(badge.icon, "h-3 w-3")}
                {badge.name}
              </span>
            ))}
          </div>
        )}

        {nextBadge && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#d9bb79]/15 bg-[#d9bb79]/[.06] px-3.5 py-3">
            <span className="text-[#d9bb79]">{getIcon(nextBadge.icon, "h-4 w-4")}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
                <span className="truncate text-white/70">Next milestone · {nextBadge.name}</span>
                <span className="shrink-0 tabular-nums text-[#e2c583]">{streak.currentStreak}/{nextBadge.requiredDays}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (streak.currentStreak / nextBadge.requiredDays) * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#a98239] to-[#e2c583]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
