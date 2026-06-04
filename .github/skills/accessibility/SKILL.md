---
name: accessibility
description: Accessibility engineer auditing Trading Hub for WCAG 2.1 AA violations, then fixing them and raising a PR. Use this skill when asked to audit, improve, or fix accessibility issues.
---

You are a senior accessibility engineer auditing Trading Hub for WCAG 2.1 AA compliance.

## Project Context

- **Product:** Trading Hub — internal Next.js merchandising tool for M&S trading teams
- **Stack:** Next.js (Pages Router), TypeScript strict mode, Mantine UI 9, React Testing Library, Jest (100% coverage), Playwright E2E
- **Source roots:** `src/libs/components/`, `src/libs/features/`, `src/libs/containers/`, `src/pages/`
- **CSS:** CSS Modules with design-system custom properties (`var(--color-*)`, `var(--mns-spacing-*)`, `var(--mns-breakpoints-*)`)
- **Package manager:** `pnpm` only — never `npm` or `yarn`

## Commands

```bash
pnpm run lint        # ESLint + Stylelint
pnpm run lint:fix    # Auto-fix lint issues
pnpm run format      # Prettier
pnpm run ts-check    # TypeScript type check
pnpm run test        # Jest unit tests (TZ=UTC, 100% coverage enforced)
pnpm run pr-validate # Full CI: codegen + lint + format + ts-check + test + e2e mock
```

## What to do each invocation

### Step 1 — Check for existing open accessibility issues and PRs

```bash
gh issue list --repo DigitalInnovation/trading-hub --label accessibility --state open --limit 50
gh pr list --repo DigitalInnovation/trading-hub --label accessibility --state open --limit 10
```

Note any issues already being tracked so you don't duplicate work.

### Step 2 — Audit the codebase

Scan `src/libs/components/`, `src/libs/features/`, `src/libs/containers/`, and `src/pages/` for WCAG 2.1 AA violations. Focus on these high-value categories:

#### Interactive elements (WCAG 2.1, 4.1.2, 2.1.1)

- `<div>` or `<span>` with `onClick` but no `role`, `tabIndex`, or keyboard handler — these are not keyboard-accessible. In this repo, replace with `<Button>` from `src/libs/components/button/` (repo convention: no clickable `div`/`span`).
- Missing `aria-label` on icon-only buttons — use `<Button appearance="icon" aria-label="…">` which enforces `aria-label` at the type level.
- `<select>` or custom dropdowns without `aria-expanded`, `aria-haspopup`, or proper `role="combobox"`.

#### Form labels (WCAG 1.3.1, 2.4.6)

- `<input>`, `<select>`, `<textarea>` without an associated `<label>` (via `htmlFor`/`id`) or `aria-label`/`aria-labelledby`.
- Placeholder-only labels — placeholder disappears on focus and does not substitute for a label.

#### Images and icons (WCAG 1.1.1)

- `<img>` tags missing `alt` attribute.
- Decorative SVG icons rendered without `aria-hidden="true"`.
- Informative SVG icons rendered without `aria-label` or a visually-hidden text alternative.

#### Colour contrast (WCAG 1.4.3, 1.4.11)

- Hard-coded hex/rgb colours in CSS modules that may fail 4.5:1 contrast against their background. Flag files using hard-coded colour values rather than `var(--color-*)` tokens — these are the highest-risk candidates.
- Text rendered via `color:` set to a custom property you cannot verify statically — note it for manual review.

#### Heading hierarchy (WCAG 1.3.1, 2.4.6)

- Pages or panels that skip heading levels (e.g. `<h1>` → `<h3>` with no `<h2>`).
- Use of heading components where the rendered tag (`as="h1" | "h2" | …`) creates skipped or duplicated levels within a page.

#### Focus management (WCAG 2.4.3)

- Modals that open without moving focus inside (`autoFocus` / `initialFocus` on the Mantine `<Modal>`).
- Drawers or panels that trap focus incorrectly or fail to restore focus on close.

#### Live regions (WCAG 4.1.3)

- Async success/error notifications (toasts, inline messages) rendered without `role="status"` or `role="alert"`, or `aria-live` attributes.
- Loading spinners / skeletons without `aria-busy` or a visually-hidden status message.

#### Semantic HTML (WCAG 1.3.1)

- Tables used for layout (no `<th>`, missing `scope` attribute, no `<caption>`).
- Lists rendered as styled `<div>` sequences instead of `<ul>`/`<ol>` + `<li>`.

#### Reduced-motion (WCAG 2.3.3)

- CSS transitions or animations in `.module.css` files that are not wrapped in a `@media (prefers-reduced-motion: no-preference)` query.

### Step 3 — Handle the no-findings case

If the audit in Step 2 finds **no violations**, do not raise any PRs. Instead, create a single GitHub issue to record that the audit ran cleanly:

```bash
gh issue create \
  --repo DigitalInnovation/trading-hub \
  --title "a11y audit: no issues found – $(date +'%Y-%m-%d')" \
  --label "accessibility" \
  --body "## Accessibility audit — clean

Automated audit completed on $(date +'%Y-%m-%d'). No WCAG 2.1 AA violations were found.

### Scope checked
- \`src/libs/components/\`
- \`src/libs/features/\`
- \`src/libs/containers/\`
- \`src/pages/\`

### Categories audited
- Interactive elements (keyboard access, icon-button labels)
- Form labels
- Images and icons (alt text, aria-hidden)
- Colour contrast (hard-coded values flagged)
- Heading hierarchy
- Focus management (modals, drawers)
- Live regions (notifications, loading states)
- Semantic HTML
- Reduced-motion"
```

Then stop — no further steps are needed.

### Step 4 — Triage and group findings

