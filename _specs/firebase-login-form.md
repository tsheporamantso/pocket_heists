# Spec for Firebase Login with Success Message

branch: claude/feature/firebase-login-form
figma_component (if used): n/a

# Summary

Wire the login form (`/login`, rendered by `AuthForm` with `mode="login"`) to Firebase Authentication using the shared exports from `lib/firebase.ts`. Submitting correct credentials signs the user in and shows a success message on the page. No redirect after login — the user stays on `/login`. Only the Firebase Web SDK is used.

# Functional requirements

- Submitting the login form signs the user in with the entered email and password via Firebase Auth, using the `auth` instance exported from `lib/firebase.ts`.
- On success, show a visible success message on the login page (accessible, announced politely to screen readers); the user stays on `/login` — no navigation or redirect.
- Auth state updates flow automatically through the existing `UserProvider`/`useUser()`; no direct auth-state listeners in the component.
- While the request is in flight: pending button label ("Logging in…"), disabled submit, double-submit guard — mirroring the existing signup behaviour.
- Map common auth errors to friendly inline messages (wrong email/password, unknown user, too many attempts, network trouble) with a generic fallback; log the real error to the console for debuggability, consistent with signup.
- The signup mode of `AuthForm` remains unchanged.

# Possible Edge Cases

- Wrong password or unregistered email → friendly inline error; no success message; user stays on `/login`.
- Too many failed attempts → rate-limit message.
- Network offline → network error message.
- Rapid double click on Login before the request resolves.
- A user who is already logged in visits `/login` (behaviour undecided — see Open Questions).
- Empty fields are blocked by native required validation.

# Acceptance Criteria

- Given a registered email and correct password, submitting the form signs the user in (auth state reflects it app-wide) and a success message appears while the URL remains `/login`.
- Given incorrect credentials, a friendly inline error is shown, no success message appears, and no navigation occurs.
- The submit button is disabled/pending while the request is in flight.
- After a successful login, other parts of the app (e.g. Navbar) reflect the logged-in state through `useUser()`.

# Open Questions

- Exact success copy? E.g. "Welcome back!" vs including the user's codename/displayName. Welcome back text and user codename e.g Welcome Back JD
- Should a logged-in user visiting `/login` see an "already signed in" note or have the form hidden? see "already signed in" note
- Is "no redirect" permanent, or should we revisit once the dashboard is gated? It's not permanent will revisit when dashboard is gated.

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Successful login calls Firebase Auth with the entered credentials, shows the success message, and does not navigate.
- Invalid credentials render a friendly inline error and no success message.
- Pending/disabled submit state while login is in flight.
- Mock `firebase/auth` (`signInWithEmailAndPassword`) and `@/lib/firebase` per AGENTS.md mocking notes; keep all existing AuthForm tests passing (signup path untouched).
