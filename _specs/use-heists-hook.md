# Spec for use-heists-hook

branch: opencode/feature/use-heists-hook
figma_component (if used): n/a

# Summary

Create a `useHeists` hook that provides real-time access to the `heists` Firestore collection and returns an array of heist objects. The hook accepts a single mode argument that selects which set of heists to subscribe to, and it issues the appropriate query for each mode:

- `"active"` — all heists assigned TO the current user whose deadline has not passed.
- `"assigned"` — all heists assigned BY the current user (creator) whose deadline has not passed.
- `"expired"` — all heists whose deadline has passed AND whose `finalStatus` is not null (resolved), regardless of user.

The hook returns live data that updates automatically as documents change. As a first consumer, `/heists` uses the hook in all three modes to display only the titles of each result set under its three existing section headings ("Your Active Heists", "Heists You've Assigned", "All Expired Heists").

# Functional requirements

- The hook is named `useHeists`, callable from client components.
- Signature: takes exactly one argument — the mode string (`"active" | "assigned" | "expired"`).
- Returns an array of `Heist` objects (the converted document type from `types/firestore/heist.ts`, including `id` and Date-typed `createdAt`/`deadline`) plus any loading/error state needed by consumers.
- Data is real-time: when heist documents are added, changed, or removed in Firestore while the page is open, the returned results update without a manual refresh or reload.
- Queries per mode:
  - `active`: documents where `assignedTo` equals the current user's uid AND `deadline` is still in the future.
  - `assigned`: documents where `createdBy` equals the current user's uid AND `deadline` is still in the future.
  - `expired`: documents where `deadline` has passed AND `finalStatus` is not null (i.e., resolved as success or failure) with no restriction on creator or assignee.
- The hook obtains the current user from the app's auth state (`useUser()`); it must behave gracefully when no user is signed in yet (empty results / loading rather than crashing).
- Listener lifecycle: subscriptions are cleaned up on unmount and re-subscribed if the mode or current user changes.
- `/heists` renders three sections using their existing headings, listing only the `title` of each heist from the corresponding result set; empty sets show a sensible empty message instead of nothing.

# Figma Design Reference (only if referenced)

Not referenced.

# Possible Edge Cases

- No signed-in user (auth still resolving or signed out) — hook must not issue a query keyed to a null uid and must settle into an empty/loading state.
- Mode argument changes at runtime — old listener detached, new one attached, no stale results leaking between modes.
- Clock skew between client and server for deadline comparisons — decide whether "passed"/"not passed" is judged by server time in the query or filtered client-side, and stay consistent across modes.
- `finalStatus` semantics — only resolved heists appear in expired; unresolved but past-deadline heists appear in NO list (they vanish from active/assigned at deadline and are not yet in expired). Confirm this gap is acceptable.
- Empty results per mode — sections show friendly empty states, not blank space.
- Firestore listener errors (offline, permission denied) — surface an error state per consumer rather than failing silently.
- Rapid add/remove churn on the collection — UI stays consistent without flicker or duplicated keys.
- A heist assigned BY me and also TO me — appears in both active and assigned lists simultaneously (both filters can match).

# Acceptance Criteria

- Calling `useHeists("active")` yields live-updating heists assigned to the current user with future deadlines only.
- Calling `useHeists("assigned")` yields live-updating heists created by the current user with future deadlines only.
- Calling `useHeists("expired")` yields live-updating heists with past deadlines and non-null finalStatus, including those involving other users.
- Returned objects match the `Heist` interface (ids present, dates converted).
- Updates made in Firestore (new heist, status change) reflect in the UI without refresh.
- `/heists` shows titles grouped correctly under its three headings, with empty-state messages where applicable.
- No listener leaks: navigating away from `/heists` unsubscribes cleanly.
- Invalid/unknown mode values are handled predictably (type-level prevention preferred; documented behaviour otherwise).

# Open Questions

- Where should the hook live given current conventions — a new `hooks/` folder, inside `components/` like `UserProvider`, or under `lib/`?
- For "deadline has/hasn't passed", should comparison happen in the Firestore query (server timestamp vs a constant) or client-side after fetching? Server-side avoids clock skew but needs a concrete cutoff value to query against.
- Should expired results be sorted (e.g., most recently expired first)? Same question for active/assigned (e.g., nearest deadline first)?
- Is the "unresolved past-deadline" gap (in no list until finalStatus is set) intended product behaviour, or should there eventually be a fourth state?
- Does the `/heists` page need pagination or result caps, or is unbounded fine at current scale? no
- Should the hook expose a single subscription per mount even if two components request the same mode?

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Each mode issues a query constrained by the right fields (uid scoping for active/assigned; deadline + finalStatus conditions for expired).
- Returns heist objects mapped through the converter (id and Date fields present).
- Real-time updates: emitting a new snapshot adds/updates/removes items in the returned array.
- Re-subscribes when mode changes and unsubscribes on unmount.
- Handles no-user state without issuing a broken query.
- `/heists` renders titles under the correct three headings and shows empty states for empty result sets.
