# Working locally with the auth app

# Table of contents

1. [App Authentication registration for local development](#reg)
2. [Running the Auth application ](#running)

# App Authentication registration for local development <a name="reg"></a>

1. Navigate to [azure portal](https://portal.azure.com/)
1. Click on "App registrations"
   ![Image showing App Registrations](img/app-registrations.png 'App Registrations')
1. Click on "New registration"
   ![Image showing New Registration](img/new-registration.png 'App Registrations')
1. Fill in the form, use name with following format `<your-name>-trading-hub` and make sure you use "Web" redirect uri with "http://localhost:3000/api/auth/callback/azure-ad" callback url for your local development
   ![Image showing app registration form](img/register-an-application.png 'App Registrations')
1. Click "Register"
1. On the next screen you will find your AZURE_AD_CLIENT_ID and AZURE_AD_TENANT_ID later you will put them in your .env file
   ![Image showing client id and tenant id](img/ids.png 'App Registrations')
1. Click on "Add a certificate or secret"
1. Click on "New client secret"
   ![Image new client secret button](img/new-client-secret.png 'App Registrations')
1. Fill in Description `used for local development by <your-name>` and Expiry - select any value that is appropriate for your use case.
   ![Image showing add secret form](img/add-client-secret.png 'App Registrations')
1. Click add.
1. Copy the secret value this will be used as AZURE_AD_CLIENT_SECRET in your .env
1. Add AZURE_AD_CLIENT_ID AZURE_AD_TENANT_ID AZURE_AD_CLIENT_SECRET to your .env located at the root of your onyx repo
   ![Image showing .env setup in vscode](img/env.png 'App Registrations')
1. You can now run trading-hub and try to authenticate yourself using SSO in localhost.

# Running the Auth application <a name="running"></a>

see [How to run your app with onyx auth backend](https://onyx.engineering.mnscorp.net/how-to/auth/how-to-run.html)

The easiest way is to proxy to the remote Onyx auth.

## Environment variables

Aside from the standard ones needed to run Onyx, you will need:

```
NEXTAUTH_SECRET=anystring
MERCHANDISING_API_BASEURL=https://dev-search-service-v1-eun-layer3-app.azurewebsites.net/
DEV_PROXY_APP_BASE_URLS="onyx-sandbox=http://localhost:4200"
PROXY_TARGET_URL=https://dev-onyx-auth.azurewebsites.net

NEXTAUTH_URL=http://localhost:4200/api/auth

AZURE_AD_CLIENT_ID=(see above)
AZURE_AD_TENANT_ID=(see above)
AZURE_AD_CLIENT_SECRET=(see above)
```
