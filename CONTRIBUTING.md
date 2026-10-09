# Contributing Guidelines

## How to Contribute

This project uses [JIRA](https://jira-marksandspencer-app.atlassian.net/jira/software/c/projects/PSP/boards/534) to track work. Before starting a feature or bug fix, create or update a JIRA issue with the context and expected outcome. For questions or help prioritising work, contact the team on [Teams](https://teams.microsoft.com/l/channel/19%3Ae0d517e72115471d8a08714f154a4fc9%40thread.tacv2/%5BSquad%5D%20Merchandising%20Hub%20-%20Ask%20Anything?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543).

To submit a contribution:

1. Create a branch from the latest `main` branch. If you do not have write access, fork the repository and create your branch there.
2. Make your changes and add or update tests for the behaviour you changed.
3. Run the relevant tests and checks before opening a pull request. At minimum, run `pnpm pr-validate`.
4. Open a pull request targeting `main`. Link the related JIRA issue and complete the [pull request template](./.github/pull_request_template.md), including the change description, testing steps, and any relevant screenshots.
5. Review the pull request checklist and address feedback from reviewers before merging.
6. A minimum of one approval is required.

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
