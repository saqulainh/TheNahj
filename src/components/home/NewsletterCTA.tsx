"use client";

import { useState } from "react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStatus("done");
  };

  return (
    <section className="relative py-12 md:py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="noise-overlay relative overflow-hidden rounded-3xl border border-gold/10 bg-gradient-to-b from-gold/[0.04] via-surface/60 to-transparent p-10 md:p-16">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.05] blur-[100px]" />

          <div className="relative z-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              Stay Connected
            </p>
            <h2 className="mt-4 text-xl font-light text-foreground md:text-2xl">
              Daily Wisdom in your inbox
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted/60">
              One reflection. One reminder. No spam — just calm guidance for your week.
            </p>

            {status === "done" ? (
              <p className="mt-8 text-sm text-gold-light">
                Thank you. We will be in touch soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-full border border-border/40 bg-background/60 px-5 py-3 text-sm text-foreground placeholder:text-muted/40 backdrop-blur-sm focus:border-gold/30 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gold/10 px-6 py-3 text-sm font-medium text-gold-light transition-all duration-300 hover:bg-gold/20 hover:shadow-[0_0_30px_-10px_rgba(201,162,39,0.2)]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