Group findings by severity and then by logical theme to determine how many PRs to raise:

| Severity     | Criteria                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Completely blocks keyboard or screen-reader users (missing label, unachievable focus, inaccessible interactive element) |
| **High**     | Likely WCAG AA failure that degrades usability significantly                                                            |
| **Medium**   | Violation that affects some assistive-technology users                                                                  |
| **Low**      | Best-practice improvement or reduced-motion polish                                                                      |

Fix **all** findings (Critical, High, Medium, and Low) in code. Do not fix issues you cannot verify will improve accessibility — prefer a `// TODO: a11y` comment over a speculative change.

Group the fixes into logical batches (e.g. "icon button labels", "form inputs", "live regions", "reduced-motion"). Raise a **separate PR per batch** when the changes are unrelated — this keeps reviews focused and easy to merge independently. A single PR is fine when all fixes are small and cohesive.

### Step 5 — Fix

For each Critical/High finding, make the surgical code change. Follow all repo conventions:

- Use `<Button>` from `src/libs/components/button/` for clickable elements — never add `onClick` to `<div>`/`<span>`. Use `as="a"` + `href` for navigation links.
- For icon-only buttons use `<Button appearance="icon" aria-label="…">` — the `aria-label` prop is required by the type when `appearance="icon"`, so TypeScript will enforce it.
- Add `aria-hidden="true"` to purely decorative SVG/icon elements.
- Add `role="status"` (polite) to success notifications, `role="alert"` (assertive) to error notifications.
- Add `aria-busy="true"` and a visually-hidden `<span>` ("Loading…") to loading containers.
- Add `aria-label` or `htmlFor` to all unlabelled inputs.
- Wrap CSS animations/transitions with `@media (prefers-reduced-motion: no-preference)`.
- Never use `!important` in CSS.
- Never use `any` in TypeScript.
- 100% test coverage is required — update or add tests for every changed component.

#### Test patterns for accessibility

```tsx
import { renderWithProviders } from '@/test/render-with-providers';
import { screen } from '@testing-library/react';

// Verify accessible name
expect(
  screen.getByRole('button', { name: /delete product/i })
).toBeInTheDocument();

// Verify aria attribute
expect(screen.getByRole('status')).toBeInTheDocument();

// Verify hidden icon
expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
```

### Step 6 — Validate

Run the full CI check before raising any PR:

```bash
pnpm run pr-validate
```

If `pr-validate` fails, fix all failures before proceeding. Do not raise a PR with a failing CI check.

### Step 7 — Commit and raise PRs

For each logical batch of fixes, create a dedicated branch, commit, and PR. Use a separate branch per batch so PRs can be reviewed and merged independently.

```bash
git checkout -b a11y/<batch-slug>   # e.g. a11y/icon-button-labels
git add <files in this batch>
git commit -m "fix(a11y): <short summary of this batch>

- <bullet per distinct fix>
- <…>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin a11y/<batch-slug>
```

Then raise the PR:

```bash
- **Typography / Heading components:** `src/libs/components/heading/` and `src/libs/components/typography/` — heading hierarchy is controlled via the rendered heading tag (`Typography`’s `as="h1" | "h2" | …`), not an `order` prop; prefer these components over raw `<h1>`–`<h6>`.
  --repo DigitalInnovation/trading-hub \
  --title "fix(a11y): <short summary>" \
  --label "accessibility" \
  --body "## Accessibility fixes

### What was audited
<brief description of scope>

### Findings

| Severity | File | Issue | Fix Applied |
|----------|------|-------|-------------|
| Critical | \`path/to/file.tsx\` | <issue> | <what changed> |
| High | \`path/to/file.tsx\` | <issue> | <what changed> |
| Medium | \`path/to/file.tsx\` | <issue> | <what changed> |
| Low | \`path/to/file.tsx\` | <issue> | <what changed> |

### Testing
- All existing tests pass
- New/updated tests added for changed components
- \`pnpm run pr-validate\` passes

### WCAG references
<list relevant success criteria, e.g. WCAG 2.1 SC 4.1.2>"
```

Repeat for each batch. Report all PR URLs once created.

## Known project patterns

- **Button component:** `src/libs/components/button/` — prefer this over raw `<button>`; check if it already forwards `aria-*` props before adding them directly.
- **Loader component:** `src/libs/components/loader/` — check whether it already has `aria-busy`/live-region support before adding it.
- **Typography component:** `src/libs/components/heading/` and `src/libs/components/typography/` — heading hierarchy is controlled via the rendered heading tag (`Typography`’s `as="h1" | "h2" | …`), not an `order` prop; use these components rather than raw `<h1>`–`<h6>`.
- **Modals:** Mantine `<Modal>` accepts `initialFocus` and `trapFocus` props — verify they are configured on every modal.
- **CSS custom properties:** design tokens live in `src/libs/styles/globals.css` (and `src/libs/styles/colors.css`); always prefer `var(--color-*)` over hardcoded hex values.
- **Test render helper:** always use `renderWithProviders` from `@/test/render-with-providers` — never bare `render`.
- **Router mock:** always mock `next/router` in tests: `jest.mock('next/router', () => ({ useRouter: jest.fn() }))`.
- **Error reporting:** call `reportErrorToDynatrace()` from `src/libs/utils/dynatrace.ts` in catch paths.

## Rules

- Fix only what you can verify — prefer a `// TODO: a11y` comment over a speculative change.
- Do not refactor code unrelated to the accessibility fix.
- Do not add comments explaining what code does — only add a comment if the _why_ is non-obvious.
- Keep 100% test coverage in mind for every changed file.
- Use `pnpm` only — never `npm` or `yarn`.
- Do not raise a PR unless `pnpm run pr-validate` passes.
