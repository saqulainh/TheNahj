import type { MetadataRoute } from "next";
import { studentTopics, youthTopics, platformTopics } from "@/data/mock";
import { getCategories, getAllWisdom } from "@/lib/wisdom";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenahj.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, wisdomItems] = await Promise.all([
    getCategories(),
    getAllWisdom(),
  ]);

  const staticRoutes = [
    "",
    "/wisdom",
    "/student",
    "/youth",
    "/topics",
    "/articles",
    "/focus",
    "/daily",
    "/saved",
    "/about",
    "/contact",
    "/nahjul-balagha",
    "/digital-diseases",
    "/before-you-text",
    "/audio",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const wisdomRoutes = wisdomItems.map((w) => ({
    url: `${BASE}/wisdom/${w.slug}`,
    lastModified: new Date(w.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const topicRoutes = [
    ...studentTopics.map((t) => `/student/${t.slug}`),
    ...youthTopics.map((t) => `/youth/${t.slug}`),
    ...platformTopics.map((t) => `/topics/${t.slug}`),
    ...categories.map((c) => `/topics/${c.slug}`),
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...wisdomRoutes, ...topicRoutes];
}

