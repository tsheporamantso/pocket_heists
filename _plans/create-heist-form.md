# Plan: Create Heist Form

Spec: `_specs/create-heist-form.md`
Branch: `opencode/feature/create-heist-form`

## Locked design decisions

| Decision | Choice |
|---|---|
| Creator codename | From `user.displayName` via `useUser()` — signup already sets it; no extra Firestore read |
| Assignee | Required — `CreateHeistInput.assignedTo` fields are non-optional; block submit until selected |
| Self-assign | Excluded — current user's uid filtered out of the fetched users list |
| Users type | New `types/firestore/user.ts` exporting `UserProfile` (`{ id, codename }`) — avoids clash with firebase/auth's `User` |
| `createdAt` | Firestore `serverTimestamp()` |
| `deadline` | Computed client-side at submit: `new Date(Date.now() + 48h)` |
| Redirect | `router.push("/heists")` after successful `addDoc` |
| Validation | Explicit JS validation with inline `role="alert"` errors — not native-only `required` |
| Trade-off accepted | `deadline` computed pre-submit vs server-side `createdAt` can drift by network latency |

## Key facts grounding this plan

- `CreateHeistInput` already exists in `types/firestore/heist.ts` with comments dictating `serverTimestamp()` for `createdAt` and client-computed now+48h for `deadline`.
- `users` collection docs are `{ codename, id: user.uid }`, written by AuthForm on signup (`AuthForm.tsx:90`) — no `User` type exists yet.
- `(dashboard)/layout.tsx` wraps children in `<RouteGuard require="authenticated">`, so the page can assume a signed-in user; `useUser()` still supplies uid/displayName.
- AuthForm is the house form pattern: controlled inputs, `isSubmitting` guard against double-submit, disabled button + pending label, error via `role="alert"`, success via `role="status"`.
- CSS Modules gotcha: any Tailwind utility in `.module.css` needs `@reference "../../app/globals.css";` (copy from `AuthForm.module.css`).
- Test mocking conventions (AGENTS.md): mock `@/lib/firebase` as `{ auth: {}, db: {} }`; `onAuthStateChanged(auth, cb)` callback is args `[1]` and the mock MUST return the unsubscribe fn; wrap component in real `<UserProvider>` with mocked firebase/auth rather than mocking the provider module.
- `COLLECTIONS` map in `types/firestore/index.ts` only has `HEISTS` today; add `USERS`.
- Alternative considered (rejected): reading `users/{uid}` for creator codename — more robust but adds a read for data Auth already holds.

## Implementation steps

### Step 1 — Tests first (RED)

New `tests/components/CreateHeistForm.test.tsx`. Mocks: `@/lib/firebase`, `firebase/auth` (`onAuthStateChanged` invoking cb with fake user `{ uid: "uid-1", displayName: "SilentCrimsonFox" }`, returning unsubscribe), `firebase/firestore` (`collection`, `getDocs`, `addDoc`, `serverTimestamp`), `next/navigation` (hoisted `push`). Render wrapped in `<UserProvider>`.

1. Renders Title input, Description textarea, assignee select, submit button
2. Loads users into the select as codename options and excludes the current user ("SilentCrimsonFox")
3. Submitting empty shows inline errors, `addDoc` not called
4. Valid submit → `addDoc` payload matches `CreateHeistInput`: title/description values, `createdBy: "uid-1"`, `createdByCodename: "SilentCrimsonFox"`, selected assignee id+codename, `finalStatus: null`, `serverTimestamp` used for `createdAt`, `deadline ≈ now + 48h` — then `push("/heists")`
5. `addDoc` rejects → `role="alert"` shown, no redirect
6. Button disabled while write in flight

Run: `cmd /c "npx vitest run tests/components/CreateHeistForm.test.tsx"` — expect failure.

### Step 2 — Implement (GREEN)

1. `types/firestore/user.ts`: `UserProfile` interface + optional `userConverter`; barrel-export in `index.ts` + add `USERS: "users"` to `COLLECTIONS`.
2. `components/CreateHeistForm/CreateHeistForm.module.css`: mirror `AuthForm.module.css` (`@reference` line included), plus select styling.
3. `components/CreateHeistForm/CreateHeistForm.tsx` (`"use client"`):
   - State: title, description, assigneeId, users list, isLoadingUsers, isSubmitting, errors.
   - Mount effect: `getDocs(collection(db, COLLECTIONS.USERS))` → filter out `user.uid` → options `{ id, codename }`; loading state while fetching; friendly empty state if no other users.
   - Missing `displayName` → disable submit + helper text (rare; signup always sets it).
   - Validate → build `CreateHeistInput` → `addDoc(collection(db, COLLECTIONS.HEISTS), payload)` → `router.push("/heists")`.
4. `components/CreateHeistForm/index.ts` barrel.
5. Edit `app/(dashboard)/heists/create/page.tsx`: keep `.center-content` / `.page-content` / `.form-title` wrapper, render `<CreateHeistForm />`.

Run: full suite expecting pass.

### Step 3 — Preview

Add a CreateHeistForm section to `/preview` (repo convention for new components).

### Step 4 — Full verification

- `cmd /c "npx vitest run"` — full suite green.
- `cmd /c "npm run build"` — typecheck passes.
- Manual smoke: `/heists/create` loads users select without self, invalid submit blocked, valid submit creates doc then lands on `/heists`.

## Must NOT have

- No direct Firebase calls outside the form component (no reads/writes in the page file).
- No changes to `CreateHeistInput`, `heistConverter`, AuthForm, UserProvider internals, or `lib/firebase.ts`.
- No self-assign option; no optional assignee path.
- No new dependencies; no suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit (steps 1–2), one preview commit if separated:

1. `✨ feat: create heist form writing to firestore heists collection`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.
