# lib/github

`snapshot.json` is a committed copy of what GitHub said the last time someone
ran `npm run github:sync`. Nothing on the site fetches GitHub at runtime or at
build time, on purpose: the panel and the project windows must never wait on
an API, and a rate limit must never blank a page. Refresh the file by running
the script (it uses the `gh` CLI you are logged in to) and commit the result.

`index.ts` is the only reader; components import from there, never from the
JSON directly, so the shape can change in one place.
