# Merch Hub Overview

## Purpose

Merch Hub is a UI for Merchandising team to manage merchandising rules, product attributes, and search and redirect configurations.

## API contract

Our agreed API contract with the backend team is stored in the [search-service](https://github.com/DigitalInnovation/search-service/blob/develop/search-service-app/src/main/resources/static/search-merchandising.yml) repo and duplicated in this repo as [src/libs/api/api.yml](src/libs/api/api.yml). It is used for all requests.

### Keeping the schema up to date

The schema is synced automatically every Monday at 08:00 UTC via the [Sync API schema](.github/workflows/sync-api-schema.yml) workflow. If the schema has changed, the workflow opens a pull request with the updated `api.yml` and regenerated TypeScript client. If the workflow fails, a GitHub issue is created automatically.

To sync manually at any time, trigger the workflow via **Actions → Sync API schema → Run workflow** in GitHub.

To update it locally, copy the latest schema from search-service and regenerate the client:

```bash
cp /path/to/search-service/search-service-app/src/main/resources/static/search-merchandising.yml src/libs/api/api.yml
pnpm run codegen
```

Or simply run `pnpm run codegen` to regenerate the TypeScript client from the current local `api.yml`.

## Key Features

- Rule-based product ranking and merchandising
- Attribute-level boosts and buries
- Category and search term management
- Changes to global (not category-specific) and category-specific rulesets
- Redirects management
- Hotfix and main release workflows
- Automated and manual deployment pipelines
- User access management and audit

## Technologies

- Next.js (React)
- TypeScript
- Playwright (E2E tests)
- Jest (unit tests)
- Azure OAuth
- GitHub Actions (CI/CD)
