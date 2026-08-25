# Plan: Footer Component

Spec: `_specs/footer-component.md`
Branch: `opencode/feature/footer-component`

## Locked design decisions

| Decision | Choice |
|---|---|
| Which layouts | Both `(public)` and `(dashboard)` — footer is site-wide branding |
| Year source | Server-rendered (`new Date().getFullYear()`, no `"use client"`) — recomputed per render, rollover-safe |
| Extra links | None for v1 — scope is logo + copyright only |
| Wordmark style | Text-based, reuse navbar treatment (`P` + `Clock8` icon + `cket Heist`) |

## Key facts grounding this plan

- Navbar branding pattern: `P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} /> cket Heist` inside a `<Link>` — reuse the visual treatment (icon decorative, text carries the name).
- Both route-group layouts already wrap content in `<main>`: `(public)/layout.tsx` (`<main className="public">`) and `(dashboard)/layout.tsx` (RouteGuard + Navbar + `<main>`). Footer slots in as a sibling after `<main>` — keeps exactly one `<footer>` landmark per page.
- A footer needs no state or auth access, so it can stay server-safe; importing it into the client dashboard layout simply renders it as client markup, which is fine for static content.
- CSS Modules require `@reference "../../app/globals.css";` at the top to use Tailwind utilities/theme tokens.
- Theme tokens available: surfaces `light`/`lighter`, text `body`/`heading`, brand `primary`/`secondary`.
- Project convention: `/preview` page gains a section for every new component.
- frontend-design skill available and should be consulted during implementation for visual polish, per user request ("Use frontend design plugin").

## Implementation steps

### Step 1 — Tests first (RED)

New `tests/components/Footer.test.tsx`:

1. Renders the `contentinfo` landmark (`getByRole("contentinfo")`)
2. Contains the current year — compute expected via `new Date().getFullYear()` in the test
3. Shows the wordmark: "Pocket Heist" text present alongside the decorative clock icon
4. Copyright line format sanity (e.g., matches /© \d{4}/)

Run: `npx vitest run tests/components/Footer.test.tsx` — expect failure.

### Step 2 — Implement (GREEN)

New component folder `components/Footer/`:

1. `Footer.tsx` — server-safe (no `"use client"`): native `<footer>` landmark, wordmark block (text + `Clock8` lucide icon, `aria-hidden`), copyright line with computed year
2. `Footer.module.css` — `@reference "../../app/globals.css";`; top border in theme surface tone, centered flex layout, responsive stacking on small widths
3. `index.ts` — barrel export `export { default } from "./Footer"`

Consult the frontend-design skill during this step for spacing/typography polish.

### Step 3 — Wire layouts

1. `app/(public)/layout.tsx`: render `<Footer />` as sibling after `<main>`
2. `app/(dashboard)/layout.tsx`: render `<Footer />` after `<main>` (inside RouteGuard)

### Step 4 — Preview

Add a "Footer" section to `app/(public)/preview/page.tsx` rendering the component.

### Step 5 — Full verification

- `npx vitest run` — full suite green
- `npm run build` — typecheck passes
- Manual smoke: footer visible on splash, login/signup, preview, and heists pages; single footer landmark per page; stacks gracefully at mobile width

## Must NOT have

- No new dependencies and no image/SVG assets (text + existing lucide `Clock8`)
- No `"use client"` unless something forces it
- No changes to Navbar, RouteGuard, UserProvider, or globals.css theme tokens
- No extra links beyond logo + copyright in v1

## Commit strategy

One feature commit:

1. `✨ feat: add site footer with logo and copyright`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.