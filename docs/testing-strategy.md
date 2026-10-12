# Testing Strategy

## Unit Tests

- **Location**: `src/**/*.spec.ts` and `src/**/*.spec.tsx`
- **Runner**: Jest
- **Coverage**: Global thresholds are 100% for statements, branches, functions, and lines.
- **Run all unit tests**: `pnpm run test`
- **Run one file**: `pnpm exec jest src/path/to/file.spec.tsx`
- **Run matching tests**: `pnpm exec jest -t "test name"`
- **Watch mode**: `pnpm run tdd` (watch mode with coverage)

Use `renderWithProviders` from `@/test/render-with-providers` for React component tests. Use MSW for tests that exercise HTTP requests; mock individual dependencies directly when a network-level mock is not needed. Shared test data and helpers live in `src/test/data` and `src/test/helpers`.

## End-to-End Tests

- **Location**: `e2e/**/*.spec.ts`
- **Runner**: Playwright
- **UI runner**: `pnpm run test:e2e:ui`
- **Run mocked project headlessly**: `pnpm exec playwright test --project=mock`

Playwright projects divide tests by purpose:

- `mock`: UI flows under `e2e/tests` using mocked API behavior; excludes smoke tests.
- `category-tests`, `global-tests`, `search-tests`, `redirect-tests`: focused integration suites used by pull-request CI. The global project also includes product-status tests.
- `smoke`: dev smoke tests under `e2e/dev`.
- `production`: production smoke tests under `e2e/prod`; this project targets the live production site and requires the configured production test account.

Avoid running `pnpm run test:e2e` without a project filter unless you intend to run every configured project, including production tests. The Playwright UI runner also offers all configured projects; select a non-production project for local work.

## Scheduled Smoke Tests

- Dev smoke tests run every 15 minutes on weekdays from 07:00 through 20:45 UTC.
- Production smoke tests run every four hours on weekdays from 04:00 to 20:00 UTC.
- Both workflows can also be started manually and report results to Dynatrace.
- Production smoke tests require credentials held in GitHub Actions. For production test-user credential reset steps, see [secret rotation guidance](./secret-rotation.md#prod-smoke-test-user-password-reset).

## Pull-Request CI

- Pull requests targeting `main` or `hotfix` run code quality checks, dependency audits, unit tests with coverage, a build, sharded Playwright suites (`category-tests`, `global-tests`, `search-tests`, and `redirect-tests`), and Storybook accessibility tests.
- CI also checks new Istanbul coverage-ignore reasons. Knip runs as an advisory job and does not fail the workflow on its own.
- Pull-request CI does not run the scheduled smoke projects or the live production project.

## Local Setup

Playwright starts the local development server automatically when needed. Configure the environment variables required by the selected test project in `.env`; production tests use a live target and must only be run intentionally. Unit tests do not require `NEXT_PUBLIC_AUTO_LOGIN` to be set.
