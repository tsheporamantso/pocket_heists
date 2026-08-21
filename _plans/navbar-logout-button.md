# Plan: Navbar Logout Button

Spec: `_specs/navbar-logout-button.md`
Branch: `claude/feature/navbar-logout-button`

## Locked design decisions

| Decision | Choice |
|---|---|
| Label | Text button "Log out" |
| Placement | In the right-side nav list, left of Create Heist |
| Style | Same primary `.btn` class as Create Heist |
| Error UX | Inline message in the navbar on failure |
| Redirects | None — navbar updates purely via `useUser()` state |

## Key facts grounding this plan

- `components/Navbar/Navbar.tsx` is currently a server component (no `"use client"`); adding `useUser()` + a click handler requires converting it to a client component. Safe: no server-only data.
- `useUser()` throws outside `<UserProvider>`; existing `tests/components/Navbar.test.tsx` renders bare `<Navbar />` (2 tests) → tests must mock `@/components/UserProvider` with controllable state, or every render crashes. Real app is fine: `app/layout.tsx` mounts `<UserProvider>` at the root.
- Firebase mechanics (Context7 docs): `signOut(auth)` → `Promise<void>`; once resolved, UserProvider's `onAuthStateChanged` listener emits `null` and the navbar re-renders logged-out automatically — no manual state juggling or navigation needed.
- `auth` exported from `lib/firebase.ts:17`.
- lucide-react already in use in Navbar (`Clock8`) if an icon is ever wanted — not needed for the text label.

## Implementation steps

### Step 1 — Tests first (RED)

Extend `tests/components/Navbar.test.tsx`, mocking:

- `@/lib/firebase`: stub `auth` token
- `firebase/auth`: `signOut`
- `@/components/UserProvider`: `useUser` backed by hoisted mutable state (`{ user, isLoading }`) so each test controls auth state

Cases:

1. `user: null` → no "Log out" button rendered
2. `isLoading: true` → no button even with a user present (no flash for logged-out visitors)
3. User present → button visible with accessible name "Log out"
4. Click → `signOut` called with the shared `auth`; button disabled while promise pending; simulating user→null afterwards removes the button
5. Rejection → inline error (role="alert") shown, button re-enabled, no navigation attempted

Existing 2 tests keep passing under the mocked hook's default logged-out state.

### Step 2 — Implement (GREEN)

1. Modify `components/Navbar/Navbar.tsx`:
   - Add `"use client"`.
   - Consume `useUser()` from `@/components/UserProvider`; import `signOut` from `firebase/auth` and `auth` from `@/lib/firebase`; add `isSigningOut` / `error` state.
   - Render `<li><button className="btn">` before the Create Heist `<li>` only when `user && !isLoading`; pending label "Logging out…"; disabled while signing out.
   - Async handler guards double-clicks, awaits `signOut(auth)`, catches → `console.error` + inline friendly error (role="alert", aria-live="polite"), `finally` clears pending state.
   - No `useRouter` anywhere.
2. Modify `components/Navbar/Navbar.module.css`:
   - Add `.error` style (`text-sm text-error`), mirroring the AuthForm pattern.

### Step 3 — Full verification

- `cmd /c "npx vitest run"` — full suite green incl. existing 2 Navbar tests.
- `cmd /c "npm run build"` — typecheck passes.
- Manual smoke: create a fresh account via `/signup` (login mode still console.logs only), confirm "Log out" appears, click it, confirm it disappears with no navigation.

## Must NOT have

- No redirects or `useRouter`; no direct `onAuthStateChanged`/`getAuth` calls in Navbar.
- No changes to AuthForm, UserProvider internals, or `lib/firebase.ts`.
- No new dependencies; no suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), plus a fix commit only if step 3 surfaces regressions:

1. `✨ feat: add logout button to navbar`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.

## Manual follow-ups (out of code scope)

- Figma node 57-18 could not be retrieved (API 404) — verify final styling against the design manually if desired.
