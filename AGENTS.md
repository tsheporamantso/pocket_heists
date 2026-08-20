# Pocket Heist

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Early-stage project.

## Commands

PowerShell execution policy blocks `npm`/`npx` — always run via cmd: `cmd /c "npm run dev"`, `cmd /c "npx vitest run ..."`.

- `cmd /c "npm run dev"` — dev server at localhost:3000
- `cmd /c "npm run build"` — production build (runs tsc typecheck)
- `cmd /c "npm run lint"` — ESLint only; does NOT type-check (can take 2+ min)
- `cmd /c "npx vitest run"` — tests, single run
- Single test file: `cmd /c "npx vitest run tests/components/ComponentName.test.tsx"`

Coverage is NOT available: `@vitest/coverage-v8` is not installed, so `--coverage` fails.

## Commit workflow

Husky runs on commit:

- **pre-commit**: `npm test` — tests must pass.
- **commit-msg**: commitlint enforces Conventional Commits, but the config allows an optional emoji prefix (e.g. `✨ feat: ...` or `feat: ...` both pass). Use the emoji format from `/commit-message`.

Repo-local slash commands (`.opencode/commands/`):

- `/component <desc>` — TDD component workflow: write test first in `tests/components/`, run expecting failure, build component, run expecting pass, then add a preview on `/preview`.
- `/spec <idea>` — requires a CLEAN working tree (commit/stash first, it aborts otherwise). Creates a `opencode/feature/<slug>` branch and writes a spec to `_specs/<slug>.md` from `_specs/template.md`.
- `/commit-message` — proposes a commit message from staged changes; asks before committing.
- `/test` — runs the suite; note coverage will fail (see above).

## Structure

- `app/(public)/` — no auth, no Navbar: splash `/`, `/login`, `/signup`, `/preview`. `/preview` is the UI gallery for new components.
- `app/(dashboard)/` — authenticated pages wrapped with `<Navbar />`: `/heists`, `/heists/create`, `/heists/[id]` (dynamic route — `params` is a Promise, `await` it).
- `components/<Name>/` — one folder per component: `<Name>.tsx`, `<Name>.module.css`, `index.ts` barrel. Current: `Navbar`, `Skeleton`, `Avatar`, `AuthForm`.
- `tests/components/` — mirrors components (`Navbar.test.tsx`, `Avatar.test.tsx`, `AuthForm.test.tsx`).
- `_specs/` — feature specs (see `/spec`). `_plans/` — implementation plans.

## Conventions

- Path alias: `@/*` maps to project root.
- Tailwind v4: theme via `@theme` in `app/globals.css` (no `tailwind.config`). Colors: `primary`, `secondary`, `dark`, `light`, `lighter`, `success`, `error`, `heading`, `body`.
- Global utility classes in `globals.css`: `.page-content`, `.center-content`, `.form-title`, `.public`, `.btn`.
- **CSS Modules + Tailwind v4 gotcha**: any utility class (incl. theme colors like `bg-light`) in a `.module.css` requires `@reference "../../app/globals.css";` at the top, or the build fails with `Cannot apply unknown utility class`. Copy the pattern from `Navbar.module.css`.
- Style: no semicolons in `.tsx`/`.ts` (CSS files use them). `"use client"` for stateful components.
- Client components read route params via `useParams()` from `next/navigation`; server components `await` the `params` Promise prop.
- Tests: Vitest + Testing Library, jsdom, globals enabled. Existing tests import `describe/it/expect` explicitly — match the file you're editing. For `getByLabelText`, password inputs: the visibility-toggle button's `aria-label` also contains "password", so use an exact string (`getByLabelText("Password")`) not a regex.

## Checking Documentation

- **important** When implementing any lib/framework-specific feature, ALWAYS check the appropriate lib/framework documentation using Context7 MCP server before writing any code.
