# Merch Hub Overview

## Purpose

Merch Hub is a UI for Merchandising team to manage merchandising rules, product attributes, and search and redirect configurations.

## API contract

Our agreed API contract with the backend team is stored in the [search-service](https://github.com/DigitalInnovation/search-service/blob/main/search-service-app/src/main/resources/static/search-merchandising.yml) repo and duplicated in this repo. It is used for all requests.

You can check or generate the code by running `npm run codegen` which uses the local [api.yml](src/libs/api/api.yml) file

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
