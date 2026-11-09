import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script, { type ScriptProps } from "next/script";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PageTitleSync } from "@/components/system/PageTitleSync";
import {
  BRAND_COLORS,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
  BRAND_TAGLINE,
  SITE_URL,
} from "@/lib/brand";

const syne = localFont({
  variable: "--font-syne",
  display: "swap",
  src: [
    {
      path: "../public/fonts/syne-greek.woff2",
      weight: "600 800",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-latin-ext.woff2",
      weight: "600 800",
      style: "normal",
    },
    {
      path: "../public/fonts/syne-latin.woff2",
      weight: "600 800",
      style: "normal",
    },
  ],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [
    {
      path: "../public/fonts/dm-sans-latin-ext.woff2",
      weight: "400 500",
      style: "normal",
    },
    {
      path: "../public/fonts/dm-sans-latin.woff2",
      weight: "400 500",
      style: "normal",
    },
  ],
});

const DEFAULT_TITLE = `${BRAND_NAME}: ${BRAND_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  appleWebApp: {
    title: BRAND_SHORT_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: BRAND_NAME,
    locale: "en_US",
    title: DEFAULT_TITLE,
    description: BRAND_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: BRAND_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLORS.background },
    {
      media: "(prefers-color-scheme: dark)",
      color: BRAND_COLORS.backgroundDark,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <PageTitleSync />
        <Script
          {...({
            src: "https://www.googletagmanager.com/gtag/js?id=G-DY93CNS1DD",
          } as ScriptProps)}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DY93CNS1DD');
          `}
        </Script>
        <Script
          {...({
            src: "https://static.cloudflareinsights.com/beacon.min.js",
            "data-cf-beacon": '{"token": "02cbf59965dc42c4ab476414afe269be"}',
          } as ScriptProps)}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
