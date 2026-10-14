import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Muslim Community Reflections | TheNahj",
  description: "Share anonymous reflections and connect through Islamic wisdom from Imam Ali (AS).",
  alternates: { canonical: "https://thenahj.live/community" },
  robots: { index: true, follow: true },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
