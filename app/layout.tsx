import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { RotatePresetScript } from "@/components/site/RotatePresetScript";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/*
 * X11 toolkits drew their chrome in Helvetica and their terminals in a fixed
 * font, so the UI gets a neutral grotesque and everything inside a document or
 * a terminal gets mono.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono-src",
  display: "swap",
});

const DESCRIPTION =
  "Shlok Thakkar - software engineer. CS + Economics @ UIUC. Building agentic AI, distributed systems, and low-latency infrastructure.";

export const metadata: Metadata = {
  // Open Graph and sitemap URLs must be absolute; without this they resolve
  // relative and the preview card silently breaks.
  metadataBase: new URL(SITE_URL),
  title: { default: "ShlokOS - Shlok Thakkar", template: "%s" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Shlok Thakkar",
    title: "Shlok Thakkar - Software Engineer",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Shlok Thakkar - Software Engineer",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen antialiased">
        {/*
          Entrance animations server-render with opacity:0 and only become
          visible once Motion runs. Without JS that would hide the content, so
          opt those elements back in when scripting is off.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/* Must precede ThemeProvider - it decides which tube next-themes reads */}
        <RotatePresetScript />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
