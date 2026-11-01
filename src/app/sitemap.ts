import { MetadataRoute } from "next";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";
import { studentTopics, youthTopics } from "@/data/mock";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticRoutes = [
    "",
    "/wisdom",
    "/articles",
    "/flashcards",
    "/student",
    "/youth",
    "/nahjul-balagha",
    "/digital-diseases",
    "/before-you-text",
    "/situation-search",
    "/community",
    "/voice-assistant",
    "/focus",
    "/audio",
    "/karbala-connect",
    "/about",
    "/contact",
    "/disclaimer",
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-10-31"),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : (route === "/wisdom" || route === "/karbala-connect" || route === "/audio" ? 0.9 : 0.8),
  }));

  // Add Student Corner Topic routes
  studentTopics.forEach((t) => {
    routes.push({
      url: `${baseUrl}/student/${t.slug}`,
      lastModified: new Date("2026-10-31"),
      changeFrequency: "weekly",
      priority: 0.75,
    });
  });

  // Add Youth Corner Topic routes
  youthTopics.forEach((t) => {
    routes.push({
      url: `${baseUrl}/youth/${t.slug}`,
      lastModified: new Date("2026-10-31"),
      changeFrequency: "weekly",
      priority: 0.75,
    });
  });

  try {
    const [wisdoms, articles] = await Promise.all([
      getAllWisdom(),
      getAllArticles(),
    ]);

    (wisdoms as any[]).filter((w) => w.slug).forEach((w) => {
      routes.push({
        url: `${baseUrl}/wisdom/${w.slug}`,
        lastModified: w.updated_at ? new Date(w.updated_at) : (w.published_at ? new Date(w.published_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    });

    (articles as any[]).filter((a) => a.slug).forEach((a) => {
      routes.push({
        url: `${baseUrl}/articles/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.75,
      });
    });
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes", error);
  }

  return routes;
}
