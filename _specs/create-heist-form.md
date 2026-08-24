# Spec for create-heist-form

branch: opencode/feature/create-heist-form
figma_component (if used): n/a

# Summary

Implement the Create Heist form on `/heists/create`. The form lets an authenticated user define a new heist (title, description) and assign it to another user. On submit, a new document is written to the `heists` Firestore collection using the existing `CreateHeistInput` interface, and the user is redirected back to `/heists`.

The creator's own user id/codename (`createdBy`, `createdByCodename`) come from the signed-in user, and the assignee is picked from a list of users fetched from the `users` Firestore collection. `createdAt` uses a server timestamp and `deadline` is set programmatically to 48 hours after creation, matching the comments in `types/firestore/heist.ts`.

# Functional requirements

- The page renders a form titled "Create a New Heist" within the existing dashboard layout (Navbar visible).
- Form input fields map to `CreateHeistInput`:
  - `title` — text input, required.
  - `description` — textarea, required.
  - Assignee selection — a picker populated from the `users` collection; selecting a user supplies both `assignedTo` (user id / doc id) and `assignedToCodename`.
- The users list is fetched from the `users` collection on page load. Each document contains at least `{ codename, id }` (as written by signup). The current signed-in user should not be assignable to themselves as the assignee.
- On submit:
  - Build a `CreateHeistInput` payload:
    - `createdAt` — Firestore `serverTimestamp()`.
    - `deadline` — computed programmatically client-side: now + 48 hours (per the interface comment).
    - `createdBy` / `createdByCodename` — from the currently authenticated user via `useUser()` (Firebase Auth display name holds the codename).
    - `finalStatus` — `null`.
  - Write the document with `addDoc` to the `heists` collection (optionally via `heistConverter`).
- After a successful write, redirect the user to `/heists`.
- While submitting, disable the submit control and show a pending state so double-submits don't create duplicate heists.
- Show a visible error message if the write fails or the users list can't be loaded.
- All validation errors (missing title/description/assignee) are shown inline without attempting the write.

# Figma Design Reference (only if referenced)

Not referenced.

# Possible Edge Cases

- Users collection is empty or fails to load — the form must still render; assignment field shows an empty/disabled state with a helpful message.
- Current user has no codename (e.g., auth profile missing displayName) — decide fallback behaviour before writing the document.
- Slow network: prevent duplicate submissions while the write is in flight.
- User navigates away mid-submit or submits twice quickly — no partial/duplicate documents.
- Firestore permission denied / offline — surface the error and keep the entered values so the user can retry.
- Very long title/description inputs — enforce reasonable max lengths consistent with the rest of the app.
- Exactly-one-user edge case where the only user in the collection is the creator — assignment list will be empty.

# Acceptance Criteria

- Submitting valid data creates exactly one new document in `heists` whose fields match `CreateHeistInput` (title, description, createdBy, createdByCodename, assignedTo, assignedToCodename, finalStatus null).
- The created document's `createdAt` is a server timestamp and its `deadline` equals creation time + 48 hours.
- The creator fields reflect the signed-in user, not a manually typed value.
- The assignee options come from the `users` collection and carry both id and codename into the document.
- On success the user lands on `/heists`.
- Invalid submissions show inline errors and do not hit Firestore.
- Submit failure shows an error and does not redirect.

# Open Questions

- Should the assignee be required, or can a heist be created unassigned? Assignee must be required
- How should we fetch the creator's codename reliably — Auth `displayName`, or read the creator's `users/{uid}` document? displayName
- Should there also be a way for the creator to appear in the assignee list (assign to self), given the requirement mentions assigning "to other users"? I am not sure, you can decide.
- Max lengths / character limits for title and description? No max length
- Any confirmation step before creating the heist? None

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders title and description fields plus an assignee selector.
- Fetches and displays users from the mocked `users` collection as assignee options.
- Blocks submission with inline errors when required fields are empty.
- On successful submit, writes a `heists` document built from `CreateHeistInput` (assert field values including `serverTimestamp` usage and computed deadline +48h) and redirects to `/heists`.
- Shows an error state when the Firestore write rejects, without redirecting.
