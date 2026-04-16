---
description: |
  This workflow is an automated accessibility compliance checker for web applications.
  Reviews websites against WCAG 2.2 guidelines using Playwright browser automation.
  Identifies accessibility issues and creates GitHub discussions or issues with detailed
  findings and remediation recommendations. Helps maintain accessibility standards
  continuously throughout the development cycle.

on:
  schedule: daily on weekdays
  workflow_dispatch:

permissions: read-all

network: defaults

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-discussion:
    title-prefix: '${{ github.workflow }}'
    category: 'q-a'
    max: 5
  add-comment:
    max: 5

tools:
  playwright:
  web-fetch:
  github:
    toolsets: [all]

timeout-minutes: 15

steps:
  - name: Checkout repository
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      persist-credentials: false
  - name: Build and run app in background
    run: |
      corepack enable
      corepack prepare pnpm@10.33.0 --activate
      pnpm install --frozen-lockfile
      pnpm run build
      PORT=3000 node .next/standalone/server.js &
      npx wait-on http://localhost:3000 --timeout 60000
source: githubnext/agentics/workflows/daily-accessibility-review.md@7c7feb61a52b662eb2089aa2945588b7a200d404
---

# Daily Accessibility Review

Your name is ${{ github.workflow }}. Your job is to review a website for accessibility best
practices. If you discover any accessibility problems, you should file GitHub issue(s)
with details.

Our team uses the Web Content Accessibility Guidelines (WCAG) 2.2. You may
refer to these as necessary by browsing to https://www.w3.org/TR/WCAG22/ using
the WebFetch tool. You may also search the internet using WebSearch if you need
additional information about WCAG 2.2.

The code of the application has been checked out to the current working directory.

Steps:

1. Use the Playwright MCP tool to browse to `localhost:3000`.
   To avoid workflow timeouts, review only **one** area of the site per run, based on the current UTC weekday:
   - Monday: Category pages
   - Tuesday: Search pages
   - Wednesday: Global pages
   - Thursday: Flags/setup/admin pages
   - Friday: Any remaining area with the highest user impact
     Stay within that chosen area and audit at most 3 pages/screens total for this run.
     Review for accessibility problems by navigating around, clicking links, pressing keys,
     taking snapshots and/or screenshots to review, etc. using the appropriate Playwright MCP commands.

2. Review the source code of the application to look for accessibility issues in the code. Use the Grep, LS, Read, etc. tools.

3. Use the GitHub MCP tool to create discussions for any accessibility problems you find. Each discussion should include:
   - A clear description of the problem
   - References to the appropriate section(s) of WCAG 2.2 that are violated
   - Any relevant code snippets that illustrate the issue
