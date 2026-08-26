# Plan: Heist Detail Card

Spec: `_specs/heist-detail-card.md`
Branch: `opencode/feature/heist-detail-card`

## Locked design decisions

| Decision | Choice |
|---|---|
| Data fetch | New `useHeist(id)` hook with realtime `onSnapshot` — matches `useHeists` pattern; live updates while viewing |
| Expiry-based "Failed" | Derived at render only — no Firestore writes from the detail view; doc keeps `finalStatus: null` |
| Assignee rows | Assignee only ("To:") — no "By:" creator row |
| Assigned-to fields | Codename as primary value + operative id (`assignedTo` uid) as secondary mono detail — heist docs store no human display name |
| Back button ownership | Rendered by the **page**, above the dossier — stays visible during loading/not-found/error states; explicit `Link` to `/heists` (not history.back) |
| Header strip flavor | Mono uppercase "Mission dossier" label left, status pill right; heist doc id included as reference-code flavor |
| Status boundary | Expired when `deadline.getTime() <= now` — same boundary as `useHeists` expired filter |
| Status colors | `text-success` / `text-error` / `text-amber-500` — mirrors `HeistCard.module.css` status classes |

## Key facts grounding this plan

- `/heists/[id]` page (`app/(dashboard)/heists/[id]/page.tsx`) is a bare server stub rendering a static heading — full rewrite needed.
- `Heist` type (`types/firestore/heist.ts`) already carries every field the dossier needs (`title`, `description`, `assignedTo`, `assignedToCodename`, `deadline`, `finalStatus`); `heistConverter` handles timestamp → Date. No schema changes.
- `hooks/useHeists.ts` establishes the conventions to copy: `"use client"`, user-gated subscription via `useUser()`, `{ data, isLoading, error }` shape, `console.error` + friendly error string on failure, unsubscribe returned from effect.
- `tests/hooks/useHeists.test.tsx:9-36` provides the exact firestore mock recipe (hoisted mocks, converter capture via `.withConverter`, SDK-pipeline simulation) to reuse for the single-doc hook.
- `components/HeistCard/HeistCard.tsx:18` has `getStatusDisplay()` — the dossier's helper extends it with the expiry rule instead of sharing code (component-local, like the original).
- `lib/dateUtils.ts` covers both deadline phrasings already: `formatRelativeDeadline` / `formatRelativeExpiry` / `formatAbsoluteDeadline`. Selection rule: expired → `formatRelativeExpiry`, else `formatRelativeDeadline`.
- Splash briefing panel (`app/(public)/page.module.css`: `.panel`, `.panelBar`, dashed blueprint motifs) is the visual source of truth for the dossier structure; Footer's dashed border shows the motif works as a hairline divider.
- CSS Modules in tests hash class names — assertions target text/roles, never literal class names.
- CSS modules using Tailwind utilities require `@reference "../../app/globals.css"` at the top.

## Implementation steps

### Step 1 — Component test first (RED)

1. New `tests/components/HeistDetailCard.test.tsx`:
   - `makeHeist()` fixture factory + fake timers pinned to `2026-08-24T12:00Z`
   - Renders heading title, description text, codename `MidnightOwl`, operative id `uid-1`
   - Deadline upcoming: relative `"1 day left"` + absolute `"Aug 25, 2026"`
   - Deadline passed: `"Expired 1 day ago"`
   - Status matrix:
     - `finalStatus: null` + future deadline → "In Progress"
     - `finalStatus: null` + past deadline → "Failed" (and not "In Progress")
     - `finalStatus: "failure"` → "Failed"
     - `finalStatus: "success"` + expired deadline → "Completed" (never downgraded)
2. Run targeted vitest — expect failures.

### Step 2 — Hook test first (RED)

3. New `tests/hooks/useHeist.test.tsx` mirroring useHeists.test.tsx mocking:
   - Subscribes via `doc(db, "heists", id)` + converter attach
   - Maps snapshot through `heistConverter` into a `Heist` (Dates instantiated)
   - Missing snapshot → `notFound: true`, `heist: null`
   - Error callback → friendly error state, loading false
   - Unsubscribes on unmount
   - Idle without signed-in user or undefined id
4. Run targeted vitest — expect failures.

### Step 3 — Implement (GREEN)

5. `hooks/useHeist.ts`: `"use client"` hook returning `{ heist, isLoading, error, notFound }`; realtime `onSnapshot` on `doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter)`, gated on `useUser()`; no-semi style matching hooks/useHeists.ts.
6. `components/HeistDetailCard/HeistDetailCard.tsx`: pure `{ heist }` props; component-local status helper (success → Completed; failure or expiry → Failed; else In Progress); dossier layout — header strip ("Mission dossier · <id>" + status pill), h2 title, description paragraph, `dl` rows for assignee (codename primary + operative id secondary) and deadline (relative + absolute), User/Calendar lucide icons with `aria-hidden`.
7. `components/HeistDetailCard/HeistDetailCard.module.css`: opens with `@reference`; panel surface (`bg-lighter`, hairline border, rounded), mono uppercase header strip, dashed dividers, theme-only tokens, focus-visible-friendly.
8. `components/HeistDetailCard/index.ts`: default barrel matching sibling components.
9. Rewrite `app/(dashboard)/heists/[id]/page.tsx` as client component: `useParams()` for id, `useHeist(id)`, back chip (`Link href="/heists"`, `ArrowLeft`, accessible name "Back to heists", bordered styling + focus-visible ring), then state branches — Skeleton while loading, inline not-found message, `role="alert"` error, `<HeistDetailCard />` on success.

### Step 4 — Page smoke test

10. New `tests/pages/heist-details.test.tsx` (mocks: `next/navigation` useParams, `@/hooks/useHeist`):
    - Back link named "Back to heists" pointing to `/heists`, present even while loading
    - Not-found message renders when flagged
    - Errors surface via alert role
11. Run targeted vitest — all green.

### Step 5 — Full verification

12. `npx vitest run` — full suite green (100+ tests).
13. `npx tsc --noEmit` — no new errors (pre-existing unrelated test errors in CreateHeistForm/useHeists test files are known).
14. Manual smoke via dev server: deep-link a real heist id, verify dossier fields, status pill per state, back navigation.

## Must NOT have

- No writes to Firestore from the detail view (expiry stays render-derived).
- No changes to `types/firestore`, security rules, indexes, or `useHeists`.
- No new dependencies.
- No "By:" creator row; no interactive elements inside the dossier itself.

## Commit strategy

One feature commit:

1. `✨ feat: add heist detail dossier page`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit. Push `opencode/feature/heist-detail-card` after commit; PR on request.
