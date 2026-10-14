import { MetadataRoute } from "next";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";
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
    "/about",
    "/contact",
    "/disclaimer",
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-01-01"),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const [wisdoms, articles] = await Promise.all([
      getAllWisdom(),
      getAllArticles()
    ]);

    (wisdoms as any[]).filter((w) => w.slug).forEach((w) => {
      routes.push({
        url: `${baseUrl}/wisdom/${w.slug}`,
        lastModified: w.updated_at ? new Date(w.updated_at) : (w.published_at ? new Date(w.published_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });

    (articles as any[]).filter((a) => a.slug).forEach((a) => {
      routes.push({
        url: `${baseUrl}/articles/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes", error);
  }

  return routes;
}
