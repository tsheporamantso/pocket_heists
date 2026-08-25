# AuthForm Code Review — 2026-08-25

**Component:** `components/AuthForm/AuthForm.tsx`
**Reviewer:** opencode (automated review)
**Verdict: Request Changes**

---

## Summary

The `AuthForm` component is well-structured with proper form semantics, accessible labels, sensible error mapping, double-submit protection, and CSS Modules with the required `@reference`. The test suite is thorough. However, there are a few real issues ranging from a race-condition-related UX bug to missing accessibility on the password toggle button, and a security-relevant information-disclosure concern.

---

## Blocking Issues

### 1. Login success doesn't redirect — user is left staring at a "Welcome back" banner
**File:** `components/AuthForm/AuthForm.tsx`, lines 76–79

After a successful login, the component sets a `success` string but never calls `router.push(...)`. The signup path correctly redirects to `/heists` (line 96), but the login path just shows a welcome message. The user stays on `/login` indefinitely after authenticating.

**Suggested fix:**
```tsx
// AuthForm.tsx, line 76-79
if (isLogin) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  router.push("/heists")   // ← add redirect
  // optionally setSuccess first and redirect after a delay
}
```

### 2. Profile setup failure leaves the user in an orphaned auth state
**File:** `components/AuthForm/AuthForm.tsx`, lines 88–95

When `createUserWithEmailAndPassword` succeeds but `updateProfile` or `setDoc` fails, the user is signed in (Firebase Auth created the account) but the component shows `SETUP_FAILED_ERROR` and returns without redirecting. The user is authenticated but stranded on the signup page.

**Suggested fix:** Either:
1. Sign the user out on profile-setup failure (`signOut(auth)`) and show the error, or
2. Redirect to a dedicated "complete your profile" page, or
3. At minimum, add `router.push("/login")` after setting the error

### 3. `auth/email-already-in-use` leak during signup is an information disclosure
**File:** `components/AuthForm/AuthForm.tsx`, lines 24–25

The error message `"That email is already registered. Try logging in instead."` explicitly confirms that the email exists in the system. This is a classic user-enumeration vector. The login error path correctly uses a vague `"Incorrect email or password."` for `auth/invalid-credential`, but the signup path tells an attacker exactly which emails are registered.

**Suggested fix:** Consider using a more ambiguous message on signup:
```tsx
"auth/email-already-in-use":
  "An account with this email may already exist. Try logging in.",
```

---

## Quality Improvements

### 4. `console.error` on auth failures leaks error details in production
**File:** `components/AuthForm/AuthForm.tsx`, lines 92, 99

`console.error` calls log the full Firebase error object (including stack traces and internal error codes) to the browser console. In production, this is visible to anyone who opens DevTools.

**Suggested fix:**
```tsx
if (process.env.NODE_ENV !== "production") {
  console.error("Login failed:", err)
}
```

### 5. Missing `autocomplete` attributes on form fields
**File:** `components/AuthForm/AuthForm.tsx`, lines 112–120, 128–136

The email input lacks `autocomplete="email"` and the password input lacks `autocomplete` attributes. For login forms the password should be `autocomplete="current-password"`, and for signup `autocomplete="new-password"`.

**Suggested fix:**
```tsx
// Login mode
<input id="email" type="email" autoComplete="email" ... />
<input id="password" type="password" autoComplete="current-password" ... />

// Signup mode
<input id="email" type="email" autoComplete="email" ... />
<input id="password" type="password" autoComplete="new-password" ... />
```

### 6. Password toggle button has no visible focus indicator
**File:** `components/AuthForm/AuthForm.module.css`, line 28

The `.toggle` class uses `text-body` → `text-heading` on hover, but has no `:focus-visible` style. Keyboard users who tab to the toggle button won't see a focus ring.

**Suggested fix:**
```css
.toggle:focus-visible {
  @apply outline-2 outline-primary;
}
```

### 7. CSS Modules input focus style uses `outline-none` without a replacement
**File:** `components/AuthForm/AuthForm.module.css`, line 24

`@apply border-primary outline-none;` removes the browser's default focus ring. While `border-primary` provides a visual cue, it doesn't satisfy `:focus-visible` expectations for keyboard-only users.

**Suggested fix:** Add an explicit `focus-visible:ring` or `focus-visible:outline` style.

### 8. `getErrorCode` is overly defensive and could mask bugs
**File:** `components/AuthForm/AuthForm.tsx`, lines 44–49

The function silently returns `""` if the error doesn't match the expected shape. Consider tightening the type:
```tsx
function getErrorCode(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const { code } = err as { code: unknown }
    return typeof code === "string" ? code : ""
  }
  return ""
}
```

---

## Nitpicks

### 9. Signup page heading says "Signup for" instead of "Sign up for"
**File:** `app/(auth)/signup/page.tsx`, line 7

`"Signup"` is a noun; the verb form is `"Sign up"` (two words).

### 10. `generateCodename()` is not memoized or seeded
**File:** `components/AuthForm/AuthForm.tsx`, line 87

`generateCodename()` uses `Math.random()`. If `handleSubmit` were ever called twice in rapid succession, different codenames would be generated. Non-issue with the current guard in place, but worth noting if the code evolves.

### 11. Test mocks `console.log` but the component uses `console.error`
**File:** `tests/components/AuthForm.test.tsx`, line 40

`vi.spyOn(console, "log").mockImplementation(() => {})` silences `console.log`, but the component calls `console.error` (lines 92, 99). The spy doesn't suppress the error output during tests.

---

## Test Gap Analysis

| Scenario | Status | Notes |
|---|---|---|
| Login success (with displayName) | ✅ Covered | |
| Login success (no displayName) | ✅ Covered | |
| Signup success + redirect | ✅ Covered | |
| Password visibility toggle | ✅ Covered | |
| Double-submit protection (login) | ✅ Covered | |
| Double-submit protection (signup) | ✅ Covered | |
| `auth/email-already-in-use` error | ✅ Covered | |
| `auth/configuration-not-found` error | ✅ Covered | |
| `auth/invalid-credential` error (login) | ✅ Covered | |
| Network error (`auth/network-request-failed`) | ❌ Not tested | |
| `auth/too-many-requests` error | ❌ Not tested | |
| `auth/weak-password` error (signup) | ❌ Not tested | |
| Profile setup failure (`updateProfile` throws) | ❌ Not tested | Especially important given finding #2 |
| `setDoc` failure on signup | ❌ Not tested | |
| Empty form submission (browser validation) | ❌ Not tested | Low priority since `required` is set |

---

## Security Notes

- Email enumeration during signup is a conscious trade-off. If security is prioritized, use a generic message. If user convenience is prioritized, document the decision in code.
- Password field should have appropriate autocomplete attributes for browser password managers.

---

*Review saved: 2026-08-25*
*Next steps: Address blocking issues #1 (redirect), #2 (orphaned state), #3 (email enumeration) before merge.*