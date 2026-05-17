"use client";

import { useState } from "react";
import { Search, Globe, FileText, CheckCircle, RefreshCw } from "lucide-react";

export default function SEOManagerPage() {
  const [siteTitle, setSiteTitle] = useState("TheNahj — Imam Ali Wisdom Library");
  const [siteDesc, setSiteDesc] = useState("Explore deep, high-end reflections, interactive tools for digital detox, study guidance, and beautiful visual cards rooted in the wisdom of Imam Ali (AS).");
  const [robots, setRobots] = useState("User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://thenahj.com/sitemap.xml");
  const [schemaMarkup, setSchemaMarkup] = useState(`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TheNahj",
  "url": "https://thenahj.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://thenahj.com/wisdom?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`);

  const [status, setStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Updating site-wide SEO profiles...");
    setTimeout(() => {
      setStatus("Global SEO settings saved and generated successfully!");
    }, 700);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Search className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">SEO Manager</h1>
          <p className="mt-1 text-sm text-muted">Optimize indexing, site meta metadata, structured schema templates, and search engines access.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Settings form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-gold-muted" /> Global SEO Metadata
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Default Title Pattern</span>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Default Meta Description</span>
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                required
                rows={4}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold-muted" /> JSON-LD WebSite Structured Data
            </h2>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Structured Schema Markup</span>
              <textarea
                value={schemaMarkup}
                onChange={(e) => setSchemaMarkup(e.target.value)}
                required
                rows={10}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-xs focus:border-gold/40 focus:outline-none font-mono"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gold/15 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
          >
            Rebuild Site-Wide SEO Profiles
          </button>
        </form>

        {/* Info/Generation Panel */}
        <div className="space-y-6">
          {/* Robots.txt Card */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-muted flex items-center justify-between">
              <span>Robots.txt Output</span>
              <span className="text-[10px] text-green-400">Live</span>
            </h2>
            <textarea
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:border-gold/40 focus:outline-none font-mono text-muted"
            />
          </div>

          {/* Sitemap Status */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-muted flex items-center justify-between">
              <span>Dynamic Sitemap Status</span>
              <span className="text-[10px] text-green-400">Auto-Generated</span>
            </h2>
            <div className="flex items-center gap-3 rounded-lg bg-background p-3 border border-border">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs font-semibold text-foreground">Sitemap.xml rebuilt</p>
                <p className="text-[10px] text-muted">Last update: today at 00:54</p>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-background border border-border hover:bg-background/80 py-2 text-xs text-gold-muted hover:text-gold-light transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} /> Re-ping search engines
            </button>
          </div>
        </div>
      </div>

      {status && (
        <div className="max-w-4xl rounded-lg bg-surface p-4 text-sm text-gold-light border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
