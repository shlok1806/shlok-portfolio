/**
 * A tube's colour on a menu row, drawn as a little raised colour button the
 * size of a pixmap: a bevelled plate of menu grey with the colour set into it.
 * The plate is the point. The current tube's colour is the highlight's own
 * colour, so a bare filled square on its lit row read as an empty outline,
 * exactly when the pointer was on it; on the plate it is a chip of that colour
 * whatever the row behind it is doing.
 */
export function Swatch({ color }: { color: string }) {
  return (
    <span aria-hidden className="bevel-thin block h-4 w-4 shrink-0 bg-secondary p-[2px]">
      <span className="block h-full w-full" style={{ background: color }} />
    </span>
  );
}
