import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { getDailyWisdom } from "@/lib/wisdom";

export const metadata = {
  title: "Daily Wisdom — Imam Ali (AS) Quote of the Day",
  description: "Get a fresh Imam Ali (AS) quote every day. Daily Islamic wisdom with Arabic text, Urdu & English translation — reflect, save, and share.",
  keywords: [
    "Imam Ali quote of the day",
    "Daily Islamic quote",
    "Hadith of the day",
    "Nahjul Balagha daily",
    "Islamic daily reminder",
    "Ahlulbayt daily wisdom",
    "Muslim daily motivation",
  ],
  openGraph: {
    title: "Daily Wisdom — Imam Ali (AS) Quote of the Day",
    description: "A fresh Imam Ali (AS) quote every day with modern reflections.",
    url: "https://thenahj.live/daily",
    type: "website",
  },
};

export default async function DailyPage() {
  const daily = await getDailyWisdom();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-center text-3xl font-medium text-foreground">Daily Wisdom</h1>
      <p className="mt-4 text-center text-muted">One reflection for today. Return tomorrow.</p>
      <section className="mt-12">
        <WisdomCard wisdom={daily} />
      </section>
    </section>
  );
}
