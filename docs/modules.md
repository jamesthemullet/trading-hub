# Major Modules

## Rulesets

`/ruleset` pages, manages rulesets for categories and search, including boosts, buries, includes, and excludes. Uses various endpoints to fetch and update ruleset data.

## Facets

`/facets` pages, manages facet part of the rulesets, partially uses same endpoints as `/ruleset` pages, since facets are part of rulesets.

## Attribute Management

Provides UI and logic for boosting/burying product attributes, including numeric and alphanumeric types.

## State Management

Centralized selectors and reducers for managing application state, including ruleset changes and facet selections.

## Authentication

Azure OAuth integration for secure user access and role management.

## E2E and Unit Testing

Playwright for end-to-end tests, Jest for unit and integration tests.
