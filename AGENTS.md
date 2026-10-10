# Repository Guidelines

## Project Structure & Module Organization

This Vue 3, TypeScript, and uni-app frontend uses Vite, Pinia, and UnoCSS for badminton scheduling, scoring, statistics, and account flows.

- `src/pages/`: routed screens, including `schedule`, `scheduleDetails`, and `matchDetails`; register routes in `src/pages.json`.
- `src/components/badminton/`: shared match form and list; the detail page owns scoring and statistics presentation.
- `src/api/competition.ts`: active account and competition endpoints; `src/utils/request.ts` handles transport and session expiry.
- `src/store/modules/user.ts`: session state; match detail state stays within the page to prevent cross-match leakage.
- `src/types/competition.ts`: API contracts. `src/__tests__/`: unit tests, including mutation retry behavior.
- `src/static/`: images and tab-bar icons; `src/uni.scss`: shared styling; `src/types/`: declarations.
- `src/manifest.json`: platform settings. Treat `dist/` and `coverage/` as generated output.

## Build, Test, and Development Commands

Use pnpm with the existing lockfile:

- `pnpm install`: install dependencies.
- `pnpm dev:h5`: start H5 development.
- `pnpm dev:mp-weixin`: watch and compile the WeChat mini-program.
- `pnpm build:h5` / `pnpm build:mp-weixin`: create platform builds.
- `pnpm test`: run Vitest with coverage.
- `pnpm type-check`: run `vue-tsc` without emitting files.
- `pnpm lint` / `pnpm lint:stylelint`: apply ESLint/Stylelint fixes.
- `pnpm format`: format source files using Prettier.

These commands are references, not authorization for agents to execute checks.

## Coding Style & Naming Conventions

Follow ESLint's two-space indentation, double quotes, and semicolons. Use TypeScript and `@/` source imports. Preserve neighboring naming conventions: routed pages commonly use `index.vue`, while shared components use descriptive names such as `MatchForm.vue`. Keep endpoint logic in API modules and shared state in Pinia. Avoid unrelated formatting changes and manual edits to generated auto-import declarations.

## Testing Guidelines

Vitest uses a Node environment and text/HTML coverage reports. No positive coverage minimum is configured. Name tests `src/__tests__/<feature>.spec.ts`. Cover idempotent retries, session failures, and API contracts. Competition calculations belong to the backend. See `BADMINTON_LOCAL.md` for local setup and pending acceptance checks; report performed checks separately.

## Commit & Pull Request Guidelines

History uses Conventional Commits with Chinese summaries, including `feat(schedule): ...` and `chore(env): ...`. Follow configured commitlint types. PRs should explain behavior changes, link relevant issues, include UI screenshots where applicable, and state validation performed.

## Agent-Specific Instructions

Perform one static review yourself, limited to changed files; do not delegate review, search the repository during review, or reread design documents. Run no validation commands unless explicitly requested. Never commit, push, manage worktrees, or change branches; leave changes in the working directory. Use relevant design skills before frontend/UI implementation.
