# components/os/applets

Things that live in the panel. The contract:

- An applet renders inside the 30px bar (52px under `coarse:`) and sizes
  itself with `my-[3px]` like every other panel control, so it grows with the
  bar instead of overflowing it.
- An applet has no window of its own. If pressing it should open one, it
  calls the panel's `onLaunch` with an app id that is registered in
  `lib/os/registry.tsx`; the window is that app's, not the applet's.
- Time, network and battery are read on the client only, after mount. The
  server renders a placeholder (`--:--`) so hydration never disagrees.
- **An applet holds its slot from the first paint.** The placeholder takes the
  same width as the reading it stands for, so nothing on the bar moves when a
  reading lands: the clock draws its dial before it has hands, the weather
  shows `--°` and a thermometer, the battery `--%`. In Inter with
  `tabular-nums` a hyphen is exactly a figure wide, so `--` covers any
  two-digit number. A number whose length varies goes in a `Readout`, a
  field sized by the widest reading it should hold (`100%`, `00°`), so a
  battery on the mains or a one-figure winter morning does not move the bar
  either; state such as charging goes in the glyph, never in a suffix. A
  slot may only go away in the mount commit (the battery, where the browser
  has no Battery API), which nobody sees: the boot screen is still up, or
  comes down in that same commit.
- Panel shifts are measured, not eyeballed: a buffered `layout-shift`
  PerformanceObserver after a cold load lists every element that moved.
- The panel drops some applets on a phone (the clock, the speaker). Check
  `Panel.tsx` before assuming an applet is always visible.
