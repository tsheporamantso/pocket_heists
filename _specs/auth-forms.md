# Spec for Authentication Forms

branch: opencode/feature/auth-forms
figma_component (if used): n/a

# Summary

Build the authentication forms for the `/login` and `/signup` pages. Both forms collect an email address and a password, include a "hide/show password" toggle icon, and have a submit button labelled with the action (Login/Sign up). For now, submitting a form only logs the entered details to the browser console — no real authentication or backend calls. The two forms must be easy to switch between (e.g. shared component with a mode prop, or a link between pages).

# Functional requirements

- `/login` page renders a login form with:
  - Email input
  - Password input
  - Password visibility toggle icon (hide/show)
  - Submit button labelled "Login"
- `/signup` page renders a signup form with:
  - Email input
  - Password input
  - Password visibility toggle icon (hide/show)
  - Submit button labelled "Sign up"
- Submitting either form logs the entered email/password to the console only. No network calls, no auth.
- Users can easily switch between the two forms (e.g. a "Don't have an account? Sign up" / "Already have an account? Log in" link, or a shared toggleable form component).
- Use project styling conventions: theme colors from `app/globals.css`, CSS Modules, existing global utility classes (`.btn`, `.form-title`, etc.).

# Figma Design Reference (only if referenced)

- File: n/a
- Component name: n/a
- Key visual constraints: n/a

# Possible Edge Cases

- Empty email or password submitted.
- Password with leading/trailing whitespace.
- Password visibility toggle: input type switches between `password` and `text` without losing focus.
- Toggling visibility on a password with no value.
- Duplicate submissions before the console log completes.
- The signup and login forms should never appear on the wrong page.

# Acceptance Criteria

- Visiting `/login` shows only the login form (email, password, visibility toggle, Login button).
- Visiting `/signup` shows only the signup form (email, password, visibility toggle, Sign up button).
- Clicking the visibility icon toggles the password input between hidden and visible, and the icon reflects the state.
- Submitting a filled form logs the email and password to the console.
- A visible link/toggle lets the user move between `/login` and `/signup`.
- Styling uses theme colors and matches the existing visual language.

# Open Questions

- Should the email input have a placeholder, and if so what wording? Yes
- Should there be a "confirm password" field on signup? (Not in scope unless requested.) No
- Should the visibility toggle be an eye/eye-off lucide icon? Yes
- What should the console log payload look like (object vs individual values)? object

# Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Login form renders with email input, password input, visibility toggle, and Login button.
- Signup form renders with email input, password input, visibility toggle, and Sign up button.
- Submitting the login form logs the entered details to the console.
- Submitting the signup form logs the entered details to the console.
- Clicking the visibility toggle changes the password input type between password and text.
