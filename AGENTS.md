# EnrollHub — AGENTS.md

## Quick start

```bash
bun install          # install deps (lock: bun.lock)
bun run dev          # vite dev server
bun run build        # tsc -b && vite build (order matters: typecheck first)
bun run lint         # eslint .
bun test             # vitest run
bun run test:watch   # vitest
```

## Stack

- **React 19**, TypeScript 6, Vite 8, Vitest 4, Tailwind CSS 4, **Bun** 1.2
- State: **Zustand** with `persist` middleware (localStorage). Store names: `enrollhub-a11y-prefs`, `enrollhub-auth`, `enrollhub-enrollment`, `enrollhub-admin`
- Routing: **react-router-dom v7** `createBrowserRouter` in `src/routes/index.tsx`
- i18n: **react-i18next** — translations hard-coded in `src/lib/i18n.ts` (es/en). No external files.
- Forms: **react-hook-form** with **zod** + custom `AccessibleForm` wrapper
- UI: **Radix UI** primitives + **class-variance-authority** + `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Styling: **Tailwind CSS v4** (`@import 'tailwindcss'`, `@theme` directive, no tailwind.config). Custom tokens in `src/styles/accessibility-tokens.css`
- Build: **React Compiler** enabled via Babel plugin in `vite.config.ts`
- Test: **jsdom**, global test setup at `src/test/setup.ts`, **jest-axe** for a11y tests (`expect.extend(toHaveNoViolations)`)
- WCAG design skill at `.cursorrules/skills/wcag-design/SKILL.md`

## Path alias

`@/` → `./src` (configured in `vite.config.ts` and `vitest.config.ts`)

## Important TypeScript quirks

- `verbatimModuleSyntax: true` → always use `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, no namespaces, no parameter properties
- `noUnusedLocals: true`, `noUnusedParameters: true` → clean up unused variables
- `noEmit: true` → Vite handles bundling, tsc is type-check only
- `tsconfig.app.json` excludes `src/__tests__/**` and `src/test/**` from typecheck

## Test conventions

- Tests live in `src/__tests__/a11y/` (accessibility tests with jest-axe). No unit tests found yet.
- Globals enabled → no need to import `describe`/`it`/`expect`
- Wrap components in `<MemoryRouter>` for route-dependent tests
- Use `@testing-library/react` `render` and `@testing-library/user-event` for interaction

## Architecture

```
src/
├── main.tsx              # Entrypoint — sets up i18n, accessibility store, renders App
├── App.tsx               # RouterProvider
├── routes/index.tsx      # All routes: /, /login, /register, /student/*, /admin/*
├── pages/                # auth/, student/, admin/ page components
├── components/           # layout/, ui/, forms/, accessibility/, chatbot/
├── stores/               # authStore, enrollmentStore, adminStore, accessibilityStore
├── lib/                  # utils, i18n, enrollmentValidation, chatbotEngine, reportExport
├── hooks/                # useFocusTrap, useAccessibility, useSessionTimeout
├── data/mock/            # careers.json, subjects.json, schedules.json, periods.json
├── test/setup.ts         # jest-dom matchers + jest-axe toHaveNoViolations
└── styles/               # accessibility-tokens.css
```

## Auth / mock users

Credentials hard-coded in `src/stores/authStore.ts`:
- `nuevo@uni.edu` / `demo1234` — new student (0 credits)
- `estudiante@uni.edu` / `demo1234` — regular student (45 credits, 4 subjects approved)
- `admin@uni.edu` / `admin1234` — admin

All login/register is mock (in-memory array, 300ms simulated delay).

## Route structure

All routes under `AppLayout` (has Header, SkipLink, AccessibilityMenu). Protected routes use `<ProtectedRoute role="student|admin">`.

| Path | Role | Component |
|------|------|-----------|
| `/` | public | Landing |
| `/login` | public | Login |
| `/register` | public | Register |
| `/student/welcome` | student | WelcomeTutorial |
| `/student/dashboard` | student | StudentDashboard |
| `/student/offer` | student | AcademicOffer |
| `/student/enroll` | student | EnrollmentWizard |
| `/student/receipt/:id` | student | Receipt |
| `/student/profile` | student | Profile |
| `/admin/dashboard` | admin | AdminDashboard |
| `/admin/careers` | admin | CareersManagement |
| `/admin/reports` | admin | Reports |

## Accessibility conventions

- `data-*` attributes on `<html>` toggle accessibility features (see `accessibilityStore.applyToDocument()`)
- CSS custom properties `--font-scale`, `--focus-ring-width`, `--focus-ring-color`, `--bg-primary`, `--text-primary`, etc.
- `SkipLink`, `Breadcrumb`, focus traps, `aria-live` regions throughout
- `AccessibleForm` component wraps react-hook-form with confirmation mode, success/error live regions
- Button component uses Radix `Slot` pattern (`asChild` prop) — do not render `<button>` inside `<a>` when `asChild`
- All interactive elements must have accessible labels

## Code style

- No comments in source files
- Named exports for components (`export function Foo`), `export default App` only for root
- `Button` has default `type="button"` (prevents accidental form submits)
- `buttonVariants` defined with `cva()` in `src/components/ui/button.tsx`
- `displayName` on `forwardRef` components
- Framer Motion for animations (respects `prefers-reduced-motion` via CSS data attribute)

## Notable hooks

- `useSessionTimeout` — session expiry warning + extension (src/hooks/)
- `useFocusTrap` — traps focus in modal/panel with Escape close + focus restore
- `useAccessibility` — convenience hook wrapping `useAccessibilityStore`
