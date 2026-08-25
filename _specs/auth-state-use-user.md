# Spec for auth-state-use-user

branch: claude/feature/auth-state-use-user

# Summary

Introduce a single source of truth for the app's authentication state: a `useUser` hook that any page or component can call to get the current user — `null` when signed out, the user object when signed in. The state is kept current by one realtime global listener on auth changes, so every consumer re-renders automatically when signed-in status changes anywhere in the app (including other tabs or windows). This spec covers only the shared listener + hook and migrating any existing call sites; no signup/login/logout flows are in scope.

# Functional requirements

- Expose a `useUser` hook callable from any page or component.
- The hook returns the current user object when a user is signed in, and `null` when signed out.
- Auth status is maintained by a single realtime global listener on auth-state changes — not one subscription per consumer.
- All mounted consumers of the hook update reactively when auth state changes, regardless of where the change originates (same tab, another tab/window, session expiry).
- Consumers must be able to distinguish "auth state not yet resolved" from "definitively signed out" so the UI does not flash the wrong state during initial load.
- Audit existing components/pages for any place that currently reads or displays user info and migrate those call sites to consume the hook instead of ad-hoc logic.
- Out of scope: signup, login, logout UI/flows, password reset, profile editing.

# Possible Edge Cases

- Initial page load before auth state resolves — consumers see "unresolved", not a false "signed out".
- User signs out in another tab/window — all consumers in this tab update without refresh.
- Session expires or token is revoked mid-session — state transitions to signed out.
- Rapid successive auth changes — final state wins, no stale intermediate renders persist.
- Hook used in a server-rendered/prerendered page — must degrade gracefully (client-only behavior) without breaking SSR.

# Acceptance Criteria

- Any page/component can call `useUser` and receive the correct current auth state.
- A sign-in/sign-out event updates every mounted consumer in realtime with no manual refresh.
- Exactly one global auth listener exists regardless of how many components consume the hook.
- All pre-existing call sites that accessed user info now go through the hook; none remain duplicated.
- No login/signup/logout flow is added or changed.
- Full test suite passes.

# Open Questions

- How should "unresolved" be represented — a separate loading flag, `undefined`, or a tri-state return? (Affects consumer ergonomics.) a separate loading flag
- Should the global listener live as a module-level singleton or inside a context provider mounted at the app root? context provider
- Are there any current call sites at all? If nothing reads user info yet, does the migration step reduce to wiring the obvious candidates (e.g., Navbar)? no current call sites
- Is the platform's default session persistence acceptable, or do we need explicit persistence configuration? default session persistence

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Returns `null` when signed out.
- Returns the user object when signed in.
- Realtime update propagates to multiple simultaneous consumers.
- Unresolved initial state is distinguishable from signed-out (per chosen design).
- Existing component tests continue to pass after migrating call sites.
