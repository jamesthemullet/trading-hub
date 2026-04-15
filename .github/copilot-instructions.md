# Copilot Instructions for Trading Hub

Merchandising UI for M&S trading teams to manage product ranking rules, facets, and search redirects.

## Commands

```bash
pnpm run dev          # Start dev server (runs codegen first)
pnpm run codegen      # Generate TypeScript from src/libs/api/api.yml
pnpm run lint         # ESLint + Stylelint
pnpm run lint:fix     # Auto-fix lint issues
pnpm run format       # Prettier
pnpm run ts-check     # TypeScript type check
pnpm run test         # Jest unit tests (TZ=UTC, 100% coverage required)
pnpm run tdd          # Jest watch mode with coverage
pnpm run test:e2e:ui  # Playwright E2E with UI
pnpm run pr-validate  # Full CI check (codegen + lint + format + ts-check + test + e2e mock)
```

Run a single test file: `pnpm exec jest src/path/to/file.spec.tsx`
Run tests matching a name: `pnpm exec jest -- -t "test name"`

Always run `pnpm run format`, `pnpm run lint`, and `pnpm run ts-check` before considering work complete.

## Architecture

### Pages and Routing

Next.js Pages Router. Pages must use `.page.tsx` / `.page.ts` suffix — this is enforced via `pageExtensions` in `next.config.mjs`. Test files use `.spec.tsx` / `.spec.ts`. Non-page files in `src/pages/` (e.g. API routes) also follow this pattern.

### Source Layout

```
src/libs/
  api/          # Generated API client + api.yml schema
  components/   # Reusable, stateless UI components
  containers/   # Stateful UI components (manage their own state)
  features/     # Business features grouped by domain (facets, rulesets, shared)
  hooks/        # Custom React hooks
  modules/      # Barrel exports for domain modules
  stores/       # Reducers and selectors for complex shared state
  utils/        # Utility functions and global styles
src/pages/      # Next.js pages (category, search, global, flags, api routes)
src/test/       # Shared test helpers and mock data
e2e/            # Playwright end-to-end tests
```

### API Client

All API types come from the generated client. **Never write your own API types.**

```bash
pnpm run codegen  # Regenerates src/libs/api/generated/open-api.ts from api.yml
```

Use the `search()` helper to access endpoints:

```ts
import { search } from '@/libs/api';
search().betaMerchandisingCategoryRulesetList({ q: '', start: 0, rows: 10 });
```

### Authorization

Role-based access: `Cat.R`, `Cat.W`, `Search.R`, `Search.W`, `Glob.R`, `Glob.W`. Roles are read from the next-auth session token. The `useAccess` hook handles role checks and a feature flag gates the entire authorization system. Pages render `<AccessDeny>` when the user lacks the required role.

## Key Conventions

### Package Manager

Always use `pnpm`. Never use `npm` or `yarn`. Use `pnpm exec` to run installed binaries.

### TypeScript

- ❌ Never use `any` — use proper types, `unknown` with type guards, or generics
- Prefer `type` over `interface` for new definitions (use `interface` only for declaration merging)
- ❌ Never use type assertions when narrowing is possible — use type guards instead
- Always annotate return types on exported functions
- Boolean variables must use `is`, `has`, `should`, `can`, `will`, or `did` prefixes

### React / JSX

- ❌ No nested ternaries in JSX — extract to variables or helper functions
- ❌ No `dangerouslySetInnerHTML` without sanitization (use `xss` library)
- ❌ No clickable `div`/`span` — use `<button>`, `<a>`, or other semantic elements
- Extract complex stateful logic into co-located custom hooks (`useThingName`)
- Components, CSS modules, and spec files live together in the same directory

### CSS Modules

- Use `camelCase` class names (`.containerWrapper`, not `.container-wrapper`)
- Use design system CSS custom properties (`var(--color-*)`, `var(--mns-spacing-*)`, `var(--mns-breakpoints-*)`) — avoid hardcoded hex/pixel values
- ❌ No `!important`
- ❌ No hardcoded `font-size` — use the `Typography` component

### Testing

Tests use Jest + React Testing Library + MSW. **100% coverage is required** — branches, statements, functions, and lines. `jest-fail-on-console` is active: `console.error` calls will fail tests.

**Test render helper** — always use `renderWithProviders` from `@/test/render-with-providers` instead of bare `render`:

```ts
import { renderWithProviders } from '@/test/render-with-providers';

// Default roles: ['Cat.W', 'Search.W', 'Glob.W']
renderWithProviders(<MyComponent />);

// Custom roles:
renderWithProviders(<MyComponent />, ['Cat.R']);

// With feature flags:
renderWithProviders(<MyComponent />, ['Cat.W'], { featureFlags: { hasAuthorization: true } });
```

**API mocking** — use MSW `setupServer` from `msw/node`:

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/search/beta/merchandising/category/ruleset', () =>
    HttpResponse.json({ ruleSets: [], pagination: { totalItems: 0 } })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Router mocking** — always mock `next/router`:

```ts
import { useRouter } from 'next/router';
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
(useRouter as jest.Mock).mockReturnValue({
  isReady: true,
  query: {},
  push: jest.fn(),
});
```

**Query priority** (strict order):

1. `getByRole` / `findByRole` — always prefer
2. `getByLabelText` — for form fields
3. `getByText` / `findByText` — when role/label queries aren't possible
4. `getByTestId` — last resort only

Use `userEvent` (not `fireEvent`) for interactions. Set up with `const user = userEvent.setup()`.

Use `findBy*` for elements that appear asynchronously.

To exclude a file from coverage: `/* istanbul ignore file */` at the top.

### Error Handling

❌ Never swallow errors silently. Always log, report, or re-throw with context.

### Flag Surprising Issues

If you encounter something confusing, broken, or improvable that isn't in scope, add a `// TODO:` comment flagging it rather than ignoring it or silently fixing it.
