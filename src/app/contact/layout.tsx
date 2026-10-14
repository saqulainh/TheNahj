import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with TheNahj team.",
  alternates: { canonical: "https://thenahj.live/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
