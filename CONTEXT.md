# Context

## Content model

`lib/content.ts` is the single source of truth for every fact on the site. The
terminal, the windowed apps and `/resume` all render from it, so they cannot
drift from each other.

### `public/resume.pdf` is outside that guarantee

The downloadable PDF is a checked-in binary, produced by hand from a LaTeX
source that does not live in this repo. Nothing generates it, compares it, or
warns when it falls behind, so it is the one place a fact can be wrong while
every other surface is right.

**Change `lib/content.ts` and `public/resume.pdf` together.** A content edit
that skips the PDF ships a contradiction: the site says one thing and the
document a recruiter downloads and forwards says another.

This has already happened. As of Sep 2026 the committed PDF (last updated
2026-08-15) omits the JCAIL, Parallel Programming Lab and Dept. of Finance
roles, and dates Stealth Startup as "Present" where `lib/content.ts` has it
ending Aug 2026. See issue #7.

To read the committed PDF's text and compare it against `EXPERIENCE`:

```sh
python3 -c "
import re,zlib
d=open('public/resume.pdf','rb').read()
txt=[]
for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S):
    try: txt.append(zlib.decompress(m.group(1)))
    except Exception: pass
blob=b'\n'.join(txt).decode('latin-1')
print(' '.join(w[1:-1] for w in re.findall(r'\((?:[^()\\\\]|\\\\.)*\)', blob)))
"
```

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
