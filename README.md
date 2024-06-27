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

Trading Hub is a NextJS app. You will need [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating) and [node](https://nodejs.org/en) installed locally to get started

```bash
nvm install

nvm use

npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running with docker compose

You will need docker installed on your laptop. Unfortunately M&S doesn't provide a license, you can either buy your own or use Podman or Rancher which are free alternatives. Docker however being on the market the longest has best developer experience.

#### Building image

In terminal cd to root directory and execute:

`docker-compose build merchandising-hub`

#### Running

In terminal cd to root directory and execute:

`docker-compose up -d  merchandising-hub`

`-d` runs the container in the background

#### Cleaning

When you are done, execute:

`docker-compose down`

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

### E2E tests

#### Running e2e tests locally

Playwright is set up for running e2e tests locally, to set up:

Replace the following env variables with your own cookie values

```
"E2E_SESSION_TOKEN0": "",
"E2E_SESSION_TOKEN1": "",
"E2E_CALLBACK_URL": "",
"E2E_CSRF_TOKEN": ""
```

You can find these in your browser cookies

![Image showing cookies](docs/img/cookies.png 'App Cookies')

To run the tests use

```
npm run test:e2e
```

Click the green run button in the playwright UI

#### Running e2e tests with docker compose

To run tests with all logs from all images just execute

`docker-compose up`

You can execute

`docker-compose up merchandising-hub-e2e`

If you want to see output of just e2e container

### Code formatting

Prettier is used to format files, this can be set up in your IDE or by running `npm run format` before committing.

### Dependencies updates

Renovate is set up for the repo, all contributors can help with merging updates. Checks are scheduled outside of working hours.

### Snyk SAST

Snyk is configured trough external integration with github repository. To access the Dashboard navigate to: [app.snyk.io](https://app.snyk.io/org/a2654-trading-hub/project/1b93336f-39d2-42a0-ada4-d9611e54839c)

Trading-Hub needs to follow standard defined here: [technology-standards/security-tooling](https://github.com/DigitalInnovation/technology-standards/blob/main/docs/drafts/security-tooling.md)

Notes:

- Snyk is configured with scanning for dependencies and not code scanning due to the way license is purchased by M&S.
- Snyk is configured under yAccount owner.

#### Adding new Members

Please follow this doc: [add-members-to-the-existing-organisations](https://devopssec.engineering.mnscorp.net/Products/Snyk-Open-Source/how-to-get-access/#add-members-to-the-existing-organisations)

#### Snyk Support

Please follow this doc: [Support](https://devopssec.engineering.mnscorp.net/Support/)

### VS Code

An example settings.json file is in the .vscode folder

## Deployments

| Environment | URL                                                          |
| ----------- | ------------------------------------------------------------ |
| Dev         | https://dev-trading-hub-v1-eun-layer3-app.azurewebsites.net/ |
