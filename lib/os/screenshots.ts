import type { Project } from "@/lib/content";

/**
 * Getting a project's screenshots ready before its window asks for them.
 *
 * An image fetched through `new Image()` lands in the document's list of
 * available images, and an <img> created later with the same src is complete
 * the moment it exists - so a project window opened after this has run paints
 * its screenshots in its first frame instead of over a mosaic.
 *
 * Two strengths. Fetching all of them is done once the file manager is open,
 * at idle: about 56KB, paid only by someone who has gone looking at projects,
 * rather than by every visitor to a desktop most people read the shell of.
 * Decoding is done for one project at a time, when the pointer or the
 * keyboard lands on its row: a decoded 960x600 capture is 2.3MB of memory,
 * which is fine for the one about to be opened and wasteful for all six.
 */

const fetched = new Map<string, HTMLImageElement>();

function srcsOf(p: Project): string[] {
  return Object.values(p.screenshots ?? {}).map((s) => s.src);
}

function image(src: string, priority: "low" | "auto"): HTMLImageElement {
  let img = fetched.get(src);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.fetchPriority = priority;
    img.src = src;
    // Kept, so the entry in the list of available images outlives this call
    fetched.set(src, img);
  }
  return img;
}

/** Someone who asked the browser to save data did not ask for screenshots of windows they have not opened */
function frugal(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c?.saveData || c?.effectiveType === "slow-2g" || c?.effectiveType === "2g";
}

/** Fetches every project's screenshots when the browser is idle. Returns a cancel. */
export function prefetchScreenshots(projects: Project[]): () => void {
  if (typeof window === "undefined" || frugal()) return () => {};
  const run = () => projects.flatMap(srcsOf).forEach((src) => image(src, "low"));
  if (typeof window.requestIdleCallback !== "function") {
    const t = setTimeout(run, 1000);
    return () => clearTimeout(t);
  }
  const id = window.requestIdleCallback(run, { timeout: 4000 });
  return () => window.cancelIdleCallback(id);
}

/** Fetches and decodes one project's screenshots now, because its window is probably next. */
export function warmScreenshots(p: Project): void {
  if (typeof window === "undefined" || frugal()) return;
  for (const src of srcsOf(p)) {
    image(src, "auto")
      .decode()
      .catch(() => {
        /* the window will show the mosaic and try again itself */
      });
  }
}
