# Spec for heist-card-component

branch: opencode/feature/heist-card-component
figma_component (if used): Design reference could not be retrieved. See Figma manually for details.

# Summary

A card component to display active assigned heists on the /heists page, with a skeleton loader for loading state. The component will render heist cards in a 3-column grid layout, where each card's title links to the heist details page (/heists/:id). Only active assigned heists (not expired) will be shown.

# Functional requirements

- Display heist cards in a 3-column grid layout on the /heists page
- Each card shows the heist title, which functions as a link to /heists/:id
- Filter and display only active assigned heists (not expired heists)
- Show a skeleton loader in the same 3-column grid layout while data is loading
- Follow the application's existing theme and color scheme
- Cards should be visually consistent with the application's design system

# Figma Design Reference (only if referenced)

- File: (none provided)
- Component name: (none provided)
- Key visual constraints: Follow application theme and colors

# Possible Edge Cases

- No active assigned heists available (empty state)
- Loading state while fetching heist data
- Responsive behavior on different screen sizes (3-column may need adjustment for mobile)
- Heists with long titles that may need truncation
- Network errors or failed data fetching

# Acceptance Criteria

- Heist cards render in a 3-column grid layout
- Each card's title is a clickable link to /heists/:id
- Only active assigned heists are displayed (filtered from useHeists hook "assigned" mode)
- Skeleton loader appears in the same grid layout during loading
- Component uses application theme colors and styling
- Empty state is handled gracefully when no heists exist
- Links navigate correctly to heist details page (though details page content is not yet implemented)

# Open Questions

- What specific visual design should the heist card follow? (Need design reference)
- Should there be an explicit empty state message when no active assigned heists exist? No
- How should the grid respond on mobile devices (single column, two columns)? single column
- What information should be displayed on the card besides the title? (deadline, assignee, status?) Display all i.e. deadline, assignee, status and title
- Should the skeleton loader match the exact card dimensions and layout? Yes

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders heist cards in a grid layout with correct styling
- Each card title links to the correct heist details page (/heists/:id)
- Only displays active assigned heists (filters out expired heists)
- Shows skeleton loader during loading state
- Handles empty state when no heists are available
- Responsive behavior across different viewport sizes
