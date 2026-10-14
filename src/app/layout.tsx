import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/components/providers/AppProviders";
import { PwaRegister } from "@/components/providers/PwaRegister";
import { AiGuidanceChatbot } from "@/components/chat/AiGuidanceChatbot";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { getCMSConfig } from "@/lib/cms";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCMSConfig();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      template: `%s | ${cms.brand.siteName}`,
    },
    description: cms.brand.description,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/favicon.ico", type: "image/x-icon" },
      ]
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: cms.brand.siteName,
    },
    keywords: [
      "TheNahj",
      "Imam Ali quotes",
      "Nahjul Balagha",
      "Islamic wisdom",
      "Student motivation",
      "Youth guidance",
      "Digital distraction",
      "Islamic reflections",
      "nahjul balagha quotes",
      "nahjul balagha ali as sayings",
      "nahj al-balagha",
      "nahjul balagha sayings",
      "nahj board"
    ],
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      description: cms.brand.description,
      url: SITE_URL,
      siteName: cms.brand.siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/thenahj-logo.jpeg",
          width: 512,
          height: 512,
          alt: cms.brand.siteName,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      description: cms.brand.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cms = await getCMSConfig();

  const sitewideGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": cms.brand.siteName,
        "url": `${SITE_URL}/`,
        "logo": {
          "@type": "ImageObject",
          "url": absoluteUrl("/thenahj-logo.jpeg"),
          "width": 512,
          "height": 512
        },
        "description": cms.brand.description,
        "sameAs": [
          cms.brand.socialLinks?.facebook || "",
          cms.brand.socialLinks?.twitter || "",
          cms.brand.socialLinks?.instagram || "",
          cms.brand.socialLinks?.youtube || "",
          cms.brand.socialLinks?.telegram || ""
        ].filter(Boolean),
        "nonprofitStatus": "Nonprofit",
        "slogan": cms.brand.tagline
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": `${SITE_URL}/`,
        "name": cms.brand.siteName,
        "description": cms.brand.description,
        "publisher": { "@id": "https://thenahj.live/#organization" },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://thenahj.live/situation-search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitewideGraph) }}
        />
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3502724348227726"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <Script id="thenahj-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('thenahj-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var n=(t==='light'||t==='dark')?t:(d?'dark':'light');document.documentElement.classList.toggle('dark',n==='dark');}catch(e){document.documentElement.classList.add('dark')}})();`}
        </Script>
        <AppProviders>
          <PwaRegister />
          <AiGuidanceChatbot />
          <Header siteName={cms.brand.siteName} links={cms.navigation.main} />
          <main className="min-h-[calc(100vh-8rem)] pt-20 md:pt-24 lg:pt-28">{children}</main>
          <Footer socialLinks={cms.brand.socialLinks} links={cms.navigation.footer} />
          <GlobalAudioPlayer />
          <Analytics />
          <SpeedInsights />
        </AppProviders>
      </body>
    </html>
  );
}
