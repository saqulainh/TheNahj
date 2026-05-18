"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function YouthCornerPage() {
  return (
    <ArticlesManager 
      categoryFilter="Youth Corner"
      title="Youth Corner CMS"
      description="Manage articles addressing relationships, mental models, digital habits, and personal identity."
    />
  );
}
