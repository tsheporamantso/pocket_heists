# Spec for heist-detail-card

branch: opencode/feature/heist-detail-card
figma_component (if used): (none provided)

# Summary

A heist detail card component for the heist detail page (`/heists/[id]`, currently a stub) that presents a single mission as a full "mission dossier" - the artifact a crew member studies before a job. It shows the complete brief: title, description, who the heist is assigned to (display name and codename), the deadline, and the current outcome status. A back button with an arrow icon sits above the dossier and returns the player to the heists page. The component graduates the splash page's briefing-panel visual language (mono uppercase header strip, dashed dividers, blueprint motifs) into a standalone reading surface, so the detail view feels like the same world as the rest of the app rather than a generic form.

# Functional requirements

- Display the heist title as the prominent heading of the dossier
- Display the full description below the title in readable, comfortably sized body text
- Show "Assigned to" with both the assignee's display name and their codename, using label vocabulary consistent with the existing heist cards ("To:" pattern) so players recognize the same fields across surfaces
- Show the deadline using both relative phrasing ("2 days left", "Expired 1 day ago") and the absolute date, mirroring the deadline treatment on existing cards
- Derive the displayed status from the heist's final status:
  - Final status success -> show "Completed"
  - Final status failure -> show "Failed"
  - Not completed AND the deadline has passed -> show "Failed"
  - Not completed AND the deadline is still in the future -> show "In Progress"
- Render the status as a colored pill consistent with the existing status treatment (green/success tones for Completed, red/error tones for Failed, primary tone for In Progress)
- Provide a back button above the dossier containing an arrow-left icon and an accessible name; activating it navigates to `/heists`
- Follow the application theme throughout: dark navy surfaces, panel styling with rounded corners and hairline borders, mono uppercase micro-labels, purple/pink accent hover states, Inter typography
- Structure the dossier like the splash briefing panel: a slim header strip carrying a mission-file label and the status pill on opposite ends, then title, description, and a detail rows section separated by dashed hairlines echoing the infiltration-route motif
- Respect reduced-motion preferences if any animation is introduced; keep visible keyboard focus states on the back button consistent with other bordered controls

# Figma Design Reference (only if referenced)

- File: (none provided)
- Component name: (none provided)
- Key visual constraints: Match the splash page briefing-panel structure and the heist card status/deadline vocabulary; use only existing theme colors

# Possible Edge Cases

- Heist id does not exist or document was deleted - the page needs a sensible not-found outcome
- Data still loading from Firestore - avoid flashing wrong status; show loading feedback before rendering fields
- finalStatus is success but the deadline has passed - must show "Completed", never downgrade to "Failed" once resolved
- finalStatus is failure regardless of deadline - always "Failed"
- Deadline exactly at the current moment - decide which side of the boundary applies
- Very long titles or descriptions - text wraps without breaking layout
- Deep link or page refresh directly on `/heists/[id]` - component renders correctly without arriving from the list page

# Acceptance Criteria

- All six data points render: title, description, assigned-to display name, assigned-to codename, deadline (relative + absolute), and derived status
- Status derivation matches the rule set: Completed / Failed / Failed-on-expiry / In Progress
- Back button with arrow icon navigates to `/heists` and is keyboard accessible with a proper accessible name
- Visual design uses only the application theme tokens and reads as part of the same design system as HeistCard and the splash briefing panel
- Existing tests continue to pass; new tests cover the status derivation matrix and back navigation

# Open Questions

- Should expiry-based "Failed" be persisted back to Firestore (via update) or purely derived at render time?
- Should the creator ("By:") also be shown alongside the assignee, as on list cards?
- Should the back button preserve browser history semantics (history back) or always go to `/heists` explicitly?
- Should the dossier header strip carry the heist id or a short reference code for flavor?
- Should completed/failed dossiers hide or mute interactive affordances given the mission is over?

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders title, description, assignee display name, assignee codename, and both deadline formats
- Shows "In Progress" when not completed with a future deadline (fake timers)
- Shows "Failed" when not completed and the deadline has passed (fake timers)
- Shows "Failed" when finalStatus is failure
- Shows "Completed" when finalStatus is success, even with an expired deadline
- Back button has an accessible name including the arrow icon and links to `/heists`
