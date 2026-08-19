"use client";

/**
 * Props that open a list row, whichever way it was asked for.
 *
 * A row is opened by double-click under a mouse and by a single tap on a phone,
 * and the tap half cannot go on onClick. With one window open it works; with a
 * second window already on screen WebKit stops synthesising the click after the
 * pointerup entirely - the row receives pointerdown and pointerup on the same
 * element and no click ever follows, so tapping a second game in /usr/games did
 * nothing at all. pointerup is the event that actually arrives, so on a coarse
 * pointer that is the one that opens the row.
 *
 * onClick is left to the mouse, where it is the right event and where the
 * double-click handler needs a single-click that does nothing.
 */
export function tapToOpen(open: () => void, touch: boolean) {
  return {
    onPointerUp: (e: React.PointerEvent) => {
      if (!touch || e.pointerType === "mouse") return;
      open();
    },
    onClick: () => {
      // A mouse gets here only through the double-click handler beside it
    },
    onDoubleClick: () => open(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter") open();
    },
  };
}
