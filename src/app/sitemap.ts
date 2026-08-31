import { MetadataRoute } from "next";
import { getAllWisdom, getAllArticles } from "@/lib/wisdom";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thenahj.live";

  const staticRoutes = [
    "",
    "/wisdom",
    "/student",
    "/youth",
    "/nahjul-balagha",
    "/situation-search",
    "/community",
    "/voice-assistant",
    "/graph",
    "/focus",
    "/audio",
    "/about",
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const [wisdoms, articles] = await Promise.all([
      getAllWisdom(),
      getAllArticles()
    ]);

    (wisdoms as any[]).forEach((w) => {
      routes.push({
        url: `${baseUrl}/wisdom/${w.slug}`,
        lastModified: w.updated_at ? new Date(w.updated_at) : (w.published_at ? new Date(w.published_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });

    (articles as any[]).forEach((a) => {
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
