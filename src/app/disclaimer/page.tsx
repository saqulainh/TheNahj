import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer & Privacy Policy | TheNahj",
  description: "Our policy regarding content, copyright, and data sources at TheNahj.",
};

export default function DisclaimerPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      
      <h1 className="text-3xl font-medium text-foreground md:text-4xl mb-4">Privacy & Disclaimer</h1>
      <p className="text-lg leading-relaxed text-muted mb-12">
        Respecting knowledge, honoring sources, and standing on truth.
      </p>
      
      <div className="space-y-8 text-foreground/85 leading-relaxed">
        
        <div>
          <h2 className="text-xl font-medium text-gold-light mb-4">Our Sources & Data Usage</h2>
          <p className="mb-4">
            We have collected data, wisdom, and teachings from numerous authentic sources all over the world to build this platform. Our sole intention is to spread the timeless wisdom of the Ahlulbayt (AS) and provide spiritual guidance to the modern, distracted generation.
          </p>
          <p>
            Wherever possible, we have explicitly mentioned all our sources, giving due credit to the original authors, scholars, translators, and websites (such as al-islam.org, imamandscience.com, and others). 
          </p>
        </div>

        <div className="rounded-xl bg-gold/5 p-6 border border-gold/10 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold-light/40 rounded-l-xl" />
          <p className="italic text-foreground/90 font-medium">
            If, by human error, we have missed giving credit to any source or author, we sincerely apologize from the bottom of our hearts (Hum maafi chahte hain). 
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gold-light mb-4">Copyright Removals</h2>
          <p className="mb-4">
            If any rightful owner or copyright holder is offended by the use of their content and cannot forgive us, please notify us via our <Link href="/contact" className="text-gold hover:underline">Contact page</Link> or email. We promise to remove your content completely upon our very first notice, without any hesitation.
          </p>
          <p>
            This website is entirely non-commercial and non-profit. We do not earn any money from this content. It is built purely out of reverence.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border/20 flex flex-col items-center text-center">
          <p className="text-2xl font-arabic text-gold-light mb-2">خادم امامِ ضامن (عج)</p>
          <p className="text-xs tracking-widest uppercase text-muted/60">Servant of Imam-e-Zamin (AJTF)</p>
        </div>
        
      </div>
    </section>
  );
}
