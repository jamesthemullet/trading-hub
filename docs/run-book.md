# Run book

## Overview

### Business overview

The application provides a UI for configuring results for Search Results Pages (SRPs) and Product Listing Pages (PLPs).

### Technical overview

This application is responsible for:

- Updating data provided by [search-service](https://github.com/DigitalInnovation/search-service)
- Previewing PLPs and SRPs

It is deployed in a Docker container to Azure.

#### Technologies

- [NextJS](https://nextjs.org/)
- [Typescript](https://www.typescriptlang.org/)

#### Dependencies

- [search-service](https://github.com/DigitalInnovation/search-service)
  failure of the search service will prevent use of the application, as apis are not cached

#### Deployment

The application is deployed via a [pipeline](../.github/workflows/pr-validate-and-deploy.yml) in Github actions.

## Service owners

| Name                 | Contact                                                                                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search and Sort Team | [Teams link](https://teams.microsoft.com/l/team/19%3attvAGMU-Xb9sEDdi38xCmCWHJ-zz32X0b-KrVGLt4GQ1%40thread.tacv2/conversations?groupId=696cefad-de9d-426d-b3d8-f535802cf24d&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543) |

## System overview

### Operating hours

Trading Hub is available for use 24 hours a day, it is supported 9am - 6pm Monday to Friday.

#### Azure

- [prod eun](https://portal.azure.com/#@mnscorp.onmicrosoft.com/resource/subscriptions/7f2ff24f-150e-4686-a521-76c5fe21e6e2/resourceGroups/prod-trading-hub-v1-eun-layer3-rg/providers/Microsoft.Web/sites/prod-trading-hub-v1-eun-layer3-app/appServices)

- [prod euw](https://portal.azure.com/#@mnscorp.onmicrosoft.com/resource/subscriptions/7f2ff24f-150e-4686-a521-76c5fe21e6e2/resourceGroups/prod-trading-hub-v1-euw-layer3-rg/providers/Microsoft.Web/sites/prod-trading-hub-v1-euw-layer3-app/appServices)

- [dev eun](https://portal.azure.com/#@mnscorp.onmicrosoft.com/resource/subscriptions/26521dda-e1c7-4d57-abae-abe1ab30b4fc/resourceGroups/dev-trading-hub-v1-eun-layer3-rg/providers/Microsoft.Web/sites/dev-trading-hub-v1-eun-layer3-app/appServices)

- [PIM access list](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/99c29c95-2983-4829-bbac-82ebb28288d3)

## Configuration

### Trading Hub Access

Anyone with an M&S email can log in to the trading hub. To access data users need to be on an approved list, this is stored in a env var in the [search-service](https://github.com/DigitalInnovation/search-service)

## Monitoring

### Logs - New relic

TODO

### Troubleshooting

In the event of an outage the most likely causes are:

- failed deployment
- api error from search service
- user is not authorised to use the trading hub

In case of users not being able to sign in after being signed out, it could be that the redirect url is missing from Azure.

This is the error that they would receive:

![alt text](no-redirect-error.png)

This can be corrected by adding it back to the Authentication page:

![alt text](authentication-page.png)

The redirect for prod is: https://merchandising-hub.search.marksandspencer.app/api/auth/callback/azure-ad
For dev: https://dev-merchandising-hub.search.marksandspencer.app/api/auth/callback/azure-ad
For localhost: http://localhost:3000/api/auth/callback/azure-ad

### Incident management

[Pagerduty Merchandising Hub Escalation](https://mands.pagerduty.com/escalation_policies#P4WPYI5)
