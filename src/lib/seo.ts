import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://thenahj.live").replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, `${SITE_URL}/`).toString();
}

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = "/thenahj-logo.jpeg",
  type = "website",
  noindex = false,
}: PageSeoOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TheNahj",
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function websiteJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "TheNahj",
        url: `${SITE_URL}/`,
        logo: absoluteUrl("/thenahj-logo.jpeg"),
        description,
        sameAs: [
          "https://www.instagram.com/thenahj",
          "https://t.me/thenahj",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "TheNahj",
        description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image = "/thenahj-logo.jpeg",
  category = "Islamic Wisdom",
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  category?: string;
  keywords?: string[];
}) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const pubDate = datePublished ? new Date(datePublished).toISOString() : new Date("2026-01-01").toISOString();
  const modDate = dateModified ? new Date(dateModified).toISOString() : pubDate;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "TheNahj",
      url: `${SITE_URL}/`,
    },
    headline: title,
    description: description,
    image: [imageUrl],
    datePublished: pubDate,
    dateModified: modDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: [
      {
        "@type": "Person",
        name: "Imam Ali ibn Abi Talib (AS)",
        description: "Fourth Caliph of Islam, First Shia Imam, and author of the teachings in Nahjul Balagha (Peak of Eloquence).",
      },
      {
        "@type": "Organization",
        name: "TheNahj Editorial Team",
        url: `${SITE_URL}/about`,
      },
    ],
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "TheNahj",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/thenahj-logo.jpeg"),
      },
    },
    articleSection: category,
    keywords: keywords.join(", "),
    inLanguage: "en-US",
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
