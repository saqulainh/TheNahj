import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: "About Mission",
  description: `Why ${SITE_NAME} exists — a digital refuge for modern youth through the wisdom of Imam Ali (AS).`,
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="text-3xl font-medium text-foreground md:text-4xl">Our Mission</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        {SITE_NAME} is {SITE_DESCRIPTION.toLowerCase()}
      </p>

      <section className="mt-12 space-y-6 text-foreground/85">
        <h2 className="text-lg font-medium text-gold-light">Why Imam Ali (AS)?</h2>
        <p className="leading-relaxed">
          His words speak to discipline, justice, friendship, anger, and the inner life — with a
          clarity that feels modern because human struggles are not new. We translate that legacy
          for students doomscrolling at 2am and youth searching for purpose behind a screen.
        </p>

        <h2 className="text-lg font-medium text-gold-light">Modern youth struggles</h2>
        <p className="leading-relaxed">
          Social media addiction, exam anxiety, loneliness, validation hunger, haram attachment,
          identity confusion — these are not sidebar issues. They are the battlefield of this
          generation. We meet them with wisdom, not lectures.
        </p>

        <h2 className="text-lg font-medium text-gold-light">A digital refuge</h2>
        <p className="leading-relaxed">
          Not another crowded Islamic portal. Not a SaaS dashboard. A typography-first, mobile-first
          space to breathe, reflect, and return to what builds you — one card, one reflection, one
          honest step at a time.
        </p>
      </section>

      {/* Dev Reflection Quote Section */}
      <div className="mt-20 border-t border-border/25 pt-12">
        <div className="relative rounded-2xl border border-border/25 bg-surface/50 p-8 md:p-12 backdrop-blur-md overflow-hidden group">
          {/* Decorative gold gradient ambient glow */}
          <div className="pointer-events-none absolute -right-1/4 -top-1/4 h-[300px] w-[300px] rounded-full bg-gold/[0.03] blur-[80px] transition-all duration-500 group-hover:bg-gold/[0.05]" />
          
          {/* Stylized Quotation Mark */}
          <div className="flex justify-center mb-4">
            <span className="font-serif text-6xl text-gold/30 select-none leading-none">””</span>
          </div>

          <blockquote className="text-center">
            <p className="font-serif text-lg md:text-xl leading-relaxed text-foreground/90 italic max-w-xl mx-auto">
              &ldquo;Trying my best to be the one my Imam (a.t.f.s.) wants, striving to serve the community with every skill I have, working to unite the youth, and aiming to see every student of the Ahlulbayt succeed. Indeed, they are succeeding and will continue to do so.&rdquo;
            </p>
            <cite className="mt-8 block not-italic">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted/60 block mb-2">Developed & Maintained by</span>
              <a
                href="http://www.instagram.com/s_a_q_u_l_a_i_n__h?igsh=dGtvNmNodHJqNml3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold tracking-wider text-gold-light hover:text-gold transition-colors duration-300 underline underline-offset-4 decoration-gold/30 hover:decoration-gold"
              >
                s_a_q_u_l_a_i_n__h
              </a>
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
