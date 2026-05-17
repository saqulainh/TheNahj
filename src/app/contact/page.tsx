"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-20">
      <h1 className="text-3xl font-medium text-foreground">Contact</h1>
      <p className="mt-4 text-muted">
        Questions, content suggestions, or collaboration — we would love to hear from you.
      </p>

      {sent ? (
        <p className="mt-10 text-gold-light">Thank you. Your message has been received.</p>
      ) : (
        <form
          className="mt-10 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input
            type="text"
            placeholder="Name"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
          />
          <textarea
            placeholder="Message"
            required
            rows={5}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gold/15 py-3 text-sm font-medium text-gold-light hover:bg-gold/25"
          >
            Send message
          </button>
        </form>
      )}
    </section>
  );
}
