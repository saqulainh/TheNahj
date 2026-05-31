import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Narration, ContentBlock } from "@/lib/content-schema";

interface WisdomDraft {
  // Section 1: Basic Information
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  hero_image: string | null;
  sidebar_banner: string | null;
  hero_focal_point: { x: number; y: number } | null;
  featured_focal_point: { x: number; y: number } | null;
  sidebar_focal_point: { x: number; y: number } | null;
  reading_time: number;
  status: "draft" | "scheduled" | "published";
  featured: boolean;
  schedule_publish_at: string | null;

  // Section 2: Original Wisdom Content
  arabic_text: string;
  urdu_translation: string;
  english_translation: string;
  source: string;
  source_number: string;
  book_name: string;

  // Section 3: Explanation Area
  main_explanation: string;
  detailed_explanation: string;
  tafseer: string;
  historical_context: string;

  // Section 4: Related Narrations
  narrations: Narration[];

  // Section 5: Modern Relevance
  current_issues: string;
  youth_relevance: string;
  student_relevance: string;
  practical_application: string;

  // Section 6: Reflection
  reflection_questions: string;
  action_steps: string;
  personal_reflection: string;

  // Section 7: Conclusion
  summary: string;
  closing_reflection: string;

  // Section 8: SEO
  seo_title: string | null;
  seo_description: string | null;

  // Legacy compat
  content_blocks: ContentBlock[];
  arabic_content: string | null;
  english_content: string | null;
  urdu_content: string | null;
}

interface StudioDraftState {
  draft: WisdomDraft;
  setDraft: (payload: Partial<WisdomDraft>) => void;
  resetDraft: () => void;
}

export const createInitialDraft = (category: string = "Imam Ali Says"): WisdomDraft => ({
  title: "",
  slug: "",
  excerpt: "",
  category,
  tags: [],
  featured_image: null,
  hero_image: null,
  sidebar_banner: null,
  hero_focal_point: null,
  featured_focal_point: null,
  sidebar_focal_point: null,
  reading_time: 0,
  status: "draft",
  featured: false,
  schedule_publish_at: null,

  arabic_text: "",
  urdu_translation: "",
  english_translation: "",
  source: "",
  source_number: "",
  book_name: "",

  main_explanation: "",
  detailed_explanation: "",
  tafseer: "",
  historical_context: "",

  narrations: [],

  current_issues: "",
  youth_relevance: "",
  student_relevance: "",
  practical_application: "",

  reflection_questions: "",
  action_steps: "",
  personal_reflection: "",

  summary: "",
  closing_reflection: "",

  seo_title: null,
  seo_description: null,

  content_blocks: [],
  arabic_content: null,
  english_content: null,
  urdu_content: null,
});

const initialDraft: WisdomDraft = createInitialDraft();

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
      resetDraft: () => set({ draft: createInitialDraft() }),
    }),
    {
      name: "thenahj-wisdom-studio-draft",
    }
  )
);
