/**
 * A number in a panel applet, in a field as wide as the widest reading it is
 * meant to hold, the way a 1993 applet printed into a fixed-width field.
 *
 * The dashes a placeholder shows only cover the readings that are as long as
 * they are. A full battery, which is also what Chrome reports for a desktop
 * with no battery at all, is a figure wider than `--%`, and a single-digit
 * winter temperature a figure narrower than `--°`; either one moved
 * everything to the applet's left when it landed. The widest reading sits
 * invisibly under the real one, so the field is that wide from the first
 * paint, and the real one is set flush right in it, as figures in a column
 * are.
 */
export function Readout({ value, widest }: { value: string; widest: string }) {
  return (
    <span className="grid tabular-nums">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {widest}
      </span>
      <span className="col-start-1 row-start-1 text-right">{value}</span>
    </span>
  );
}
