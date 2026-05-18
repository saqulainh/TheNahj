"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function NahjulBalaghaPage() {
  return (
    <ArticlesManager 
      categoryFilter="Nahjul Balagha"
      title="Nahjul Balagha CMS"
      description="Manage articles, explanations, and studies of sermons, letters, and wisdom from Nahjul Balagha."
    />
  );
}
