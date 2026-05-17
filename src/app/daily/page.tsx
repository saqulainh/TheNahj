import { WisdomCard } from "@/components/wisdom/WisdomCard";
import { getDailyWisdom } from "@/lib/wisdom";

export const metadata = {
  title: "Daily Wisdom",
  description: "One wisdom card for today — reflect, save, share.",
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
