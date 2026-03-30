# Copilot Instructions for Trading Hub

## Package Manager

- Always use `pnpm` for package management
- Use `pnpm <script>` (or `pnpm run <script>`) to run package.json scripts
- Use `pnpm exec` only to run installed binaries (e.g., `pnpm exec eslint`)
- Do not use `npm` or `yarn`

## Code Quality

- Always run `pnpm format` after making code changes
- Always run `pnpm lint` to check for linting issues
- Always run `pnpm ts-check` to verify TypeScript type safety
- Run these before considering work complete
- ❌ NEVER swallow errors silently
- Instead: Always log, report, or re-throw errors with context

## TypeScript Anti-Patterns

- ❌ NEVER use `any`
- Instead: Use proper types, `unknown` with type guards, or generics
- Prefer `type` over `interface` for most new type definitions
- Instead: Use `type` for all type definitions for consistency, except where `interface` is required (e.g., module augmentation or declaration merging)
- ❌ NEVER use type assertions when narrowing is possible
- Instead: Use type guards, `instanceof`, `typeof`, or conditional checks
- ❌ NEVER omit return types on exported functions
- Instead: Always explicitly annotate return types (e.g., `export const foo = (): string => { ... }`)
- ❌ NEVER use non-boolean-prefixed boolean names
- Instead: Use `is`, `has`, `should`, `can`, `will`, `did`, etc. (e.g., `isLoading`, `hasError`, `canDelete`)

## Testing

- Follow the documented testing strategy in `docs/testing-strategy.md` for the balance of unit, integration, and end-to-end tests, as well as coverage requirements
- For UI tests, focus on behavior from the user's perspective rather than implementation details
- Within UI tests, use the following Testing Library query priority (strict order):
- `getByRole` / `findByRole` — always prefer; use these for interactive and semantic elements and to validate accessibility
- `getByLabelText` — use for form fields when `getByRole` with `name` is insufficient
- `getByText` / `findByText` — use when role/label queries are not possible for meaningful user-visible text
- `getByTestId` / `findByTestId` — last resort only, when no useful semantics exist and other selectors would be unstable
- Use `findBy*` queries for elements that appear asynchronously
- Always use `userEvent` instead of `fireEvent` for user interactions
- Instead: Set up `const user = userEvent.setup()` at the top of the test before interactions
- Instead: Prefer adding an accessible role or `aria-label` rather than relying on text-only or test ID queries when semantics are missing
- Prefer not to use `getByTestId`; when you must, use `data-testid` only for non-visual identifiers and stable hooks, not as a substitute for missing accessibility

## JSX/React

- ❌ NEVER use nested ternaries in JSX
- Instead: Extract conditionals to variables or helper functions for readability
- ❌ NEVER use `dangerouslySetInnerHTML` without sanitization
- Instead: Use safe text content or properly sanitize HTML with libraries like `DOMPurify`
- ❌ NEVER use clickable divs/spans instead of semantic elements
- Instead: Use `<button>`, `<a>`, `<form>`, or other semantic HTML for accessibility
- Extract complex logic into co-located custom hooks
- Instead: Keep components focused on rendering, and move stateful or reusable logic into nearby hooks such as `useThingName`
- Components should be co-located with their styles and tests
- Instead: Keep component files, CSS modules, and spec files together in the same feature or component directory

## CSS

- Use `camelCase` for all class names (e.g., `.containerWrapper`, `.buttonPrimary`)
- Instead: Never use kebab-case or snake_case in CSS module class names
- Prefer design system CSS custom properties for colors, margin, and padding where available
- Instead: Avoid hardcoding hex values, pixel values, or magic numbers when a design token exists, and document any necessary exceptions
- Reference design tokens from your design system where possible (e.g., `var(--color-primary)`, `var(--spacing-md)`)
- ❌ NEVER use `!important`
- Instead: Fix specificity issues by adjusting selectors or component structure
- ❌ NEVER hardcode `font-size`
- Instead: Use the Typography component for all text styling
