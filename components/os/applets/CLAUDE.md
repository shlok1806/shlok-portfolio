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
- The panel drops some applets on a phone (the clock, the speaker). Check
  `Panel.tsx` before assuming an applet is always visible.
