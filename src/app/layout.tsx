import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "@/styles/rethink-foundation.scss";
import "@/styles/_reset.scss";
import "@/components/layout/breakpoint-hardgate.scss";
import BreakpointHardGate from "@/components/layout/BreakpointHardGate";
import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ready 2 Print",
  description: "All rights reserved.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
            <AnalyticsPageView />
          </>
        )}
        <BreakpointHardGate />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
