import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useSafeArea } from "@/hooks/useSafeArea";

const root = document.documentElement;

afterEach(() => {
  for (const side of ["top", "right", "bottom", "left"]) root.style.removeProperty(`--safe-${side}`);
});

describe("useSafeArea", () => {
  it("reads no inset where the stylesheet resolved none", () => {
    const h = renderHook(() => useSafeArea());
    expect(h.result.current).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("follows the insets when the screen rotates", () => {
    root.style.setProperty("--safe-top", "47px");
    root.style.setProperty("--safe-bottom", "34px");
    const h = renderHook(() => useSafeArea());
    expect(h.result.current).toEqual({ top: 47, right: 0, bottom: 34, left: 0 });

    root.style.setProperty("--safe-top", "0px");
    root.style.setProperty("--safe-left", "47px");
    root.style.setProperty("--safe-right", "47px");
    root.style.setProperty("--safe-bottom", "21px");
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(h.result.current).toEqual({ top: 0, right: 47, bottom: 21, left: 47 });
  });
});
