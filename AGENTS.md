# Pocket Heist

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Early-stage project.

## Commands

PowerShell execution policy blocks `npm`/`npx` — always run via cmd: `cmd /c "npm run dev"`, `cmd /c "npx vitest run ..."`. From Git Bash sessions, plain `npx vitest run tests/components/X.test.tsx` works directly; `cmd /c` mangles forward-slash paths there (use backslashes inside `cmd /c`).

- `cmd /c "npm run dev"` — dev server at localhost:3000
- `cmd /c "npm run build"` — production build (runs tsc typecheck)
- `cmd /c "npm run lint"` — ESLint only; does NOT type-check (can take 2+ min)
- `cmd /c "npx vitest run"` — tests, single run
- Single test file: `cmd /c "npx vitest run tests/components/ComponentName.test.tsx"`

Coverage is NOT available: `@vitest/coverage-v8` is not installed, so `--coverage` fails.

## Commit workflow

Husky runs on commit:

- **pre-commit**: `npm test` — tests must pass.
- **commit-msg**: commitlint enforces Conventional Commits, but the config allows an optional emoji prefix (e.g. `✨ feat: ...` or `feat: ...` both pass). Use the emoji format from `/commit-message`. Gotcha: multi-codepoint emojis fail parsing (`🖌️` with the U+FE0F variation selector → "subject may not be empty"); use the bare codepoint (`🖌 style: ...`).

Repo-local slash commands (`.opencode/commands/`):

- `/component <desc>` — TDD component workflow: write test first in `tests/components/`, run expecting failure, build component, run expecting pass, then add a preview on `/preview`.
- `/spec <idea>` — requires a CLEAN working tree (commit/stash first, it aborts otherwise). Creates a `opencode/feature/<slug>` branch and writes a spec to `_specs/<slug>.md` from `_specs/template.md`.
- `/commit-message` — proposes a commit message from staged changes; asks before committing.
- `/test` — runs the suite; note coverage will fail (see above).

## Structure

- `app/(public)/` — no auth, no Navbar: splash `/`, `/login`, `/signup`, `/preview`. `/preview` is the UI gallery for new components.
- `app/(dashboard)/` — authenticated pages wrapped with `<Navbar />`: `/heists` (three sections driven by `useHeists`), `/heists/create`, `/heists/[id]` (mission dossier page — client component, realtime single-doc listener).
- `components/<Name>/` — one folder per component: `<Name>.tsx`, `<Name>.module.css`, `index.ts` barrel. Current: `Navbar`, `Footer`, `Skeleton`, `Avatar`, `AuthForm`, `RouteGuard`, `HeistCard`, `HeistCardSkeleton`, `CreateHeistForm`, `HeistDetailCard`, `UserProvider` (no `.module.css`; exports default provider + named `useUser` hook).
- `hooks/` — data layer, one file per hook: `useHeists(mode)` (realtime lists scoped to the signed-in user) and `useHeist(id)` (single doc + `notFound` flag). Both subscribe via `onSnapshot` + converter, gate on `useUser()`, tick a shared 60s clock, and return `{ data, isLoading, error }` with friendly error strings.
- `types/firestore/` — collection schemas (`heist.ts`, `user.ts`), converters (`heistConverter`), and `COLLECTIONS` constants. All Firestore reads/writes go through these; don't hand-roll document shapes.
- `lib/` — `firebase.ts` (SDK init), `codename.ts`, `dateUtils.ts` (deadline phrasing; formatters accept an optional `now`).
- `tests/components/` mirrors components; `tests/hooks/` mirrors hooks; `tests/pages/` smoke-tests route components. Firestore mocking pattern lives in `tests/hooks/useHeists.test.tsx`.
- `app/layout.tsx` mounts `<UserProvider>` at the root — read auth state via `useUser()` (`{ user, isLoading }`); don't call Firebase auth directly in pages.
- `_specs/` — feature specs (see `/spec`). `_plans/` — implementation plans.

## Conventions

- Path alias: `@/*` maps to project root.
- Tailwind v4: theme via `@theme` in `app/globals.css` (no `tailwind.config`). Colors: `primary`, `secondary`, `dark`, `light`, `lighter`, `success`, `error`, `heading`, `body`.
- Global utility classes in `globals.css`: `.page-content`, `.center-content`, `.form-title`, `.public`, `.btn`.
- Sticky footer: `<body>` is `flex flex-col min-h-screen`, each layout's `<main>` gets `flex-1`, and `<Footer />` must stay a **sibling** of `<main>` (never nested inside) so `mt-auto` can pin it via the body flex chain.
- Single time reference: expiry/status derivations must agree with deadline text. Hooks tick a 60s clock and expose `now`; `dateUtils` formatters take an optional `now` param — thread it through instead of letting each formatter call `new Date()`.
- Firestore: read/write only through `types/firestore` converters and `COLLECTIONS`; subscribe with `onSnapshot` for live views, and keep status/expiry derivations render-only unless a spec says otherwise.
- **CSS Modules + Tailwind v4 gotcha**: any utility class (incl. theme colors like `bg-light`) in a `.module.css` requires `@reference "../../app/globals.css";` at the top, or the build fails with `Cannot apply unknown utility class`. Copy the pattern from `Navbar.module.css`.
- Style: no semicolons in `.tsx`/`.ts` (CSS files use them). `"use client"` for stateful components.
- Client components read route params via `useParams()` from `next/navigation`; server components `await` the `params` Promise prop.
- Tests: Vitest + Testing Library, jsdom, globals enabled. Existing tests import `describe/it/expect` explicitly — match the file you're editing. For `getByLabelText`, password inputs: the visibility-toggle button's `aria-label` also contains "password", so use an exact string (`getByLabelText("Password")`) not a regex.
- Mocking `firebase/auth` in tests: `onAuthStateChanged(auth, cb)` receives the callback at args index `[1]`, and the mock must RETURN the unsubscribe fn (`mockReturnValue(unsubscribe)`) — calling it inside the implementation silently corrupts setup/cleanup counts.

## Checking Documentation

- **important** When implementing any lib/framework-specific feature, ALWAYS check the appropriate lib/framework documentation using Context7 MCP server before writing any code.
