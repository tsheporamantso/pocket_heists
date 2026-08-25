# Plan: Expired Heist Card

Spec: `_specs/expired-heist-card.md`
Branch: `opencode/feature/expired-heist-card`

## Locked design decisions

| Decision | Choice |
|---|---|
| Component approach | `variant?: "active" \| "expired"` prop on `HeistCard` (default `"active"`) — no separate component |
| Title link | Links to `/heists/:id` (stub page already handles the route) |
| Outcome wording | "Completed" / "Failed" — same as active status treatment |
| Hover effects | None for expired cards — static, visually signals finished missions |
| Expiry phrasing | "Expired 2 days ago" style via new `formatRelativeExpiry()` |
| Icons | Keep User/Users/Calendar icons on expired cards for consistency |

## Key facts grounding this plan

- `/heists` page (`app/(dashboard)/heists/page.tsx`) currently special-cases `expired`: generic full-width `<Skeleton />` while loading and a plain `HeistTitles` list when loaded — both must go.
- `HeistCardGrid` already renders skeletons-in-grid and cards; extending it to expired removes all mode branching in `HeistSection`.
- `lib/dateUtils.ts` has `formatRelativeDeadline` (future-facing "X days left") and `formatAbsoluteDeadline`; past dates currently collapse to `"Expired"` with no relative phrasing.
- Hover styling lives on `.card:hover` in `HeistCard.module.css` — moving it into an opt-in class avoids specificity fights between variants.
- `useHeists("expired")` already filters `finalStatus != null && deadline <= now`, so unresolved past-deadline heists stay excluded by the hook — no changes needed there.
- CSS Modules hash class names in jsdom tests, so assertions target text content/roles/structure, not literal utility class names.

## Implementation steps

### Step 1 — Tests first (RED)

1. New `tests/lib/dateUtils.test.ts`:
   - `formatRelativeExpiry`: >24h → `"Expired N days ago"`, ≤24h → `"Expired N hours ago"` buckets
   - Sanity checks for existing `formatRelativeDeadline` and `formatAbsoluteDeadline`
2. Extend `tests/components/HeistCard.test.tsx` with an `expired variant` describe:
   - Renders expiry phrasing from `formatRelativeExpiry`
   - Title still links to `/heists/:id`
   - Shows Completed/Failed status colors per finalStatus
   - Does not include the interactive/hover card treatment
3. Update `tests/pages/heists.test.tsx`:
   - Replace "renders expired section as plain list" → expired section renders mocked cards in grid
   - Expired loading state renders `heist-card-skeleton`s (not the generic skeleton)
   - Empty message `"Nothing here yet."` still displays
4. Run `npx vitest run tests/lib/dateUtils.test.ts tests/components/HeistCard.test.tsx tests/pages/heists.test.tsx` — expect failures.

### Step 2 — Implement (GREEN)

5. `lib/dateUtils.ts`: add `formatRelativeExpiry(date: Date): string` mirroring the bucket logic of `formatRelativeDeadline`.
6. `components/HeistCard/HeistCard.tsx`: accept `variant?: "active" | "expired"` prop (default `"active"`); select `formatRelativeDeadline` vs `formatRelativeExpiry` accordingly; apply hover/interactive class only for active variant.
7. `components/HeistCard/HeistCard.module.css`: move hover styles into an opt-in class applied only when interactive; expired variant shares base `.card` structure unchanged.
8. `app/(dashboard)/heists/page.tsx`: render `HeistCardGrid` for all three modes (skeletons-in-grid while loading); pass `variant="expired"` for the expired section; delete the now-unused `HeistTitles` component.

### Step 3 — Full verification

9. `npx vitest run` — full suite green (78+ tests).
10. `npm run build` — typecheck passes, route table unchanged.
11. Manual smoke: expired section shows static cards in grid; loading shows grid skeletons; empty state intact; active/assigned behavior unchanged.

## Must NOT have

- No changes to `useHeists`, Firestore types, security rules, or indexes.
- Unresolved past-deadline heists stay excluded (hook filter untouched).
- No new dependencies.
- No changes to active/assigned section behavior or empty-state messages.

## Commit strategy

One feature commit:

1. `✨ feat: render expired heists as static cards in skeleton-matching design`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.