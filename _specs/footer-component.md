# Spec for footer-component

branch: opencode/feature/footer-component
figma_component (if used): Design reference could not be retrieved. See Figma manually for details.

# Summary

A reusable site footer component displaying the Pocket Heist branding (logo) and a copyright notice. The footer should visually match the application's dark theme and design language established by the existing components (e.g., the navbar), and be rendered across the application's page layouts.

# Functional requirements

- Display the Pocket Heist logo/brandmark in the footer, consistent with the branding used in the navbar (clock motif, wordmark)
- Display a copyright notice including the current year (e.g., "© 2026 Pocket Heist")
- Follow the application theme: dark surface colors (`light`/`lighter`), `body` text color, heading color for emphasis
- Render as a full-width strip at the bottom of the page content area
- Be a self-contained component following the standard component folder structure (component file, CSS module with `@reference`, barrel export)
- Remain readable and unobtrusive on both public (splash, login, signup, preview) and dashboard (heists) pages

# Figma Design Reference (only if referenced)

- File: (none provided)
- Component name: (none provided)
- Key visual constraints: Use frontend-design guidance and application theme colors; match navbar branding

# Possible Edge Cases

- Very short pages where the footer should still sit sensibly at the bottom of content flow
- Small/mobile viewports: logo and copyright should stack or wrap gracefully
- Year rollover: the displayed year must always reflect the current year at render time
- Pages with long scrolling content: footer appears after content without overlapping it
- Reuse across route groups must not duplicate ids or break landmark semantics (single `<footer>` per page)

# Acceptance Criteria

- Footer renders the Pocket Heist logo/wordmark and a current-year copyright line
- Styling uses the application theme tokens and matches the overall dark aesthetic
- Component follows project conventions: folder structure, CSS Modules with `@reference`, no semicolons in TSX, `"use client"` only if state is required (prefer server-safe)
- Footer displays correctly on public and dashboard layouts without layout breakage or overlap
- Responsive behavior verified on mobile and desktop widths
- Accessible: footer uses the native `<footer>` landmark; logo has appropriate accessible naming; contrast meets theme standards

# Open Questions

- Should the footer appear on all layouts (public + dashboard) or dashboard-only? Yes
- Should the year be computed at build/render time on the server or client? Yes
- Should the footer include any links (e.g., GitHub repo, privacy, contact) besides logo and copyright? Include Github repo
- Should the wordmark be text-based (like the navbar "P 🕗 cket Heist" treatment) or a separate visual asset? Like the navbar

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders the logo/brandmark element
- Renders a copyright notice containing the current year
- Uses the native footer landmark (role/contentinfo)
- Snapshot-free styling assertions kept light (class presence is enough given CSS module hashing)
