# Contributing Guidelines

## How to Contribute

This project is using [JIRA](https://jira.marksandspencer.app/secure/RapidBoard.jspa?rapidView=9037)

If you want to contribute please contact us on [Teams](https://teams.microsoft.com/l/channel/19%3AttvAGMU-Xb9sEDdi38xCmCWHJ-zz32X0b-KrVGLt4GQ1%40thread.tacv2/General?groupId=696cefad-de9d-426d-b3d8-f535802cf24d&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543)

## Coding Conventions

This project is following [Idiomatic Typescript](https://google.github.io/styleguide/tsguide.html)

The stack is based on NextJS, Typescript.

The backend API schema is located here [API](https://prod-search-service-v1-eun-layer4-frontdoor.azurefd.net/search-merchandising.yml).

We are generating Typescript and JavaScript code from this schema, you should use those types throughout the codebase.

All code needs to be unit tested, required coverage is 100%.

E2E tests are written in Playwright and cover only major user journeys.

Documentation is location in [README](./README.md)

## Installation Instructions

```bash
npm install
```

## Build Instructions

```bash
npm run build
```

## Test Instructions

### Unit tests

```bash
npm run test
```

### E2E tests

```
npm run test:e2e:ui
```

## Release Instructions

Release is automated, happens every time a PR is merged to main branch.
