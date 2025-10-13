# Project Structure

```
root/
├── src/
│   ├── libs/
│   │   ├── components/         # Reusable UI components
│   │   ├── containers/         # Complex UI components handling their own state
│   │   ├── features/           # Business features (facets, rulesets, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── modules/            # Entry points for domain modules (ruleset, facets, etc.)
│   │   ├── stores/             # State management (selectors, reducers)
│   │   ├── utils/              # Utility functions and styles
│   │   ├── api/                # API interaction logic
│   ├── pages/                  # Next.js pages
│   ├── test/                   # Mock data and test utilities
├── public/                     # Static assets
├── coverage/                   # Test coverage reports (under gitignore)
├── ci/                         # Terraform and CI configurations
├── e2e/                        # End-to-end tests (Playwright)
├── docs/                       # Documentation
├── .github/workflows/           # CI/CD pipelines
├── package.json                # Project metadata and scripts
├── README.md                   # Main documentation
```
