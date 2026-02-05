# Contributing Guidelines

## How to Contribute

This project is using [JIRA](https://jira-marksandspencer-app.atlassian.net/jira/software/c/projects/PSP/boards/534)

If you want to contribute please contact us on [Teams](https://teams.microsoft.com/l/channel/19%3Ae0d517e72115471d8a08714f154a4fc9%40thread.tacv2/%5BSquad%5D%20Merchandising%20Hub%20-%20Ask%20Anything?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543)

## Coding Conventions

This project is following [Idiomatic Typescript](https://google.github.io/styleguide/tsguide.html)

The stack is based on NextJS, Typescript.

The backend API schema is located here [API](https://portal.muziris.cloud.marksandspencer.app/catalog/default/api/search-service/definition).

We are generating Typescript and JavaScript code from this schema, you should use those types throughout the codebase.

All code needs to be unit tested, required coverage is 100%.

E2E tests are written in Playwright and cover only major user journeys.

Documentation is location in [README](./README.md)

## Installation Instructions

```bash
pnpm install
```

## Build Instructions

```bash
pnpm run build
```

## Test Instructions

### Unit tests

```bash
pnpm run test
```

### E2E tests

```
pnpm run test:e2e:ui
```

## Release Instructions

Release is automated to dev and requires manual approval for prod, happens every time a PR is merged to main branch.
