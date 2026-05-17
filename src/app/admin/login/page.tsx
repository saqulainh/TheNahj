"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center px-4 py-12">
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">{SITE_NAME}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-gold-muted">{SITE_TAGLINE}</p>
      </div>
      <h1 className="mt-8 text-center text-xl font-medium text-foreground">Admin sign in</h1>
      <p className="mt-2 text-center text-sm text-muted">Wisdom CMS — authorized editors only</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold/15 py-3 text-sm font-medium text-gold-light hover:bg-gold/25 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-muted">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
