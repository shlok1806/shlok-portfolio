import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { RotatePresetScript } from "@/components/site/RotatePresetScript";
import { PixelCursor } from "@/components/site/PixelCursor";
import { ThemeColorMeta } from "@/components/site/ThemeColorMeta";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /*
   * The panel is pinned to the bottom of the screen, so the document has to own
   * the strip behind the home indicator rather than letting the browser letterbox
   * it away in a black bar. Panel pads itself back out of that strip with
   * env(safe-area-inset-bottom); without cover, env() reports zero and there is
   * nothing to pad out of.
   */
  viewportFit: "cover",
  /*
   * Deliberately no maximumScale and no userScalable. Pinning the scale is the
   * usual way to stop iOS zooming in on a focused input, and it takes
   * pinch-to-zoom away from everyone who needs it to do that. The terminal input
   * is 16px instead, which is the actual threshold Safari checks.
   */
  // Motif's root window, replaced with the live tube on mount by ThemeColorMeta
  themeColor: "#4a6076",
};

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
        {/* Must precede ThemeProvider - it decides which tube next-themes reads */}
        <RotatePresetScript />
        <ThemeProvider>
          <ThemeColorMeta />
          <PixelCursor />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
