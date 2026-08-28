# Spec for Project README Documentation

branch: opencode/feature/project-readme

# Summary

Create a comprehensive, professional `README.md` for Pocket Heist at the repository root. The README should accurately reflect the current state of the project, make it easy for a new contributor or evaluator to get the app running, and showcase the stack, features, structure, and testing approach. It should also surface the fact that the project was built with the opencode coding agent, and include the author's portfolio and LinkedIn links.

This is a documentation-only change (one new file at the repo root); no application code, tests, or build output should be modified.

# Functional requirements

1. **Title** — One-line description of the project. Include a mention that the project was built with the opencode coding agent (e.g. in the tagline or an adjacent badge/note).
2. **Badges** — License and version badges only (version from `package.json` `0.1.0`, license MIT from the `LICENSE` file). Skip build/coverage badges (no CI pipeline and no coverage tooling installed — do NOT fabricate them).
3. **Demo / screenshot / GIF** — A section hosting a screenshot. Use the existing `public/pocket-heists.png` (and link the live Vercel URL).
4. **Features** — Bullet list of 3-6 concrete, non-marketing items derived from the actual app: realtime Firestore lists scoped to the signed-in user, per-heist mission dossiers, codename generation, create-a-heist flow, accessible AuthForm / RouteGuard, and the `/preview` UI gallery.
5. **Tech Stack** — Only the stack actually used: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Firebase (Auth + Firestore), lucide-react icons, Vitest + Testing Library, Husky + commitlint.
6. **Getting started / Installation** — Prerequisites (Node version, Firebase project, required env vars), then copy-pasteable commands in order: clone → install → configure → run. Account for the PowerShell execution-policy quirk documented in AGENTS.md (run `npm`/`npx` via `cmd /c`).
7. **Environment variables** — Table of KEY / description / required-or-not for the Firebase config values (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
8. **Usage** — How to actually use the app once running: sign up/log in, create a heist, view the mission dossier, browse lists on the dashboard.
9. **Project structure** — A short tree covering `app/` (public vs dashboard routes), `components/`, `hooks/`, `types/firestore/`, `lib/`, `tests/`, `_specs/`.
10. **Testing** — How to run tests (`npm test`, single-file runs via vitest), what is covered (components, hooks, pages; the Firestore mocking pattern), and the caveat that coverage is NOT available (no `@vitest/coverage-v8`).
11. **Deployment** — Deployed on Vercel at https://pocket-heists.vercel.app/; note that pushing to the default branch triggers a production build via Vercel's Git integration.
12. **Roadmap / known issues (optional)** — Show self-awareness: note real limitations (coverage tooling absent, PowerShell execution-policy workaround, early-stage project, realtime derivations being render-only).
13. **License** — MIT. Add a `LICENSE` file (MIT) and reference it from the README. Copyright to the author.
14. **Contact / links** — Portfolio (https://gladwinramantso.netlify.app/) and LinkedIn (https://www.linkedin.com/in/gladwinramantso/).

# Design Reference

This is a documentation task, not a UI feature; the frontend-design skill may inform how the README's tone and presentation read, but there is no Figma component involved. Design considerations are limited to README readability: short sections, copy-pasteable command blocks, a clean env-var table.

# Possible Edge Cases

- **No CI / coverage tooling** — Must not fabricate build-status or coverage badges. The version and license badges need real sources of truth.
- **PowerShell execution policy** — On Windows, plain `npm run dev` fails; README must include the `cmd /c "npm run dev"` workaround so commands are copy-pasteable on this repo's target OS.
- **Firebase config** — README must clearly mark which env vars are required and where to get them (Firebase console), without committing any real keys.
- **Deployment reality** — If no deployment pipeline exists, the README must state that rather than inventing one.
- **No demo media yet** — Avoid an embedded broken image; describe intended screenshot/gif capture instead.
- **Path alias** (`@/*`) — Should be reflected in structure notes so contributors understand imports.
- **License unknown** — The repo has no `LICENSE` file; the README's License section must be accurate (either confirm all rights reserved or add a license). This is an open question.

# Acceptance Criteria

- A `README.md` file exists at the repository root.
- Covers all 14 requested sections (title/badges/demo/features/tech stack/getting-started/env vars/usage/structure/testing/deployment/roadmap/license/contact).
- Badges are truthful: no fabricated build or coverage badges given the lack of CI and coverage tooling.
- Commands are copy-pasteable for this repo's Windows execution-policy constraint (`cmd /c` form documented).
- The opencode coding agent is mentioned in the title/tagline.
- Portfolio and LinkedIn links are included.
- Tech stack lists only what is actually used.
- No application source, tests, or build output are modified.

# Open Questions

- ~~License~~ -> resolved: MIT + LICENSE file added.
- ~~Deployment~~ -> resolved: Vercel, https://pocket-heists.vercel.app/.
- Demo media: the repo already contains `public/pocket-heists.png`, used as the demo screenshot.

# Testing Guidelines

This is a docs-only change (README + LICENSE). No new component/hook/page tests are required. Optional verification:

- Run `cmd /c "npm run build"` to confirm the README/LICENSE additions do not affect the production build or typecheck.
- Run `cmd /c "npx vitest run"` to confirm the existing suite still passes.
- Manually validate that every URL (portfolio, LinkedIn, Vercel, Firebase console) and every shell command in the README is accurate and copy-pasteable.
