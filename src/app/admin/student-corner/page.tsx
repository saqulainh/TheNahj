"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function StudentCornerPage() {
  return (
    <ArticlesManager 
      categoryFilter="Student Corner"
      title="Student Corner CMS"
      description="Manage focus guides, exam advice, productivity, and academic struggles articles."
    />
  );
}
