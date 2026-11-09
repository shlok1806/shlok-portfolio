# Context

## Content model

`lib/content.ts` is the single source of truth for every fact on the site. The
terminal, the windowed apps and `/resume` all render from it, so they cannot
drift from each other.

### `public/shlok_thakkar_resume.pdf` is outside that guarantee

The downloadable PDF is a checked-in binary, produced by hand from a LaTeX
source that does not live in this repo. Nothing generates it, compares it, or
warns when it falls behind, so it is the one place a fact can be wrong while
every other surface is right.

**Change `lib/content.ts` and `public/shlok_thakkar_resume.pdf` together.** A content edit
that skips the PDF ships a contradiction: the site says one thing and the
document a recruiter downloads and forwards says another.

The PDF is a one-page subset, not a copy: it can leave out roles and projects
the site shows (as of Nov 2026 it omits Dept. of Finance and IQM, and lists only
greenroom and Switchboard). What it does state must match `lib/content.ts`.

Last refreshed 2026-11-09 from the startup-focused LaTeX resume. This fixed the
gap in issue #7, where the Aug 2026 PDF omitted JCAIL and PPL and dated Stealth
Startup as "Present".

To read the committed PDF's text and compare it against `EXPERIENCE`:

```sh
python3 -c "
import re,zlib
d=open('public/shlok_thakkar_resume.pdf','rb').read()
txt=[]
for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S):
    try: txt.append(zlib.decompress(m.group(1)))
    except Exception: pass
blob=b'\n'.join(txt).decode('latin-1')
print(' '.join(w[1:-1] for w in re.findall(r'\((?:[^()\\\\]|\\\\.)*\)', blob)))
"
```

## Vocabulary

- **app**: something that opens in a window. It exists only as an entry in
  `APPS` in `lib/os/registry.tsx` and receives `AppProps`.
- **applet**: something that lives in the panel (the music widget, the clock).
  It has no window of its own unless it also registers an app.
- **desktop furniture**: what is neither app nor applet: the root menu, the
  screensaver, the boot screen, spotlight, the notification tray.
- **preset**, also **tube**: one of the four themes (Motif, CDE, Console,
  twm). "Tube" is the word the verify skill uses; both mean the same thing.
- **pixmap**: a 16x16 one-bit icon in `lib/os/icons.tsx`. The site has no
  other kind of icon.

## Surfaces

The site is one client-rendered window manager, so nothing user-facing is
observable from stdout - a change has to be seen in a browser. `.claude/skills/verify`
covers booting and driving the desktop.

Two details that repeatedly cost time:

- **Scrollbars only render under a fine pointer.** `app/globals.css` styles
  `::-webkit-scrollbar` inside `@media (pointer: fine)`, which is what opts the
  document panes out of the platform's overlay scrollbars. Headless Chrome
  reports no scrollbar width at all, so a scrollbar cannot be verified headless -
  drive a headed browser when the change touches one.
- **The preset rotates every visit** until someone picks one. Set both `theme`
  and `remix-chosen` in `localStorage` before comparing anything across reloads.
