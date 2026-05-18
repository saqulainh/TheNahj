import type { Metadata } from "next";
import { Amiri, Inter, Noto_Nastaliq_Urdu, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/components/providers/AppProviders";
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
  return {
    title: {
      default: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      template: `%s | ${cms.brand.siteName}`,
    },
    description: cms.brand.description,
    openGraph: {
      title: `${cms.brand.siteName} — ${cms.brand.tagline}`,
      description: cms.brand.description,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cms = await getCMSConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} ${notoUrdu.variable} ${instrumentSerif.variable} ${plusJakarta.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Script id="thenahj-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('thenahj-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var n=(t==='light'||t==='dark')?t:(d?'dark':'light');document.documentElement.classList.toggle('dark',n==='dark');}catch(e){document.documentElement.classList.add('dark')}})();`}
        </Script>
        <AppProviders>
          <Header siteName={cms.brand.siteName} links={cms.navigation.main} />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <Footer socialLinks={cms.brand.socialLinks} links={cms.navigation.footer} />
          <Analytics />
          <SpeedInsights />
        </AppProviders>
      </body>
    </html>
  );
}
