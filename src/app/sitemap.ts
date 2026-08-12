import { MetadataRoute } from "next";

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

  return routes;
}
