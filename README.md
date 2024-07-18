# Trading Hub

Merchandising UI for trading teams.

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![Continuous Deployment](https://github.com/DigitalInnovation/trading-hub/actions/workflows/release.yml/badge.svg?branch=main)

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

Playwright is set up for running e2e tests locally, to run it execute:

```bash
npm run test:e2e:ui
```

Click the green run button in the playwright UI, to run it without UI, execute:

```bash
npm run test:e2e
```

#### Running e2e tests with docker compose

First we need to disable autologin, it is useful for customers but e2e needs to mock the token, in your `.env`:

```bash
NEXT_PUBLIC_AUTO_LOGIN=false
E2E_TEST_USER_TOKEN="<ask one of the UI devs for a value>"
```

Build all images with:

`docker-compose build`

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

### Azure oAuth app registration permissions

Take a look at [azure-oauth-app-registration](docs/azure-oauth-app-registration.md)

### VS Code

An example settings.json file is in the .vscode folder

## Deployments

| Environment | URL                                                         |
| ----------- | ----------------------------------------------------------- |
| Dev         | https://dev-merchandising-hub.search.marksandspencer.app/   |
| Stage       | https://stage-merchandising-hub.search.marksandspencer.app/ |
| Prod        | https://merchandising-hub.search.marksandspencer.app/       |

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/grahamlicence"><img src="https://avatars.githubusercontent.com/u/1006709?v=4?s=100" width="100px;" alt="Graham Licence"/><br /><sub><b>Graham Licence</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=grahamlicence" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Niko-guus"><img src="https://avatars.githubusercontent.com/u/112879607?v=4?s=100" width="100px;" alt="Nikolay"/><br /><sub><b>Nikolay</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=Niko-guus" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.jameswinfield.co.uk/"><img src="https://avatars.githubusercontent.com/u/25197817?v=4?s=100" width="100px;" alt="James Winfield"/><br /><sub><b>James Winfield</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=jamesthemullet" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/krzysztof-kabat-mns"><img src="https://avatars.githubusercontent.com/u/90202184?v=4?s=100" width="100px;" alt="Krzysztof Kabat"/><br /><sub><b>Krzysztof Kabat</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=krzysztof-kabat-mns" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rob-h-mns"><img src="https://avatars.githubusercontent.com/u/117646514?v=4?s=100" width="100px;" alt="Rob Haley"/><br /><sub><b>Rob Haley</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=rob-h-mns" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iyildiz-mns"><img src="https://avatars.githubusercontent.com/u/161332644?v=4?s=100" width="100px;" alt="Idris Yildiz"/><br /><sub><b>Idris Yildiz</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=iyildiz-mns" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nicwaters823"><img src="https://avatars.githubusercontent.com/u/143523074?v=4?s=100" width="100px;" alt="Nicola Waters"/><br /><sub><b>Nicola Waters</b></sub></a><br /><a href="https://github.com/krzysztof-kabat-mns/trading-hub/commits?author=nicwaters823" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
