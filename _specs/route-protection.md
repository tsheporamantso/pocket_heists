# Spec for Route Protection with Auth Redirects

branch: claude/feature/route-protection
figma_component (if used): n/a

# Summary

Protect routes by auth state at the route-group level. Pages in the `(public)` group (`/`, `/login`, `/signup`, `/preview`) should only be viewable by unauthenticated users; pages in the `(dashboard)` group (`/heists`, `/heists/create`, `/heists/[id]`) should only be viewable by authenticated users. Guards use the existing `useUser()` hook to conditionally redirect, and a very simple loader is shown in each group layout while the auth status is still being resolved from Firebase (before the redirect kicks in).

# Functional requirements

- `(dashboard)` group: when `useUser()` reports no user (once loading has resolved), redirect unauthenticated visitors to the login page and do not render the dashboard content.
- `(public)` group: when `useUser()` reports an authenticated user, redirect them away from public pages (to the dashboard home) and do not render the public content.
- While `isLoading` is true (Firebase auth status not yet known), each group layout shows a simple loader in place of its content — never flash protected or stale content.
- All guard logic reads auth state via `useUser()` from `UserProvider`; no direct Firebase Auth calls in layouts.
- Redirects must feel clean: replacing the current history entry rather than stacking redirects (back button behaves sensibly).
- Existing behaviour inside the groups is preserved: dashboard layout keeps rendering the Navbar for authenticated users; public pages keep their current content.
- Sign-out synergy: when a user signs out while on any dashboard page, they are automatically redirected to the login page.

# Possible Edge Cases

- Hard load / refresh deep-linking into `/heists/[id]` while logged out → brief loader, then redirect to login without leaking page data.
- Logged-in user manually visiting `/login`, `/signup`, or `/` → redirected to the dashboard; note this means the login success message may rarely be seen once protection lands (accepted trade-off — see Open Questions).
- Slow Firebase resolution on poor networks → loader must remain stable (no flicker/layout jump) until resolved.
- Rapid auth state flips (sign out then immediately navigate).
- React StrictMode double-rendering in development must not cause double redirects or broken states.
- Session expired server-side mid-browsing → next navigation re-syncs and redirects appropriately.

# Acceptance Criteria

- Given no logged-in user, visiting any `(dashboard)` URL shows the loader briefly and then lands on `/login`; dashboard content is never rendered.
- Given a logged-in user, visiting any `(public)` URL shows the loader briefly and then lands on the dashboard home; public content is never rendered.
- While auth status is unresolved, only the loader is visible — no protected or public content flashes first.
- Signing out from the navbar while on a dashboard page ends up on the login page.
- Browser back button after a redirect does not trap the user in a loop or expose protected content.

# Open Questions

- Confirm redirect targets: `(public)` → `/heists` and `(dashboard)` → `/login`? yes
- Should `/preview` be exempt from protection (it's an internal UI gallery — maybe fine either way)? yes it must be exempt
- Should the splash page `/` stay viewable by logged-in users instead of redirecting? yes
- Loader appearance: reuse the existing `Skeleton` component vs a minimal centred spinner/text? spinner, using the clock icon from the title
- Accept that the login success message ("Welcome back, …") becomes mostly unreachable once public pages bounce logged-in users? I accept

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Dashboard guard: with mocked `useUser` loading → loader rendered, children not; logged-out → redirect triggered, children not; logged-in → children render, no redirect.
- Public guard: mirror cases (logged-in → redirect away; logged-out → children render; loading → loader).
- Redirects use router replace semantics (mocked `next/navigation`) so history isn't polluted.
- No direct Firebase calls in the guards — mock `@/components/UserProvider` per repo conventions (see AGENTS.md mocking notes for `onAuthStateChanged` if integration-level tests are added).
