# Spec for expired-heist-card

branch: opencode/feature/expired-heist-card
figma_component (if used): Design reference could not be retrieved. See Figma manually for details.

# Summary

An expired heist card component that displays heists from the "All Expired Heists" section as cards, replacing the current plain title list. The card should follow the same visual design language as the existing heist card skeleton/loading state so that expired items feel consistent with the rest of the heists page. Cards render in the same responsive grid layout used by the active and assigned sections.

# Functional requirements

- Replace the plain list of titles in the expired heists section with a card-based layout
- The expired card must visually match the loading skeleton design (same card structure: rounded corners, background surface, internal spacing, line/text placement)
- Display each expired heist's title prominently, consistent with the active/assigned cards
- Show the resolved outcome of the heist (success or failure) using text and color consistent with the existing status treatment (green for success, red for failure)
- Show when the heist expired, using both relative phrasing ("2 days ago") and the absolute date, mirroring the deadline treatment on active cards
- Show who the heist was assigned to and who created it, consistent with the To:/By: pattern on other cards
- Render expired cards in the same 3-column grid on desktop and single column on mobile as the active/assigned sections
- While the expired list is loading, keep showing skeletons in the same grid layout instead of the current generic full-width skeleton
- Follow the application theme and color scheme throughout
- Keep the empty-state message behavior for the expired section unchanged

# Figma Design Reference (only if referenced)

- File: (none provided)
- Component name: (none provided)
- Key visual constraints: Match the existing heist card skeleton structure and application theme colors

# Possible Edge Cases

- Long heist titles requiring truncation within the card
- A heist whose outcome has not been resolved yet but whose deadline has passed (currently these appear in no section — confirm they should stay excluded)
- Very old expired heists with distant dates (relative phrasing should remain sensible)
- Grid with a non-multiple-of-three number of expired cards leaving gaps in the last row
- Error state while loading expired heists must still surface the inline error message

# Acceptance Criteria

- Expired heists render as cards in a 3-column grid on desktop and 1 column on mobile
- Card appearance is consistent with the loading skeleton design language (structure, spacing, surfaces)
- Each card shows title, outcome (success/failure) with color, expiry date in both relative and absolute form, and assignee/creator codenames
- Loading state for the expired section uses the same skeleton-in-grid pattern as other sections
- Empty state message for the expired section still displays when there are no expired heists
- Errors during loading still appear via the existing inline error message
- Existing tests continue to pass and the expired section tests are updated to reflect cards instead of a plain list

# Open Questions

- Should the expired card title link to the detail page (/heists/:id) like active/assigned cards, even though the details page is still a stub?
- Should the outcome use the words "Completed"/"Failed" (as on active cards' status) or past-tense wording like "Succeeded"/"Failed"?
- Should expired cards include hover effects like the active/assigned cards, given they represent finished missions?
- Should the relative expiry phrase read "expired X days ago" rather than "X days left"?

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Expired section renders cards in a grid instead of a plain title list
- Each card displays the heist title, outcome text/color per finalStatus, relative + absolute expiry date, and codenames
- Loading state renders skeleton placeholders inside the expired section grid
- Empty state message still appears when no expired heists exist
- Error message still renders when the listener fails