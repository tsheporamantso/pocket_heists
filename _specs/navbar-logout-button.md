# Spec for Navbar Logout Button

branch: claude/feature/navbar-logout-button
figma_component (if used): n/a

# Summary

Add a logout button to the existing `Navbar` component that signs the user out of Firebase Auth when clicked. The button is only visible while a user is logged in. No redirects after sign-out — the navbar simply re-renders into its logged-out state.

# Functional requirements

- The `Navbar` shows a Logout button only when a user is authenticated, determined via the existing `useUser()` hook from `UserProvider` (no direct Firebase auth calls in the component).
- While auth state is still loading (`isLoading` true), the button must not render — avoid flashing it for logged-out visitors.
- Clicking the button signs the user out using the Firebase Auth Web SDK (`signOut`) with the `auth` instance exported from `lib/firebase.ts`.
- While the sign-out request is in flight, the button shows a pending state and cannot be double-clicked.
- When sign-out completes, the navbar updates to its logged-out state automatically through `useUser()` state; no navigation or redirect happens.
- If sign-out fails (e.g. network error), the failure is surfaced without crashing the app and the user stays logged in.
- Existing navbar content/links remain unchanged.

# Figma Design Reference (only if referenced)

- File: n/a
- Component name: n/a
- Key visual constraints: n/a

# Possible Edge Cases

- Sign-out request fails (network/API error) → user remains logged in; error surfaced.
- Rapid double click on Logout before the request resolves.
- Initial `isLoading` window on page load → button must not flash for logged-out users.
- User signs out in another tab → auth listener updates state and the button disappears.
- Clicking logout when session already expired server-side.

# Acceptance Criteria

- Given a logged-in user, the Navbar renders a Logout button; clicking it signs the user out and the button disappears without any navigation.
- Given no logged-in user (or while auth state is loading), the Navbar renders no Logout button at all.
- During an in-flight sign-out, the button is disabled/pending.
- A failed sign-out leaves the user logged in with an understandable error indication.

# Open Questions

- Exact label and styling: "Log out" vs "Logout" vs icon-only? (Figma retrieval failed — check node 57-18 manually.) Logout
- Placement within the navbar (e.g. right side, next to/near the Avatar)? placed next to "Create Heists" button
- How should sign-out errors be presented — inline text in the navbar, or console-only for now? inline text in the navbar
- Should the button also appear on public pages? No (Public route group currently has no Navbar, so effectively dashboard-only.)

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Navbar hides the Logout button when `useUser()` returns no user (and while loading).
- Navbar shows the button when a user is present.
- Clicking the button calls Firebase Auth sign-out with the shared `auth` instance.
- Pending/disabled state while sign-out is in flight; no navigation attempted.
- Mock `firebase/auth` (`signOut`), `@/lib/firebase`, and the user state per AGENTS.md mocking notes (`onAuthStateChanged` callback at args index `[1]`; mock returns unsubscribe).
