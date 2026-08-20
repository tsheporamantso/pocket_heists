# Pocket Heist

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Early-stage project.

## Commands

- `npm run dev` — dev server at localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, next core-web-vitals + typescript)
- `npm test` — Vitest (single run); `npx vitest` for watch mode

No separate typecheck command; `npm run build` runs tsc. `npm run lint` does not type-check.

## Commit hooks

Husky runs on commit:
- **pre-commit**: `npm test` — tests must pass before commit.
- **commit-msg**: commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`).

## Project structure

Route groups separate public vs authenticated pages without affecting URLs:

- `app/(public)/` — no auth, no Navbar. Contains: splash (`/`), `/login`, `/signup`, `/preview`.
- `app/(dashboard)/` — authenticated pages, wrapped with `<Navbar />`. Contains: `/heists`, `/heists/create`, `/heists/[id]`.
- `components/` — shared components: `Navbar`, `Skeleton`.
- `tests/` — mirrors component structure (`tests/components/Navbar.test.tsx`).

## Conventions

- Path alias: `@/*` maps to project root (use `@/components/...`, `@/app/...`).
- Tailwind v4: theme defined via `@theme` in `app/globals.css` (no `tailwind.config`). Custom colors: `primary`, `secondary`, `dark`, `light`, `lighter`, `success`, `error`, `heading`, `body`.
- Global utility classes: `.center-content`, `.page-content`, `.form-title`, `.public`, `.btn` — defined in `globals.css`.
- Components use CSS Modules (e.g. `Navbar.module.css`).
- **CSS Modules + Tailwind v4**: Tailwind utility classes (including custom `@theme` colors like `bg-light`) won't work in CSS Modules unless you add `@reference "../../app/globals.css";` at the top of the file. Without it you'll get `Cannot apply unknown utility class` errors. See `Navbar.module.css` for the pattern.
- Tests use Vitest + `@testing-library/react` with `jsdom` environment. Vitest globals enabled (no need to import `describe`/`it`/`expect` in new tests, though existing tests do import them explicitly — follow whichever pattern the file you're editing uses).
