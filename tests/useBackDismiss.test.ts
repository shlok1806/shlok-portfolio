import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useBackDismiss } from "@/hooks/useBackDismiss";

/** Two layers, `top` over `under`, each closed by its own dismiss */
function useLayers(enabled: boolean, initial: { top: boolean; under: boolean }) {
  const [open, setOpen] = useState(initial);
  useBackDismiss(enabled, [
    { open: open.top, dismiss: () => setOpen((o) => ({ ...o, top: false })) },
    { open: open.under, dismiss: () => setOpen((o) => ({ ...o, under: false })) },
  ]);
  return { open, setOpen };
}

const popped = () => new Promise<void>((resolve) => window.addEventListener("popstate", () => resolve(), { once: true }));

/** The visitor presses Back and the page settles */
async function pressBack() {
  await act(async () => {
    const done = popped();
    window.history.back();
    await done;
  });
}

/** Lets a history.back() the hook started itself land */
async function settle() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("useBackDismiss", () => {
  it("closes one layer per Back, top-most first, then lets Back leave", async () => {
    const base = window.history.length;
    const h = renderHook(() => useLayers(true, { top: true, under: true }));
    // Exactly one entry on top of the page while anything is open
    expect(window.history.length).toBe(base + 1);

    await pressBack();
    expect(h.result.current.open).toEqual({ top: false, under: true });
    // Re-armed for the layer still showing, still only one entry deep
    expect(window.history.length).toBe(base + 1);

    await pressBack();
    expect(h.result.current.open).toEqual({ top: false, under: false });
    await settle();
    // Nothing left, so nothing was pushed again: the next Back is the browser's
    expect(window.history.state?.shlokosBack).toBeUndefined();
    h.unmount();
  });

  it("takes its entry back off when the visitor closes everything themselves", async () => {
    const h = renderHook(() => useLayers(true, { top: false, under: true }));
    expect(window.history.state?.shlokosBack).toBe(true);
    const armedLength = window.history.length;

    const done = popped();
    act(() => h.result.current.setOpen({ top: false, under: false }));
    await act(async () => {
      await done;
    });
    await settle();
    // Back on the page's own entry, and the history no deeper than before
    expect(window.history.state?.shlokosBack).toBeUndefined();
    expect(window.history.length).toBe(armedLength);
    h.unmount();
  });

  it("does not let its own clean-up pop close something opened meanwhile", async () => {
    const h = renderHook(() => useLayers(true, { top: false, under: true }));
    const done = popped();
    // Closed by hand, and something else opened before the clean-up lands
    act(() => h.result.current.setOpen({ top: false, under: false }));
    act(() => h.result.current.setOpen({ top: true, under: false }));
    await act(async () => {
      await done;
    });
    await settle();
    expect(h.result.current.open).toEqual({ top: true, under: false });
    expect(window.history.state?.shlokosBack).toBe(true);

    // And the visitor's own Back still closes it
    await pressBack();
    expect(h.result.current.open).toEqual({ top: false, under: false });
    h.unmount();
  });

  it("leaves Back alone when it is not enabled", () => {
    const base = window.history.length;
    const h = renderHook(() => useLayers(false, { top: true, under: true }));
    expect(window.history.length).toBe(base);
    expect(window.history.state?.shlokosBack).toBeUndefined();
    h.unmount();
  });

  it("picks up the entry it left before a reload instead of stacking another", async () => {
    window.history.pushState({ shlokosBack: true }, "");
    const base = window.history.length;
    const h = renderHook(() => useLayers(true, { top: true, under: false }));
    expect(window.history.length).toBe(base);
    await pressBack();
    expect(h.result.current.open).toEqual({ top: false, under: false });
    h.unmount();
  });
});
