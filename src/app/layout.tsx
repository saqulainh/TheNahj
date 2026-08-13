import type { Metadata } from "next";
import { Amiri, Inter, Noto_Nastaliq_Urdu, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
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
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  weight: ["400", "600"],
  subsets: ["arabic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCMSConfig();
  // Hardcoded to strictly fix P0 canonicals bug across the site
  const baseUrl = "https://www.thenahj.live";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      template: `%s | ${cms.brand.siteName}`,
    },
    description: cms.brand.description,
    manifest: "/manifest.json",
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
      "Islamic reflections"
    ],
    alternates: {
      canonical: "./",
    },
    openGraph: {
      title: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      description: cms.brand.description,
      url: baseUrl,
      siteName: cms.brand.siteName,
      locale: "en_US",
      type: "website",
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
        "@id": "https://www.thenahj.live/#organization",
        "name": cms.brand.siteName,
        "url": "https://www.thenahj.live/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.thenahj.live/TheNahj%20Logo.jpeg",
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
        "@id": "https://www.thenahj.live/#website",
        "url": "https://www.thenahj.live/",
        "name": cms.brand.siteName,
        "description": cms.brand.description,
        "publisher": { "@id": "https://www.thenahj.live/#organization" },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.thenahj.live/situation-search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitewideGraph) }}
        />
      </head>
      <body
        className={`${inter.variable} ${amiri.variable} ${notoUrdu.variable} ${instrumentSerif.variable} ${plusJakarta.variable} font-sans antialiased bg-background text-foreground`}
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
