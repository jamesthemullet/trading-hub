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

There are no precommit hooks, PR checks run against tests, type checking and code formatting.

Reviews are not dismissed on new commits, please rerequest a review if subsequent commits make significant code changes.

### API contract

Our agreed API with the backend team is stored in this repo and used for all requests.

You can check or generate the code by running `npm run codegen` and view our [api.yml](src/libs/api/api.yml)

### Tests

```bash
npm run test
```

Tests require 100% coverage for all files, watch mode can be enabled by running `npm run test -- --watch`

### Code formatting

Prettier is used to format files, this can be set up in your IDE or by running `npm run format` before committing.

### Dependencies updates

Renovate is set up for the repo, all contributors can help with merging updates. Checks are scheduled outside of working hours.

## Deployments

| Environment | URL                                                          |
| ----------- | ------------------------------------------------------------ |
| Dev         | https://dev-trading-hub-v1-eun-layer3-app.azurewebsites.net/ |
