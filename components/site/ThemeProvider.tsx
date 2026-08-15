"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { PRESET_IDS, DEFAULT_PRESET } from "@/lib/theme/presets";

/**
 * Presets are plain themes as far as next-themes is concerned. Passing an
 * explicit `themes` list replaces the default light/dark pair, and
 * enableSystem={false} stops the OS preference from overriding a chosen preset.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      themes={PRESET_IDS}
      defaultTheme={DEFAULT_PRESET.id}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemeProvider>
  );
}
