# Plan: Firebase Login with Success Message

Spec: `_specs/firebase-login-form.md`
Branch: `claude/feature/firebase-login-form`

## Locked design decisions

| Decision | Choice |
|---|---|
| Success copy | "Welcome back, {codename}!" using `displayName` from the credential; falls back to plain "Welcome back!" if displayName is missing (e.g. pre-codename accounts) |
| Logged-in visitor on `/login` | Form behaves normally — no special handling |
| Redirects | None — user stays on `/login` |
| Error UX | Reuse the existing inline error map + `console.error` logging |

## Key facts grounding this plan

- `AuthForm.tsx` already has all the async scaffolding from the signup feature (`isSubmitting`/`error` state, `getErrorCode`, `ERROR_MESSAGES`, aria-live alert, disabled pending button). The login branch currently just `console.log`s — this replaces it.
- Context7 confirmed: `signInWithEmailAndPassword(auth, email, password)` → `Promise<UserCredential>`; modern SDK returns a single `auth/invalid-credential` for both wrong password and unknown email → copy: "Incorrect email or password."
- The pending label is currently hardcoded to "Signing up…" — must become mode-aware ("Logging in…").
- Existing test `"logs entered details to the console on submit"` will be replaced — removing the console.log is a deliberate spec-driven behavior change.
- `pushMock` (router) is only wired to signup's redirect; login success must never navigate.
- `.success` style mirrors `.error`; `--color-success` already exists in the theme.

## Implementation steps

### Step 1 — Tests first (RED)

Extend `tests/components/AuthForm.test.tsx`:

- Add `signInWithEmailAndPassword` to the `firebase/auth` mock; default resolve in `beforeEach`; extend `fakeUser` with `displayName: "SilentCrimsonFox"`
- Replace the console.log test with: successful login calls `signIn` with entered credentials, shows a `role="status"` message matching `/welcome back, silentcrimsonfox/i`, and does not navigate
- Invalid credentials (`auth/invalid-credential`) → `role="alert"` shows `/incorrect email or password/i`, no success message, no navigation
- Pending/disabled submit during an in-flight login (deferred promise)
- All other tests keep passing

### Step 2 — Implement (GREEN)

1. Modify `components/AuthForm/AuthForm.tsx`:
   - Import `signInWithEmailAndPassword`.
   - Add `success` state; clear it alongside `error` at submit start.
   - Login branch: await sign-in, then set "Welcome back, {displayName}!" (plain fallback when displayName missing); catch maps errors via existing table + `console.error`; `finally` resets pending state.
   - Pending label becomes mode-aware: `"Logging in…"` for login, `"Signing up…"` for signup.
   - Render `<p role="status" aria-live="polite" className={styles.success}>` for the success state.
2. Modify `components/AuthForm/AuthForm.module.css`:
   - Add `.success { @apply text-sm text-success; }`.

### Step 3 — Full verification

- `cmd /c "npx vitest run"` — full suite green.
- `cmd /c "npm run build"` — typecheck passes.
- Manual smoke: fresh signup → log out → log back in on `/login` → "Welcome back, \<codename\>!" shown, URL unchanged, Navbar reflects logged-in state via `useUser()`.

## Must NOT have

- No navigation on login success; no changes to signup behaviour or its test expectations.
- No UserProvider or `lib/firebase.ts` changes; no new dependencies; no suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), plus a fix commit only if step 3 surfaces regressions:

1. `✨ feat: hook login form to firebase auth with success message`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.
