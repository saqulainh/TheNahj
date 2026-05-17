"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  BookOpen,
  Feather,
  GraduationCap,
  Users,
  MessageSquare,
  Hash,
  FileText,
  Headphones,
  Library,
  FolderTree,
  Image as ImageIcon,
  Search,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { SITE_NAME } from "@/lib/brand";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/wisdom-cards", label: "Wisdom Cards", icon: BookOpen },
  { href: "/admin/imam-ali-says", label: "Imam Ali Says", icon: Feather },
  { href: "/admin/student-corner", label: "Student Corner", icon: GraduationCap },
  { href: "/admin/youth-corner", label: "Youth Corner", icon: Users },
  { href: "/admin/nahjul-balagha", label: "Nahjul Balagha", icon: MessageSquare },
  { href: "/admin/topics", label: "Topics", icon: Hash },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/audio-reflections", label: "Audio Reflections", icon: Headphones },
  { href: "/admin/collections", label: "Collections", icon: Library },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/media-library", label: "Media Library", icon: ImageIcon },
  { href: "/admin/seo-manager", label: "SEO Manager", icon: Search },
  { href: "/admin/navigation", label: "Navigation Menu", icon: Menu },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-surface flex flex-col z-10">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="font-medium text-foreground tracking-wide text-lg">
          {SITE_NAME} <span className="text-gold-muted text-xs uppercase tracking-widest ml-1">CMS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
              
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? "bg-gold/15 text-gold-light font-medium" 
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
