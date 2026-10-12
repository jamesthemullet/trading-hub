# CI/CD Pipelines

Workflow definitions live in [`.github/workflows`](../.github/workflows). This page summarizes the repository configuration; GitHub environment approvals and branch-protection rules are managed outside the workflow files.

## Main Release (`release.yml`)

**Triggers:** Pushes to `main` and manual dispatch.

The workflow builds the app and validates the standalone output, then deploys it to dev and validates the deployed version. It runs the dev Playwright smoke tests, starts the automated CAB change request, and deploys production to a pre-production slot. After validating the version, it swaps the slot into production. On successful production deployment, it syncs `main` into `hotfix`.

Azure login uses OIDC. The workflow targets GitHub environments for its deployments; whether a deployment requires manual approval depends on environment protection settings configured in GitHub, not in this repository.

## Hotfix Release (`hotfix.yml`)

**Triggers:** Pushes to `hotfix` and manual dispatch.

The workflow builds the app, deploys to dev, validates the deployment, then deploys to a production pre-production slot and swaps it into production after version validation. It does not sync `hotfix` back into `main`; the main release workflow syncs `main` into `hotfix` after a successful production deployment.

## Pull Request Validation (`pr-validate-and-deploy.yml`)

**Triggers:** Pull requests targeting `main` or `hotfix`, and merge-queue checks.

The workflow runs code formatting, code generation, TypeScript checks, linting, dependency audits, unit tests with coverage and SonarCloud, a production build, sharded Playwright end-to-end tests, and Storybook accessibility tests. It also checks new Istanbul coverage ignores. Knip runs with `continue-on-error`, so its findings do not fail the workflow.

This file defines which events run validation, but whether its checks are required for merging is controlled by GitHub branch-protection or ruleset settings.

## Smoke Tests

The dev smoke-test workflow (`smoke-tests.yml`) can be started manually and is scheduled every 15 minutes on weekdays from 07:00 through 20:45 UTC. The production workflow (`smoke-tests-prod.yml`) can also be started manually and is scheduled every four hours on weekdays from 04:00 to 20:00 UTC. Both run Playwright smoke tests and report results to Dynatrace. Alerting and notification behavior beyond those workflow reports is configured outside this repository.

## Dependency Updates (Renovate)

Renovate runs on its configured weekday schedule and can create update PRs without Dependency Dashboard approval; the dashboard is enabled for visibility. These safeguards were added after generating the pnpm lockfile for a large grouped npm update exceeded Renovate's available memory. Renovate is configured with a 1 GiB Node.js heap limit (`toolSettings.nodeMaxMemory`); this is not a runner or container memory limit. Open branches and PRs are capped at one at a time to keep update workload bounded while the memory issue is managed. Lock-file maintenance and pnpm package-manager updates are disabled, and npm artifact generation is skipped. React and Mantine dependencies remain grouped; other npm updates are kept individually bounded.

The `Update Renovate lockfile` workflow only runs for same-repository PRs authored by `renovate[bot]`, with a `renovate/` head branch and the `dependencies` label. It generates `pnpm-lock.yaml` with lifecycle scripts disabled. It requires the `SAML_GITHUB_TOKEN` secret, then commits the lockfile using GitHub's `createCommitOnBranch` API. The expected head SHA prevents committing if the Renovate branch changed during the run. The token is only exposed inside this guarded job; using it lets the commit trigger normal PR validation.

Minor and patch dependency updates receive the `auto-cab` label; major updates receive `dependencies`, `major`, and `breaking` labels and are not automatically given `auto-cab`.

## Deployment Environments

| Environment | URL                                                       |
| ----------- | --------------------------------------------------------- |
| Dev         | https://dev-merchandising-hub.search.marksandspencer.app/ |
| Production  | https://merchandising-hub.search.marksandspencer.app/     |

## Deployment Guidelines

### Normal Release

1. Open a pull request targeting `main` and wait for the required validation checks and reviews configured for the repository.
2. Merge the pull request. A push to `main` starts the release workflow automatically; it can also be run manually from GitHub Actions using the `main` branch.
3. Monitor the build, dev deployment, and dev smoke-test jobs. The workflow starts the automated CAB change request before production deployment.
4. Complete any approval required by the GitHub production environment. The workflow deploys to a pre-production slot, validates the deployed version, and swaps it into production.
5. Verify the production deployment and smoke-test results. After a successful release, the workflow syncs `main` into `hotfix`.

### Hotfix Release

1. Open a pull request targeting `hotfix` and review its validation results before merging.
2. Merging to `hotfix` starts the hotfix release workflow automatically. It can also be run manually from GitHub Actions using the `hotfix` branch.
3. Monitor the dev deployment and version validation, then the production pre-production slot deployment and swap. Complete any approvals required by the configured GitHub environments.
4. Ensure the hotfix is also submitted to `main` so the fix is retained in the primary development line. The release workflow syncs `main` into `hotfix`; it does not sync hotfix changes back into `main`.

Branch requirements, review counts, and environment approvals are controlled by GitHub settings and may vary by repository policy. Confirm the current requirements in GitHub before merging or dispatching a deployment.

## Related Automation

- [`automated-cab.yml`](../.github/workflows/automated-cab.yml) creates change requests for pull requests and merge-queue checks.
- The main release workflow starts a change request before production deployment, then completes it after a successful deployment or closes it as unsuccessful if deployment fails.
- Azure deployments use OIDC. Secret rotation, environment approval rules, branch protections, and Dynatrace alert policies are configured outside the workflow files and are not specified here.
