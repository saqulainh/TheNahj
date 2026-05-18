"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function AudioReflectionsPage() {
  return (
    <ArticlesManager 
      categoryFilter="Audio Reflections"
      title="Audio Reflections CMS"
      description="Manage all podcasts, audio-narrated wisdom tracks, night reminders, and focus audio reflections."
    />
  );
}
