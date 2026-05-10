# AGENTS.md

## Package manager

- Always use `pnpm` for package installation, dependency management, and script execution.
- Do not use `npm`, `npx`, `yarn`, or `bun` unless the user explicitly asks for them.
- Prefer `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm run <script>`, and `pnpm dlx <package>` as applicable.

## Multi-session browser checks

- Prefer `pnpm run dev:codex` when launching the app for Codex/browser inspection.
- This starts Vite on an available local port and opens Chrome with a session-specific `--user-data-dir` and `--remote-debugging-port`, so multiple Codex sessions can inspect the app at the same time without fighting over the same DevTools endpoint or Chrome profile lock.
- The launcher writes `.codex/session-<id>.json` with the app URL and DevTools port for the current session. Set `CODEX_SESSION_ID`, `CODEX_APP_PORT`, `CHROME_DEBUGGING_PORT`, or `CHROME_PATH` when a session needs explicit values. Set `CODEX_OPEN_CHROME=0` for server-only or Playwright-only runs.

## Design documentation

- Keep `DESIGN.md` as the source of truth for Workout UI design tokens, component intent, and screen-level design rules.
- When changing Workout UI behavior, layout, color, spacing, typography, or component states, update `DESIGN.md` in the same task unless the user explicitly asks to skip design docs.
- Validate design documentation with `pnpm dlx @google/design.md lint DESIGN.md`.
- Use `pnpm dlx @google/design.md export --format tailwind DESIGN.md` when checking whether tokens can be exported for Tailwind with the currently available CLI.
- Use `css-tailwind` only if the installed `@google/design.md` version reports that format as supported.
