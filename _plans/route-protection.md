# Plan: Route Protection with Auth Redirects

Spec: `_specs/route-protection.md`
Branch: `claude/feature/route-protection`

## Locked design decisions

| Decision | Choice |
|---|---|
| Redirect targets | Guest-only pages → `/heists`; auth-only pages → `/login` |
| Exemptions | `/` (splash) and `/preview` viewable regardless of auth state |
| Loader | Centered spinning `Clock8` icon (the logo's clock) + sr-only "Loading…" — no CSS module, inline utilities |
| History | `router.replace()` — no back-button redirect loops |
| Trade-off accepted | Login success message mostly unreachable once guests get bounced off `/login` |

## Key facts grounding this plan

- `(dashboard)/layout.tsx` is a server component rendering `Navbar + <main>` — no metadata export, safe to convert to `"use client"` and wrap in the guard.
- `(public)/layout.tsx` wraps pages in `<main className="public">` — the new `(auth)` layout must replicate that wrapper so login/signup styling is preserved.
- `useUser()` returns `{ user, isLoading }`; UserProvider's listener already emits `null` on sign-out → the dashboard guard auto-kicks to `/login` purely from state changes (sign-out synergy comes free).
- Route groups don't affect URLs: moving `login/` + `signup/` into a new `(auth)/` group keeps `/login` and `/signup` intact.
- Existing tests mock `@/components/UserProvider` and `next/navigation` with hoisted state — same pattern applies here; AuthForm/Navbar suites are unaffected.
- Alternative considered (rejected): wrapping `RouteGuard require="guest"` directly inside both pages instead of an `(auth)` group — functionally similar but doesn't satisfy the "group layout" requirement as cleanly.

## Implementation steps

### Step 1 — Tests first (RED)

New `tests/components/RouteGuard.test.tsx`, mocking `@/components/UserProvider` (hoisted mutable `{ user, isLoading }`) and `next/navigation` (`replace` spy):

1. `isLoading` → loader (`role="status"`) rendered, children not
2. `require="authenticated"`, no user → children not rendered, `replace("/login")` called
3. `require="authenticated"`, user present → children rendered, no replace
4. `require="guest"`, user present → children not rendered, `replace("/heists")` called
5. `require="guest"`, no user → children rendered, no replace

### Step 2 — Implement (GREEN)

1. New `components/RouteGuard/RouteGuard.tsx` (`"use client"`):
   - Props `{ require: "authenticated" | "guest"; children }`.
   - Computes `allowed` from `useUser()`; while unresolved or disallowed renders the centered spinning-clock loader (`role="status"`, sr-only "Loading…").
   - `useEffect` fires `router.replace("/login" | "/heists")` once resolved-and-disallowed; renders children only when allowed.
   - Plus `index.ts` barrel; no `.module.css` needed (inline utilities).
2. `app/(dashboard)/layout.tsx` → `"use client"`, wrap existing Navbar+main content in `<RouteGuard require="authenticated">`.
3. New `app/(auth)/layout.tsx` (`"use client"`): `<RouteGuard require="guest"><main className="public">{children}</main></RouteGuard>`.
4. Move `app/(public)/login/` and `app/(public)/signup/` → `app/(auth)/login/`, `app/(auth)/signup/`; `(public)` keeps splash + preview untouched.

### Step 3 — Full verification

- `cmd /c "npx vitest run"` — full suite green.
- `cmd /c "npm run build"` — passes with an identical route table (`/`, `/login`, `/signup`, `/preview`, `/heists/*`).
- Manual smoke: logged-out deep-link to `/heists` → loader → `/login`; log in → auto-bounced to `/heists`; navbar logout from dashboard → back to `/login`.

## Must NOT have

- No direct Firebase/auth calls in guards or layouts (only `useUser`).
- No pathname-sniffing exemptions; no `push` navigation for guards.
- No changes to AuthForm, UserProvider internals, or `lib/firebase.ts`.
- No new dependencies; no suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), plus a fix commit only if step 3 surfaces regressions:

1. `✨ feat: protect routes with auth-based redirects and loader`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.
