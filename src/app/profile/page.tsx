"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStreak } from "@/lib/streaks";
import { useBookmarks } from "@/lib/bookmarks";
import { Flame, Bookmark, Award, LogOut, User, Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { streak } = useStreak();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [activeTab, setActiveTab] = useState<"bookmarks" | "badges">("bookmarks");

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-gold/80 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-gold/30 bg-surface-alt/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30 mx-auto">
            <User size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to TheNahj</h1>
            <p className="text-xs text-muted leading-relaxed">
              Log in to save your daily reading streaks, bookmark favorite wisdom quotes, and sync your personalized recommendations across devices.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gold py-3.5 px-4 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
            >
              <Sparkles size={16} />
              <span>Continue with Google / Quick Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-surface-alt via-surface-elevated to-surface-alt p-6 md:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div 
            className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-gold/50 shadow-md group cursor-pointer"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover transition-opacity group-hover:opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <span className="text-[10px] text-white font-bold uppercase">Edit</span>
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64 = reader.result as string;
                  const updatedProfile = { ...user, avatarUrl: base64 };
                  // Update local context manually
                  localStorage.setItem("thenahj_user_profile", JSON.stringify(updatedProfile));
                  window.location.reload(); // Refresh to let auth-context pick it up, or we can handle it gracefully.
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {user.name} <ShieldCheck size={18} className="text-gold" />
            </h1>
            <p className="text-xs text-muted">{user.email}</p>
            <p className="text-[10px] text-gold font-semibold uppercase tracking-widest mt-1">Seeker of Wisdom</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-border/40 bg-background px-4 py-2 text-xs font-medium text-muted hover:text-foreground hover:border-red-500/40 transition-colors"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Stats & Streak Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Streak Card */}
        <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/10 via-surface-alt to-surface-elevated p-6 text-center space-y-2 shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-gold text-xs uppercase font-bold tracking-widest">
            <Flame size={18} className="animate-bounce text-orange-400" />
            <span>Daily Noor Streak</span>
          </div>
          <p className="text-4xl font-extrabold text-foreground">{streak.currentStreak} <span className="text-sm font-normal text-muted">Days</span></p>
          <p className="text-[10px] text-muted">Best Streak: {streak.bestStreak} Days | Total Read: {streak.totalCardsRead} Cards</p>
        </div>

        {/* Saved Bookmarks Count */}
        <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 text-center space-y-2 shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-gold text-xs uppercase font-bold tracking-widest">
            <Bookmark size={18} />
            <span>My Reflections</span>
          </div>
          <p className="text-4xl font-extrabold text-foreground">{bookmarks.length} <span className="text-sm font-normal text-muted">Saved</span></p>
          <p className="text-[10px] text-muted">Personal Digital Wisdom Diary</p>
        </div>

        {/* Milestones / Badges Count */}
        <div className="rounded-3xl border border-border/30 bg-surface-alt/70 p-6 text-center space-y-2 shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-gold text-xs uppercase font-bold tracking-widest">
            <Award size={18} />
            <span>Badges Unlocked</span>
          </div>
          <p className="text-4xl font-extrabold text-foreground">{streak.badges.length} <span className="text-sm font-normal text-muted">Badges</span></p>
          <p className="text-[10px] text-muted">Spiritual Milestones Achieved</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/20 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`pb-3 transition-all flex items-center gap-2 ${
            activeTab === "bookmarks" ? "border-b-2 border-gold text-gold" : "text-muted hover:text-foreground"
          }`}
        >
          <Bookmark size={14} /> Saved Bookmarks ({bookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={`pb-3 transition-all flex items-center gap-2 ${
            activeTab === "badges" ? "border-b-2 border-gold text-gold" : "text-muted hover:text-foreground"
          }`}
        >
          <Award size={14} /> My Badges ({streak.badges.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "bookmarks" && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Bookmark size={32} className="text-muted/40 mx-auto" />
              <p className="text-xs text-muted">No saved wisdom quotes yet. Click the bookmark icon on any card to save it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((item) => (
                <div key={item.slug} className="rounded-2xl border border-border/30 bg-surface-alt/70 p-5 space-y-3 flex flex-col justify-between hover:border-gold/30 transition-all">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gold uppercase tracking-wider font-bold">{item.source}</span>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-foreground/80 italic line-clamp-3">&quot;{item.quote}&quot;</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <Link
                      href={`/wisdom/${item.slug}`}
                      className="text-xs font-bold text-gold flex items-center gap-1 hover:underline"
                    >
                      Read Card <ArrowRight size={12} />
                    </Link>

                    <button
                      onClick={() => toggleBookmark(item)}
                      className="text-[10px] text-muted hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "badges" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {streak.badges.map((badge, idx) => (
            <div key={idx} className="rounded-2xl border border-gold/30 bg-gold/5 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{badge}</h4>
                <p className="text-[10px] text-muted">Unlocked milestone</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
