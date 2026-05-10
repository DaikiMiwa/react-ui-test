# AGENTS.md

## Package manager

- Always use `pnpm` for package installation, dependency management, and script execution.
- Do not use `npm`, `npx`, `yarn`, or `bun` unless the user explicitly asks for them.
- Prefer `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm run <script>`, and `pnpm dlx <package>` as applicable.

## Design documentation

- Keep `DESIGN.md` as the source of truth for Workout UI design tokens, component intent, and screen-level design rules.
- When changing Workout UI behavior, layout, color, spacing, typography, or component states, update `DESIGN.md` in the same task unless the user explicitly asks to skip design docs.
- Validate design documentation with `pnpm dlx @google/design.md lint DESIGN.md`.
- Use `pnpm dlx @google/design.md export --format tailwind DESIGN.md` when checking whether tokens can be exported for Tailwind with the currently available CLI.
- Use `css-tailwind` only if the installed `@google/design.md` version reports that format as supported.
