# Project Structure

```text
root/
├── src/
│   ├── libs/
│   │   ├── components/         # Reusable UI components
│   │   ├── containers/         # Complex UI components handling their own state
│   │   ├── features/           # Business features (facets, rulesets, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── modules/            # Domain module exports (redirects, rulesets)
│   │   ├── stores/             # Shared state, including reducers and selectors
│   │   ├── constants/          # Shared constants
│   │   ├── styles/             # Shared styles
│   │   ├── utils/              # Utility functions
│   │   ├── api/                # API schema and generated client
│   ├── pages/                  # Next.js Pages Router routes
│   ├── test/                   # Test data, helpers, and render utilities
│   ├── types/                  # Source-level TypeScript types
├── public/                     # Static assets
├── coverage/                   # Test coverage reports (gitignored)
├── ci/                         # Infrastructure configuration (Terraform)
├── e2e/                        # End-to-end tests (Playwright)
├── docs/                       # Documentation
├── scripts/                    # Repository maintenance and validation scripts
├── types/                      # Root-level TypeScript declarations
├── config/                     # Tooling configuration files
├── .github/workflows/          # GitHub Actions workflows
├── package.json                # Project metadata, dependencies, and scripts
└── README.md                   # Main documentation
```
