# CI/CD Pipelines

## Main Release Pipeline (`release.yml`)

- **Trigger**: Push to `main` branch or manual dispatch
- **Environment**: Dev → Production
- **Steps**:
  1. **Build & Test**
     - Node.js setup and cache
     - Install dependencies
     - Run unit tests and type checking
     - Build application
  2. **Dev Deployment**
     - Automatic deployment to dev environment
     - Runs smoke tests to validate deployment
  3. **Production Deployment**
     - Azure authentication using OIDC
     - Container deployment to Azure
     - Manual approval required

## Hotfix Pipeline (`hotfix.yml`)

- **Trigger**: PRs to `hotfix` branch
- **Environment**: Dev → Production
- **Process**:
  1. Create branch from `hotfix`
  2. Make changes and create PR against `hotfix`
  3. Merge triggers automatic dev deployment
  4. Manual approval for production deployment
  5. Hotfix branch is synced with main after successful release

## PR Validation Pipeline (`pr-validate-and-deploy.yml`)

- **Purpose**: Validates pull requests
- **_Notes_** This rule is set as a required check for merging to `main` branch, but not for `hotfix` branch as pipeline for release has a `sync-branches` job that fails if branch protection is enabled on `hotfix` branch, if merging anything to `hotfix` make sure not to merge without this pipeline check.
- **Steps**:
  1. **Code Quality**
     - Runs tests and linting
     - Type checking and formatting validation
  2. **Build**
     - Builds the application and validates standalone output
  3. **E2E Tests**
     - Runs Playwright end-to-end tests
  4. **Storybook Accessibility**
     - Runs accessibility tests against Storybook

## Smoke Tests Pipeline (`smoke-tests.yml`)

- **Schedule**: Runs every 15 minutes
- **Scope**:
  - Category and global ranking tests
  - Data loading verification
  - Authentication flows
- **Monitoring**:
  - Dynatrace integration for failure alerts
  - Email notifications after 2 consecutive failures
  - Early warning after single failure

## Security Features

- OIDC (OpenID Connect) authentication
- Federated credentials for Azure access
- Secret rotation every 6 months
- Snyk integration for vulnerability scanning

## Branch Protection

- Main branch requires PR reviews
- Hotfix branch allows emergency deployments without approval, but make sure that all checks pass anyway
- PR checks enforce tests and code quality standards

## Monitoring & Alerts

- Dynatrace integration for monitoring
- Automated smoke tests every 15 minutes
- Alert workflows for test failures
- Health checks for deployment validation

## Environment URLs

| Environment | URL                                                       |
| ----------- | --------------------------------------------------------- |
| Dev         | https://dev-merchandising-hub.search.marksandspencer.app/ |
| Prod        | https://merchandising-hub.search.marksandspencer.app/     |

## Deployment Guidelines

1. **Normal Release**:
   - Merge to main branch
   - Monitor dev deployment
   - Approve production deployment (required for any release after the incident)
   - Run smoke tests to validate

2. **Hotfix Release**:
   - Branch from hotfix
   - Create PR against hotfix branch
   - Test in dev environment
   - Approve production deployment
   - Create PR to sync with main (when appropriate)

3. **Code Freeze Periods**:
   - Use hotfix branch for emergency changes
   - Avoid merging hotfix to main during freeze
   - Additional validation required for production deployments
