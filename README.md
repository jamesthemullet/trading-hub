# Trading Hub

Merchandising UI for trading teams.

## Getting Started

### App Authentication registration for local development

Please follow this [doc](./docs/auth-local-dev.md) to set up auth.

An example .env file has been provided.

```bash
cp .env.example .env
```

### Running locally

Trading Hub is a NextJS app.

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Before you can contribute to this repo, you must be able to sign your commits so they can be verified as a trusted source. See [Onyx docs](https://onyx.engineering.mnscorp.net/contributing/signing-commits.html) for an example of how to set this up.

### Pull requests

There are no precommit hooks, PR checks run against tests, code formatting and dependencies updates.

Reviews are not dismissed on new commits, please rerequest a review if subsequent commits make significant code changes.

### Tests

```bash
npm run test
```

Tests require 100% coverage for all files, watch mode can be enabled by running `npm run test -- --watch`

### Code formatting

Prettier is used to format files, this can be set up in your IDE or by running `npm run format` before committing.

### Dependencies updates

Dependabot is set up for the repo, however to keep our dependencies up to date `npm outdated` is run as part of PR checks so all contributors can help with updates.

## Deployments

| Environment | URL                                                          |
| ----------- | ------------------------------------------------------------ |
| Dev         | https://dev-trading-hub-v1-eun-layer3-app.azurewebsites.net/ |
