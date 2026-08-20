# Plan: Authentication Forms (auth-forms)

branch: opencode/feature/auth-forms
spec: _specs/auth-forms.md

## Design

A single shared **`AuthForm`** client component with a `mode` prop (`"login" | "signup"`) — satisfies the "easily switch between the two forms" requirement. The two pages pass the mode and render the correct submit label + cross-link.

## Files

### 1. New component: `components/AuthForm/`

- `AuthForm.tsx` — `"use client"`; props `{ mode: "login" | "signup" }`
  - Email input (`type="email"`, required)
  - Password input (required)
  - Visibility toggle button using lucide `Eye`/`EyeOff`; toggles `type="password"` ↔ `"text"`
  - Submit button labelled **Login** or **Sign up**
  - `onSubmit`: `preventDefault()` then `console.log({ mode, email, password })` — no network calls
  - Below the form: switch link — login → "Don't have an account? Sign up" (`/signup`); signup → "Already have an account? Log in" (`/login`)
- `AuthForm.module.css` — `@reference "../../app/globals.css";`, themed inputs (dark card on `bg-light`, `border-lighter`, primary button) matching existing `.btn`/theme colors
- `index.ts` — barrel export

### 2. Update pages

- `app/(public)/login/page.tsx` — keep `.center-content` + `.page-content` + `.form-title` ("Log in to Your Account"), render `<AuthForm mode="login" />`
- `app/(public)/signup/page.tsx` — same, "Signup for an Account", `<AuthForm mode="signup" />`

### 3. Tests: `tests/components/AuthForm.test.tsx`

- Login form renders email, password, toggle, and "Login" button
- Signup form renders email, password, toggle, and "Sign up" button
- Submitting logs `{ mode, email, password }` to console (spy on `console.log`)
- Toggle switches input `type` between `password`/`text`; switch link points to the other route

## Conventions honored

- CSS Modules with `@reference` for theme colors (the Tailwind v4 gotcha in `AGENTS.md`)
- No semicolons in `.tsx`/`.ts`; `@/*` path alias; theme colors from `globals.css`
- `lucide-react` already a dependency (Navbar uses `Clock8`)

## Out of scope (per spec open questions)

- No "confirm password" field on signup
- No real auth / backend — console logging only

## Verification

`npx vitest run tests/components/AuthForm.test.tsx`, then full `npm test` (pre-commit hook) + `npm run build`.