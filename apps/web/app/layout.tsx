import type { Metadata } from "next";
import localFont from "next/font/local";
import Script, { type ScriptProps } from "next/script";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PageTitleSync } from "@/components/system/PageTitleSync";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://learn.withintech.org"),
  title: {
    default: "WithinTech Learn: Study at your pace",
    template: `%s`,
  },
  description:
    "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.",
  openGraph: {
    type: "website",
    url: "https://learn.withintech.org",
    siteName: "WithinTech Learn",
    title: "WithinTech Learn: Study at your pace",
    description:
      "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.",
  },
  twitter: {
    card: "summary",
    title: "WithinTech Learn: Study at your pace",
    description:
      "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.",
  },
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
