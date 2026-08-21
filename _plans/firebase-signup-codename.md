# Plan: Firebase Signup with Generated Codename

Spec: `_specs/firebase-signup-codename.md`
Branch: `claude/feature/firebase-signup-codename`

## Locked design decisions

| Decision | Choice |
|---|---|
| Word sets | Adjectives / Colours / Animals, joined PascalCase (e.g. `SilentCrimsonFox`) |
| Post-signup redirect | `/heists` |
| Partial failure (auth OK, profile/doc write fails) | Show generic error only — no rollback/cleanup |
| Codename uniqueness | Not enforced (random generation, collisions allowed) |
| SDK | Firebase Web SDK only, via `lib/firebase.ts` exports (`auth`, `db`) |

## Key facts grounding this plan

- `components/AuthForm/AuthForm.tsx` is already `"use client"`; signup submit currently only `console.log`s (line 23). Login mode must stay unchanged.
- `lib/firebase.ts:17-18` exports `auth` and `db` — no new Firebase init needed.
- Firebase mechanics (Context7 docs): `createUserWithEmailAndPassword(auth, email, password)` → `UserCredential`; `updateProfile(user, { displayName })` → `Promise<void>`; `setDoc(doc(db, "users", uid), data)` creates the doc with our chosen id and resolves only after the backend write.
- Auth state reading stays in `UserProvider` (`useUser()`) — this feature only performs the signup mutation; no changes to UserProvider.
- Test infra: Vitest 4 jsdom + Testing Library; existing `tests/components/AuthForm.test.tsx` has 4 passing tests to keep green. AGENTS.md mocking notes apply (`onAuthStateChanged` callback at args `[1]`, mock returns unsubscribe).
- No new dependencies (`firebase@^12.18.0` installed).

## Implementation steps

### Step 1 — Tests first (RED)

1. Create `tests/lib/codename.test.ts`:
   - Output matches exactly three PascalCase words joined with no separators.
   - Each word belongs to its respective set (control randomness via `vi.spyOn(Math, "random")`).
2. Extend `tests/components/AuthForm.test.tsx`, mocking:
   - `firebase/auth`: `createUserWithEmailAndPassword`, `updateProfile`
   - `firebase/firestore`: `doc`, `setDoc`
   - `next/navigation`: `useRouter` → `{ push }` spy
   Cases:
   - Successful signup: auth called with entered email/password; `updateProfile` called with a PascalCase codename; `setDoc` called with `users/{uid}` and data of exactly `{ codename, id }` — no email field; `router.push("/heists")` called.
   - Rejected signup (e.g. `auth/email-already-in-use`): friendly error rendered, no navigation.
   - Pending state: submit button disabled while signup is in flight.

### Step 2 — Implement (GREEN)

1. Create `lib/codename.ts`:
   - Export `ADJECTIVES`, `COLOURS`, `ANIMALS` arrays (~10–15 unique words each) and `generateCodename()` picking one random word per set, joined PascalCase. Pure module, no Firebase imports.
2. Modify `components/AuthForm/AuthForm.tsx`:
   - Add `isSubmitting` / `error` state and `useRouter()`.
   - Signup flow: `createUserWithEmailAndPassword` → `generateCodename()` → `updateProfile(user, { displayName: codename })` → `setDoc(doc(db, "users", user.uid), { codename, id: user.uid })` → `router.push("/heists")`.
   - Map common error codes (`auth/email-already-in-use`, `auth/weak-password`, `auth/invalid-email`, network errors) to friendly messages; render inline near the button in an `aria-live` region.
   - Disable submit + pending label while submitting (double-submit guard).
   - If profile/doc write fails after account creation: generic "account created but setup failed" message; do not navigate.
   - Login path untouched. Style: no semicolons; follow existing JSX/CSS-module conventions.

### Step 3 — Full verification

- `cmd /c "npx vitest run"` — all suites green (existing 4 AuthForm tests included).
- `cmd /c "npm run build"` — typecheck passes.
- Manual smoke check (optional): dev server signup against real Firebase project.

## Must NOT have

- No changes to login mode behaviour, `/login` page, Navbar, or UserProvider.
- No email/password stored in the Firestore document — fields are exactly `codename` and `id`.
- No Admin SDK, REST calls, or new npm dependencies.
- No codename uniqueness checks or Firestore reads during signup.
- No suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), plus a fix commit only if step 3 surfaces regressions:

1. `✨ feat: hook signup to firebase auth with generated codename profiles`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.

## Manual follow-ups (out of code scope)

- Verify Firestore security rules allow creating `users/{uid}` for the signed-in user.
