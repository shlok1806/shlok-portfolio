# lib/placeholders

`generated.ts` is written by `scripts/placeholders.mjs` and nothing else. It
holds, for every screenshot `lib/content.ts` references, a 16-colour mosaic
(one cell per 24 source pixels, as a PNG data URI) that `ScreenFrame` stretches
over the frame with `image-rendering: pixelated` until the real image has
decoded, and a hash of the file the mosaic was made from.

**Add or retake a screenshot, then run `npm run placeholders` and commit the
result.** `tests/placeholders.test.ts` fails when a screenshot has no mosaic,
when a mosaic outlives its screenshot, and when the file under
`public/projects` no longer matches the hash, so a forgotten run shows up in
CI rather than as last year's picture flashing up before this year's.

`sharp` is a devDependency for this script only. Nothing generates the file
at build time, on purpose: the build stays independent of a native image
library, the same way the GitHub snapshot keeps it independent of the API.

Pick the cell size by looking at the result in a project window, not by byte
count: at 40px a dashboard became a dark rectangle with a smudge in it, at 24
its cards and chart are still there. The six mosaics are about 2.4KB together.
