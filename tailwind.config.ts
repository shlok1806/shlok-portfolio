import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    /*
     * Compiles every hover: utility as @media (hover: hover). Without it a tap
     * on a phone leaves the :hover style painted on whatever was tapped until
     * something else is touched - so the app lists and the root menu kept a row
     * highlighted after the window it opened had already covered them.
     */
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        /*
         * The width at which a window stops floating and goes full-screen - the
         * same number as SMALL_W in hooks/useWindowManager.ts. Tailwind's own
         * sm and md are 640 and 768 and neither is that, so chrome that has to
         * change with the window mode keys off this instead of guessing.
         */
        desk: "720px",
        /*
         * Chrome that only changes size for a finger - title bars, buttons, the
         * panel - keys off this instead of the useCoarsePointer hook, which
         * cannot know before mount and would paint one mouse-sized frame first.
         */
        coarse: { raw: "(pointer: coarse)" },
      },
      fontFamily: {
        // Swapped wholesale by the active remix preset
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-code)", "monospace"],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        faint: "hsl(var(--faint) / <alpha-value>)",
        // The accent as *text*. --primary is tuned to be a fill behind
        // --primary-foreground; at that lightness it is not legible as ink on
        // the document and chrome surfaces, so text uses this instead.
        "accent-ink": "hsl(var(--accent-ink) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
