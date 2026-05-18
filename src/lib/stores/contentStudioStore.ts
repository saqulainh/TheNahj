import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentBlock } from "@/lib/content-schema";

interface StudioDraftState {
  draft: {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    featured_image: string | null;
    hero_image: string | null;
    sidebar_banner: string | null;
    arabic_content: string | null;
    english_content: string | null;
    urdu_content: string | null;
    seo_title: string | null;
    seo_description: string | null;
    schedule_publish_at: string | null;
    status: "draft" | "scheduled" | "published";
    content_blocks: ContentBlock[];
    reading_time: number;
    featured: boolean;
  };
  setDraft: (payload: Partial<StudioDraftState["draft"]>) => void;
  resetDraft: () => void;
}

const initialDraft: StudioDraftState["draft"] = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Imam Ali Says",
  tags: [],
  featured_image: null,
  hero_image: null,
  sidebar_banner: null,
  arabic_content: null,
  english_content: null,
  urdu_content: null,
  seo_title: null,
  seo_description: null,
  schedule_publish_at: null,
  status: "draft",
  content_blocks: [
    { id: "intro-heading", type: "heading", value: "Opening Reflection" },
    { id: "intro-paragraph", type: "paragraph", value: "" },
  ],
  reading_time: 0,
  featured: false,
};

export const useContentStudioStore = create<StudioDraftState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (payload) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...payload,
          },
        })),
      resetDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "thenahj-content-studio-draft",
    }
  )
);
