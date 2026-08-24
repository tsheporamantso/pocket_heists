# Plan: UseHeists Realtime Hook

Spec: `_specs/use-heists-hook.md`
Branch: `opencode/feature/use-heists-hook`

## Locked design decisions

| Decision | Choice |
|---|---|
| Deadline evaluation | Client-side against a ticking `now` (~60s interval) — deadlines roll over live |
| Firestore constraints | Single-field only: `assignedTo == uid`, `createdBy == uid`, `finalStatus != null` — no composite indexes, no `firestore.indexes.json` changes |
| Hook location | New top-level `hooks/useHeists.ts`; tests in `tests/hooks/useHeists.test.tsx` |
| Sorting | active/assigned: nearest deadline first; expired: most recently passed first |
| Return shape | `{ heists: Heist[], isLoading: boolean, error: string \| null }` |
| No-user behaviour | Empty results, not loading, no subscription issued |

## Key facts grounding this plan

- `heistConverter` (`types/firestore/heist.ts`) converts Timestamps→Dates and works with `query().withConverter()` + `onSnapshot` — satisfies the real-time requirement without touching existing types.
- Current security rules (deployed with create-heist-form) allow authenticated reads of ALL heists — required for the user-agnostic `expired` mode.
- Single-field queries need no composite index; Firestore `!= null` matches only resolved docs (success/failure), excluding missing/null.
- `/heists` is currently a static server component with three placeholder sections — must become `"use client"` to consume the hook.
- Latency-compensation quirk: a just-created heist appears in local snapshots with `createdAt`/`deadline` still null until the server confirms; the deadline filter naturally hides it briefly — acceptable, note only.
- Test conventions: mock `@/components/UserProvider`'s `useUser` with hoisted mutable state (RouteGuard pattern), mock `firebase/firestore` (`query`, `where`, `onSnapshot` returning unsubscribe), mock `@/lib/firebase`; let the real converter run over mocked doc data. AGENTS.md onAuthStateChanged gotchas don't apply here (no firebase/auth usage).
- Alternative considered (rejected): server-side deadline ranges + 3 composite indexes — efficient reads but frozen boundary at subscribe time and infra churn for a toy-scale collection.

## Implementation steps

### Step 1 — Tests first (RED)

New `tests/hooks/useHeists.test.tsx` using `renderHook` + fake timers:

1. Issues correct field constraints per mode (`where("assignedTo","==",uid)` / `createdBy` / `finalStatus "!=", null`) — no deadline clause sent to Firestore
2. Maps snapshot docs through `heistConverter` (id + Date fields present)
3. active mode drops past-deadline docs, keeps future ones
4. expired mode keeps only resolved past-deadline docs, including other users'
5. Sorting per mode (nearest deadline first; most recently passed first)
6. Live update: re-invoking captured `onSnapshot` callback swaps results
7. Ticking `now`: advancing ~60s moves an expiring heist out of active
8. Unsubscribes on unmount; re-subscribes when mode changes
9. No signed-in user → empty results, `isLoading` false, no subscription
10. Snapshot error surfaces in `error`

Run: `npx vitest run tests/hooks/useHeists.test.tsx` — expect failure.

### Step 2 — Implement (GREEN)

New `hooks/useHeists.ts` (`"use client"`):

1. Signature: `useHeists(mode: "active" | "assigned" | "expired")` returning `{ heists, isLoading, error }`.
2. Subscription effect keyed `[mode, user]`: builds single-field query on `COLLECTIONS.HEISTS`, attaches `heistConverter`, `onSnapshot` success → setDocs/setIsLoading(false)/clear error, error → console.error + error state; cleanup returns unsubscribe.
3. Separate interval effect (~60s) updating a `now` Date state.
4. Derived filter/sort memoized on `[docs, now, mode]`:
   - active: `assignedTo === uid && deadline > now`, sort deadline asc
   - assigned: `createdBy === uid && deadline > now`, sort deadline asc
   - expired: `deadline <= now && finalStatus !== null`, sort deadline desc
5. Export type `HeistsMode`.

Run: full suite expecting pass.

### Step 3 — Wire /heists

Convert `app/(dashboard)/heists/page.tsx` to `"use client"`; keep the three existing headings ("Your Active Heists", "Heists You've Assigned", "All Expired Heists"), each fed by `useHeists(<mode>)`:

- Titles only, per requirement.
- `Skeleton` component while `isLoading`; friendly empty message; inline error text on failure.

### Step 4 — Full verification

- `npx vitest run` — full suite green.
- `npm run build` — typecheck passes, route table unchanged.
- Manual smoke: created heists appear under the correct section; a heist crossing its deadline rolls over within ~60s; second account confirms cross-user expired visibility.

## Must NOT have

- No deadline/range clauses in Firestore queries; no edits to `firestore.indexes.json`.
- No direct Firebase calls in the page file (hook only).
- No changes to `heistConverter`, `CreateHeistInput`, UserProvider internals, or security rules.
- No new dependencies; no suppressed types (`as any` / `@ts-ignore`).

## Commit strategy

One feature commit:

1. `✨ feat: add useHeists realtime hook and wire heists page sections`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.
