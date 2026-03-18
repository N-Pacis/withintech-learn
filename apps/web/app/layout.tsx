import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import Script, { type ScriptProps } from "next/script";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://learn.withintech.org"),
  title: "WithinTech Learn — Study at your pace",
  description:
    "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.",
  openGraph: {
    type: "website",
    url: "https://learn.withintech.org",
    siteName: "WithinTech Learn",
      title: "WithinTech Learn — Study at your pace",
      description:
      "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.",
  },
  twitter: {
    card: "summary",
    title: "WithinTech Learn — Study at your pace",
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
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Script
          {...({ src: "https://www.googletagmanager.com/gtag/js?id=G-DY93CNS1DD" } as ScriptProps)}
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
      </body>
    </html>
  );
}
