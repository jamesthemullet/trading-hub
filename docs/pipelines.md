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

## Dependency Updates (Renovate)

Renovate runs during its configured weekday schedule and creates updates without requiring Dependency Dashboard approval. The dashboard remains available to track updates.

Renovate config sets `toolSettings.nodeMaxMemory` to 1024 MiB (1 GiB) for the Node heap. This is separate from any runner or container memory limit, which is not defined in the repository configuration. Previous npm lockfile generation hit memory limits, so npm updates remain individually bounded (apart from related package groups such as React and Mantine). Renovate creates at most one branch and one PR at a time.

Lock-file maintenance and pnpm package-manager updates are disabled while these memory safeguards apply. Renovate skips artifact generation for all npm updates to avoid further memory failures. The `Update Renovate lockfile` workflow generates only `pnpm-lock.yaml` with lifecycle scripts disabled, then pushes it back to same-repository PRs that have the `dependencies` label, are authored by `renovate[bot]`, and use a `renovate/` branch.

The workflow requires the `SAML_GITHUB_TOKEN` Actions secret with repository write access and the organisation's required SSO authorisation for GraphQL. It commits the lockfile using GitHub's `createCommitOnBranch` mutation, which provides GitHub-signed commits to satisfy the verified-signature rule. The mutation's `expectedHeadOid` atomically rejects an update if the branch has advanced since checkout; a new run must use the latest head.

Using this token allows the commit to trigger normal PR validation automatically, without the default `GITHUB_TOKEN`'s workflow-trigger restrictions. It is exposed only to the guarded job for same-repository Renovate PRs and is not available to arbitrary or forked pull requests.

Minor and patch update PRs are also given the `auto-cab` label so the required `Automated CAB Process / Check CAB Approval` check creates a change request for them automatically. Major/breaking update PRs are not auto-labelled, since they may need closer review before a change request is raised.

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
