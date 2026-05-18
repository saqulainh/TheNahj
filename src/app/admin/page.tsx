"use client";

import { SITE_NAME } from "@/lib/brand";
import { BookOpen, Users, FileText, Headphones, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

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

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
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


