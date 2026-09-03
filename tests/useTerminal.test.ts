import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTerminal } from "@/hooks/useTerminal";

function run(hook: ReturnType<typeof renderHook<ReturnType<typeof useTerminal>, unknown>>, cmd: string) {
  act(() => hook.result.current.setInput(cmd));
  act(() => hook.result.current.submit(null));
}

describe("useTerminal", () => {
  beforeEach(() => localStorage.clear());

  it("recalls command history from the last session", () => {
    const h = renderHook(() => useTerminal());
    run(h, "ls");
    run(h, "whoami");
    expect(JSON.parse(localStorage.getItem("os-shell-history")!)).toEqual(["whoami", "ls"]);
    const again = renderHook(() => useTerminal());
    expect(again.result.current.state.commandHistory).toEqual(["whoami", "ls"]);
  });

  it("records commands newest-first, deduped, and clears the input", () => {
    const h = renderHook(() => useTerminal());
    run(h, "ls");
    run(h, "cat resume.txt");
    run(h, "ls");
    expect(h.result.current.state.commandHistory).toEqual(["ls", "cat resume.txt"]);
    expect(h.result.current.state.history).toHaveLength(3);
    expect(h.result.current.state.input).toBe("");
  });

  it("does not record an empty submit but still appends an output entry", () => {
    const h = renderHook(() => useTerminal());
    run(h, "   ");
    expect(h.result.current.state.commandHistory).toEqual([]);
    expect(h.result.current.state.history).toHaveLength(1);
  });

  it("caps command history at 100", () => {
    const h = renderHook(() => useTerminal());
    for (let i = 0; i < 120; i++) run(h, `echo ${i}`);
    expect(h.result.current.state.commandHistory).toHaveLength(100);
    expect(h.result.current.state.commandHistory[0]).toBe("echo 119");
  });

  it("walks history with the arrows and returns to the draft line", () => {
    const h = renderHook(() => useTerminal());
    run(h, "one");
    run(h, "two");
    act(() => h.result.current.setInput("draft"));
    act(() => h.result.current.arrowUp());
    expect(h.result.current.state.input).toBe("two");
    act(() => h.result.current.arrowUp());
    expect(h.result.current.state.input).toBe("one");
    act(() => h.result.current.arrowUp());
    expect(h.result.current.state.input).toBe("one");
    act(() => h.result.current.arrowDown());
    expect(h.result.current.state.input).toBe("two");
    act(() => h.result.current.arrowDown());
    expect(h.result.current.state.input).toBe("");
    expect(h.result.current.state.historyIndex).toBe(-1);
  });

  it("typing resets the history cursor", () => {
    const h = renderHook(() => useTerminal());
    run(h, "one");
    act(() => h.result.current.arrowUp());
    expect(h.result.current.state.historyIndex).toBe(0);
    act(() => h.result.current.setInput("x"));
    expect(h.result.current.state.historyIndex).toBe(-1);
  });

  it("silentSubmit appends output without touching command history", () => {
    const h = renderHook(() => useTerminal());
    act(() => h.result.current.silentSubmit("whoami", null));
    expect(h.result.current.state.history[0].command).toBe("whoami");
    expect(h.result.current.state.commandHistory).toEqual([]);
  });

  it("clear empties the screen but keeps command history", () => {
    const h = renderHook(() => useTerminal());
    run(h, "ls");
    act(() => h.result.current.clear());
    expect(h.result.current.state.history).toEqual([]);
    expect(h.result.current.state.commandHistory).toEqual(["ls"]);
  });
});
