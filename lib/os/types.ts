import type { OpenOptions } from "@/hooks/useWindowManager";

/** Every app window receives these. */
export interface AppProps {
  /** the window's argument, e.g. which project to render */
  arg?: string;
  /** lets an app spawn another window, e.g. the file manager opening a project */
  open: (opts: OpenOptions) => string | null;
}
