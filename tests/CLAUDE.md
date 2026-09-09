# tests

Two kinds of test, and which one to write:

- **Logic stays hook- or function-level.** The window manager, terminal,
  games, wallpapers and sound are tested through `renderHook` or plain
  function calls. They do not get render tests.
- **Desktop components under `components/os/**` may have render tests** with
  `@testing-library/react` on jsdom (`render`, `screen`, `fireEvent`). Test
  behaviour a user can observe (keyboard navigation, what a click opens, what
  a queue shows), never classNames or pixels. Pixels are verified in a real
  browser with `.claude/skills/verify`.

`tests/setup.ts` installs an in-memory `localStorage`; nothing else is mocked
globally. Vitest runs with `esbuild.jsx: "automatic"` because tsconfig leaves
JSX for Next.
