"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function WisdomCardsPage() {
  return (
    <ArticlesManager 
      categoryFilter="Imam Ali Says"
      title="Wisdom Cards Manager"
      description="Manage all short-form daily reflections and classical wisdom cards."
    />
  );
}
