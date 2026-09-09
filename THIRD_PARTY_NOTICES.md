# Third-party notices

## Opensource UI

Parts of this site are adapted from [Opensource UI](https://opensourceui.in)
([github.com/bidyut10/opensourceui](https://github.com/bidyut10/opensourceui)),
copyright (c) 2026 Bidyut Kundu, MIT License. Each adapted file carries a header
naming the source path. The adaptation rules are in
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md`.

```
MIT License

Copyright (c) 2026 Bidyut Kundu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Adapted files

The PR that adds an adapted file adds its row here.

| In this repo | Source in opensourceui |
| --- | --- |
| `components/os/applets/Xclock.tsx` | `components/widgets/analog-clock-widget.tsx` |
| `lib/os/wallpapers.ts` (the tile patterns) | `components/background-pattern/*` |
| `components/os/apps/ShortcutsApp.tsx` | `components/text/keyboard-shortcuts-card.tsx` |
| `components/os/CopyButton.tsx` | `components/buttons/copy-button.tsx` |
| `components/os/DownloadButton.tsx` | `components/buttons/download-button.tsx` |
| `components/os/apps/BuildLog.tsx` | `components/others/terminal-log-card.tsx` |
| `components/os/Spotlight.tsx` | `components/docks/spotlight-bar.tsx` |
| `components/os/Notifications.tsx`, `lib/os/notify.ts` | `components/notifications/system-alert-banner.tsx`, `toast-notification-banner.tsx` |
| `components/os/apps/RepoFacts.tsx` | `components/socials/github-repo-card.tsx` |
| `components/os/apps/GitLogApp.tsx` | `components/socials/github-contribution.tsx` |
| `components/os/applets/Weather.tsx`, `lib/os/weather.ts` | `components/others/weather-snapshot-card.tsx` |
| `components/os/applets/Tray.tsx` | `components/widgets/battery-face-widget.tsx`, `wifi-toggle-widget.tsx` |
| `components/os/ProgressRing.tsx` | `components/others/progress-ring-card.tsx` |
| `components/os/apps/ScreenFrame.tsx` | `components/mockups/laptop-mockup-card.tsx`, `phone-mockup-card.tsx` |
