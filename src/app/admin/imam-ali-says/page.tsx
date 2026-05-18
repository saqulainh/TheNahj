"use client";

import { ArticlesManager } from "@/components/admin/ArticlesManager";

export default function ImamAliSaysPage() {
  return (
    <ArticlesManager 
      categoryFilter="Imam Ali Says"
      title="Imam Ali Says"
      description="Manage all quotes, short translations, and core wisdom cards belonging to Imam Ali (AS)."
    />
  );
}
