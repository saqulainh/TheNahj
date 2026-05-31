"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function WisdomCardsPage() {
  return (
    <ArticlesManager 
      categoryFilter={["Imam Ali Says", "Student Corner", "Youth Corner", "Nahjul Balagha", "Audio Reflections"]}
      title="Wisdom Cards Manager"
      description="Manage all wisdom-card eligible posts: card media, topic/category mapping, featured flag, visibility status, and draft/published states."
    />
  );
}
