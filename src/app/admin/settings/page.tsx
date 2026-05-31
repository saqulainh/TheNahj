"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "",
    tagline: "",
    description: "",
    primaryColor: "",
    supportEmail: "",
    socialLinks: {
      instagram: "",
      telegram: "",
      youtube: "",
      facebook: "",
      twitter: ""
    }
  });
  
  const [status, setStatus] = useState<string | null>(null);
  const [fullConfig, setFullConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        setFullConfig(data);
        setSettings(data.brand);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving global settings...");
    
    const newConfig = {
      ...fullConfig,
      brand: settings
    };

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      
      if (res.ok) {
        setStatus("Settings updated successfully.");
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("Failed to save.");
      }
    } catch (error) {
      setStatus("Error saving.");
    }
  };

  const update = (key: string, value: string) => {
    if (key.includes("social.")) {
      const socialKey = key.split(".")[1];
      setSettings(s => ({
        ...s,
        socialLinks: { ...s.socialLinks, [socialKey]: value }
      }));
    } else {
      setSettings(s => ({ ...s, [key]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Global Settings</h1>
        <p className="mt-2 text-sm text-muted">Configure site-wide preferences, branding, and integrations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Branding */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background/50 px-6 py-4">
            <h2 className="text-lg font-medium text-foreground">Branding & Identity</h2>
            <p className="text-sm text-muted">Core information displayed across the site.</p>
          </div>
          <div className="p-6 grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Site Name</span>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => update("siteName", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Tagline</span>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Site Description (SEO)</span>
              <textarea
                value={settings.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Primary Brand Color (Hex)</span>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="h-11 w-11 rounded-lg cursor-pointer bg-background border border-border p-1"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none uppercase"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background/50 px-6 py-4">
            <h2 className="text-lg font-medium text-foreground">Social Integrations</h2>
            <p className="text-sm text-muted">Links to your external platforms.</p>
          </div>
          <div className="p-6 grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Instagram URL</span>
              <input
                type="url"
                value={settings.socialLinks.instagram}
                onChange={(e) => update("social.instagram", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Telegram URL</span>
              <input
                type="url"
                value={settings.socialLinks.telegram}
                onChange={(e) => update("social.telegram", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">YouTube URL</span>
              <input
                type="url"
                value={settings.socialLinks.youtube || ""}
                onChange={(e) => update("social.youtube", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Facebook URL</span>
              <input
                type="url"
                value={settings.socialLinks.facebook || ""}
                onChange={(e) => update("social.facebook", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Twitter URL</span>
              <input
                type="url"
                value={settings.socialLinks.twitter || ""}
                onChange={(e) => update("social.twitter", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Support Email</span>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update("supportEmail", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gold/15 px-8 py-4 text-sm font-medium tracking-wide text-gold-light hover:bg-gold/25 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save Settings
          </button>
          {status && (
            <span className="text-sm text-gold-muted animate-in fade-in slide-in-from-left-2">
              {status}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
