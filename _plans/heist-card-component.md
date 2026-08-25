# Plan: Heist Card Component

Spec: `_specs/heist-card-component.md`
Branch: `opencode/feature/heist-card-component`

## Locked design decisions

| Decision | Choice |
|---|---|
| Sections using cards | Both "active" (mode: "active") and "assigned" (mode: "assigned") sections will use card grids. Expired section remains as-is. |
| Deadline display | Both relative time ("2 days left") and absolute date ("Jan 1, 2026") |
| Status display | Text + color: "In Progress" (yellow/amber), "Completed" (green), "Failed" (red) |
| Card interactions | Hover effects: subtle scale + shadow transition |
| Empty state | Show message: "No active heists yet" / "No heists assigned yet" |
| Grid layout | 3 columns on desktop (≥768px), 1 column on mobile |
| Skeleton | Matches exact card dimensions with shimmer animation |
| Component location | `components/HeistCard/` and `components/HeistCardSkeleton/` |

## Key facts grounding this plan

- Current `/heists` page (`app/(dashboard)/heists/page.tsx`) is `"use client"` with three sections using `useHeists(mode)`.
- `HeistTitles` component currently renders plain `<ul>` with heist titles — will be replaced with card grid for active/assigned sections.
- `useHeists` hook returns `{ heists: Heist[], isLoading: boolean, error: string | null }` with real-time updates.
- Heist type includes: `title`, `deadline` (Date), `assignedToCodename`, `finalStatus` ("success" | "failure" | null).
- Existing `Skeleton` component provides shimmer animation pattern and CSS Module structure with `@reference`.
- Theme colors available: `primary` (purple), `secondary` (pink), `success` (green), `error` (red), `light`, `lighter`, `heading`, `body`.
- `next/link` is used for navigation throughout the app.
- CSS Modules require `@reference "../../app/globals.css";` for Tailwind utility classes.
- Testing patterns: Vitest + Testing Library, explicit imports, mock Firebase modules, test component rendering and interactions.

## Implementation steps

### Step 1 — Tests first (RED)

New `tests/components/HeistCard.test.tsx`:

1. Renders card with title, deadline, assignee, and status
2. Title is a link to `/heists/:id`
3. Displays relative deadline ("2 days left") and absolute date ("Jan 1, 2026")
4. Shows correct status text and color for each state (in progress, success, failure)
5. Applies hover effects (check for transition classes)
6. Handles long titles with truncation
7. Works with different heist data shapes

New `tests/components/HeistCardSkeleton.test.tsx`:

1. Renders skeleton with correct structure
2. Applies shimmer animation
3. Matches card dimensions (same width/height)

New `tests/components/HeistCardGrid.test.tsx` (if grid component created):

1. Renders 3-column grid on desktop
2. Renders 1-column grid on mobile
3. Shows loading skeletons when isLoading is true
4. Shows empty state message when no heists
5. Renders correct number of cards

Run: `npx vitest run tests/components/HeistCard.test.tsx tests/components/HeistCardSkeleton.test.tsx` — expect failure.

### Step 2 — Implement HeistCard (GREEN)

New `components/HeistCard/HeistCard.tsx` (`"use client"`):

1. Props: `heist: Heist` (from `types/firestore`)
2. Display:
   - Title as `<Link href={/heists/${heist.id}}>` with truncation for long titles
   - Deadline: format as relative ("2 days left") + absolute ("Jan 1, 2026")
   - Assignee: `heist.assignedToCodename`
   - Status: text + color (in progress: amber, success: green, failure: red)
3. Styling: CSS Module with `@reference`, rounded corners, bg-light, hover effects (scale-105, shadow-lg)
4. Accessibility: proper heading hierarchy, focus states, screen reader text

New `components/HeistCard/HeistCard.module.css`:

1. Base card styles: `flex flex-col gap-2 rounded-lg bg-light p-4 transition-all duration-200`
2. Hover state: `hover:scale-105 hover:shadow-lg`
3. Title: `text-heading font-semibold truncate`
4. Deadline: `text-body text-sm`
5. Status colors: `text-success`, `text-error`, `text-amber-500` (or similar)
6. Link styles: no underline, focus ring

New `components/HeistCard/index.ts`:

```typescript
export { default } from "./HeistCard"
```

### Step 3 — Implement HeistCardSkeleton

New `components/HeistCardSkeleton/HeistCardSkeleton.tsx`:

1. No props — purely presentational
2. Structure matches HeistCard layout:
   - Title line (medium length)
   - Deadline line (short)
   - Assignee line (medium)
   - Status line (short)
3. Uses shimmer animation from existing Skeleton pattern

New `components/HeistCardSkeleton/HeistCardSkeleton.module.css`:

1. Copy animation keyframes from `Skeleton.module.css`
2. Line styles with shimmer animation
3. Same dimensions as HeistCard

New `components/HeistCardSkeleton/index.ts`:

```typescript
export { default } from "./HeistCardSkeleton"
```

### Step 4 — Update Heists Page

Modify `app/(dashboard)/heists/page.tsx`:

1. Import `HeistCard` and `HeistCardSkeleton`
2. Replace `HeistTitles` with card grid for "active" and "assigned" sections:
   - Grid container: `grid grid-cols-1 md:grid-cols-3 gap-4`
   - Loading state: render 3 `HeistCardSkeleton` components in grid
   - Empty state: show message ("No active heists yet" / "No heists assigned yet")
   - Data state: map heists to `HeistCard` components
3. Keep "expired" section as plain list (per spec: "not expired heists")
4. Update section headings if needed

### Step 5 — Utility functions (if needed)

Create `lib/dateUtils.ts` for deadline formatting:

1. `formatRelativeDeadline(deadline: Date): string` — returns "2 days left", "1 hour left", "Expired"
2. `formatAbsoluteDeadline(deadline: Date): string` — returns "Jan 1, 2026"
3. Use existing date patterns from codebase (check if any exist)

### Step 6 — Full verification

1. `npx vitest run` — full suite green
2. `npm run build` — typecheck passes, no new warnings
3. Manual smoke test:
   - Navigate to /heists, see card grid for active/assigned sections
   - Hover over cards, see transition effects
   - Click card title, navigate to /heists/:id (stub page)
   - Create new heist, see it appear in assigned section
   - Wait for deadline to pass, see heist move to expired section (plain list)
   - Check mobile responsiveness (resize browser)

## Must NOT have

- No changes to `useHeists` hook or `Heist` type
- No changes to expired section display (stays as plain list)
- No new Firebase calls or Firestore queries
- No changes to security rules or `firestore.indexes.json`
- No new dependencies (use existing date formatting or simple implementation)
- No changes to `heistConverter`, `CreateHeistInput`, or UserProvider internals
- No `as any` / `@ts-ignore` suppression

## Commit strategy

One feature commit:

1. `✨ feat: add heist card component with skeleton and grid layout`

Conventional Commits with emoji prefix; husky runs the full suite pre-commit.