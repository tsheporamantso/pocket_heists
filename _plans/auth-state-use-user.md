# Plan: Auth State Management with useUser

Spec: `_specs/auth-state-use-user.md`
Branch: `claude/feature/auth-state-use-user`

## Locked design decisions

| Decision | Choice |
|---|---|
| Unresolved state | Separate loading flag → hook returns `{ user: User \| null, isLoading: boolean }` |
| Listener architecture | Context provider mounted at the app root; provider owns the single global `onAuthStateChanged` listener |
| Persistence | Platform defaults, no explicit config |

## Key facts grounding this plan

- Zero existing call sites read user info (grep verified across `app/`, `components/`, `lib/`, `tests/`) → no migration work exists; spec's migration clause is satisfied vacuously.
- `lib/firebase.ts:17` already exports `auth` (`getAuth(app)`).
- Firebase mechanics (Context7 docs): initial callback fires asynchronously after SDK init (the real "unresolved" window), returns an unsubscribe fn, re-fires only on UID change.
- Test infra ready: Vitest 4 jsdom, `@testing-library/react` ^16.3 (`renderHook`), explicit `describe/it/expect` imports per repo convention.

## Implementation steps

### Step 1 — Tests first (RED)

Create `tests/components/UserProvider.test.tsx` mocking both `@/lib/firebase` (stub `auth` token — required, else `getAuth(app)` runs at import) and `firebase/auth` (capture the registered callback + unsubscribe spy). Cases:

1. Initial unresolved → `useUser()` returns `{ user: null, isLoading: true }`
2. Callback fires `null` → `{ user: null, isLoading: false }`
3. Callback fires user → `{ user, isLoading: false }`
4. Listener registers only when the provider mounts (never at module import); unmount cleans up via unsubscribe
5. Multiple simultaneous consumers → all re-render on a single emission (`act()`-wrapped)
6. StrictMode double-mount → cleanup + resubscribe leaves exactly ONE active listener
7. Late subscriber (mounts after resolution) gets current state immediately
8. Rapid successive emissions → final state wins

### Step 2 — Implement (GREEN)

Create `components/UserProvider/`:

- `UserProvider.tsx` (`"use client"`): creates auth context; provider component registers ONE `onAuthStateChanged(auth, cb)` inside `useEffect` (lazy — never at import), storing `{ user, isLoading }` in state, unsubscribing on cleanup; exposes `useUser()` hook that reads the context and throws a descriptive error if used outside the provider.
- `index.ts` barrel exporting `UserProvider` (default) and `useUser`.
- No `.module.css` needed (no styles).
- Mount `<UserProvider>` in `app/layout.tsx` wrapping `{children}` (server layout importing a client provider is fine).
- Server/SSR behavior: initial context value `{ user: null, isLoading: true }` renders identically on server and first client render — hydration-safe by construction.
- No semicolons in `.ts/.tsx`; no new deps; no persistence config.

### Step 3 — Full verification

- `npx vitest run` — existing 9 tests + new suite green.
- `npx tsc --noEmit` — exit 0.
- `git status --porcelain` shows only: new `components/UserProvider/`, new `tests/components/UserProvider.test.tsx`, modified `app/layout.tsx`.

## Must NOT have

- No signup/login/logout/password-reset/profile flows.
- No edits to Navbar, pages, or route-group layouts — the ONLY existing file touched is `app/layout.tsx` (adding the provider wrapper).
- No persistence configuration changes.
- No new npm dependencies.
- No suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), plus a follow-up fix commit only if step 3 surfaces regressions:

1. `feat(auth): add useUser hook with root auth provider`

Conventional Commits, body lines ≤100 chars (commitlint constraint); husky runs the full suite pre-commit.
