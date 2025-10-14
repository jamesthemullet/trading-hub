# Working locally with the auth app

## Table of contents

1. [App Authentication registration for local development](#reg)
2. [Running the Auth application ](#running)

## App Authentication registration for local development (if you have access to Azure Web Portal)

1. Navigate to [azure portal](https://portal.azure.com/)
2. Search for `sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub-TF-Managed`
3. Click on `Overview`, copy the value from `Application (client) ID` paste it to `.env` file as `AZURE_AD_CLIENT_ID`, copy the `Directory (tenant) ID` and paste it to `.env` file as `AZURE_AD_TENANT_ID`
4. Verify if you are owner by going to `Manage->Owners`, if you are not an owner, please contact any of the owners to generate a new password for you by following this guide or ask them to give you ownership if you are authorized. If you are owner, please continue.
5. Click on `Manage->Certificates & secrets`
6. Click on `Client Secrets`
7. Click on new `New client secret`
8. Enter description like `<username> local secret` and select expiry that suits your purpose.
9. Click `Add`
10. Copy the newly generated password - be careful to not refresh page as the password is only visible temporarily - to your `.env` file as `AZURE_AD_CLIENT_SECRET`.
11. Paste the password in you .env file as AZURE_AD_CLIENT_SECRET
12. You can now run trading-hub and try to authenticate yourself using SSO in localhost.

## App Authentication registration for local development (if you have access to Azure CLI)

### Prerequisites

- Azure CLI installed and configured on your machine
- Access to the Azure subscription and appropriate permissions to create app registrations

### Steps

1. **Login to Azure CLI**

   ```bash
   az login
   ```

   This will open a browser window for authentication. Complete the login process.

2. **Set the correct subscription**

   Select the subscription from the list that appears in the CLI for "MandS - V2 - Production - Customer & Loyalty - tradehub"

3. **Retrieve The Tenant ID**

   ```bash
   az account show --query tenantId --output tsv
   ```

   Copy the returned value and paste it to `.env` file as `AZURE_AD_TENANT_ID`

4. **Retrieve the Client ID from the existing app registration**

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

   Copy the `appId` value and paste it to `.env` file as `AZURE_AD_CLIENT_ID`

5. **Check if you are an owner of the app registration**

   ```bash
   # List all owners
   az ad app owner list --id <CLIENT_ID_FROM_PREVIOUS_STEP> --query "[].userPrincipalName" --output table
   ```

   If you are not listed as an owner, contact one of the existing owners to either:
   - Generate a new client secret for you
   - Add you as an owner if you are authorized

6. **Add Client Secret**

   ```bash
   az ad app credential create \
   --id <APP_ID> \
   --display-name "MyNewSecret" \
   ```

7. **Add to .env**

   Copy the newly generated password to your `.env` file as `AZURE_AD_CLIENT_SECRET`.

8. **Log in**

   You can now run trading-hub and try to authenticate yourself using SSO in localhost.

## Adding A New Owner Via the Azure CLI

### Prerequisites

- You must be an existing owner of the app registration
- You need the surname of the person you want to add as an owner

### Steps

1. **Retrieve the Client ID from the existing app registration**

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

2. **Get the user's object ID**

   ```bash
   az ad user list --filter "startswith(surname, 'insert-surname')" --query "[0]" --output json
   ```

3. **Add the user as an owner**

   ```bash
   az ad app owner add --id <CLIENT_ID_FROM_STEP_1> --owner-object-id <USER_OBJECT_ID_FROM_STEP_2>
   ```

4. **Verify the user was added successfully**

   ```bash
   az ad app owner list --id <CLIENT_ID_FROM_PREVIOUS_STEP> --query "[].userPrincipalName" --output table
   ```

   The new user should now appear in the list of owners.

## App Authentication registration for local development with custom app registration.

Note. Use this method only if you need to debug roles or any settings that would otherwise affect development of other team members.

1. Navigate to [azure portal](https://portal.azure.com/)
2. Click on "App registrations"
   ![Image showing App Registrations](img/app-registrations.png 'App Registrations')
3. Click on "New registration"
   ![Image showing New Registration](img/new-registration.png 'App Registrations')
4. Fill in the form, use name with following format `<your-name>-trading-hub` and make sure you use "Web" redirect uri with "http://localhost:3000/api/auth/callback/azure-ad" callback url for your local development
   ![Image showing app registration form](img/register-an-application.png 'App Registrations')
5. Click "Register"
6. On the next screen you will find your AZURE_AD_CLIENT_ID and AZURE_AD_TENANT_ID later you will put them in your .env file
   ![Image showing client id and tenant id](img/ids.png 'App Registrations')
7. Click on "Add a certificate or secret"
8. Click on "New client secret"
   ![Image new client secret button](img/new-client-secret.png 'App Registrations')
9. Fill in Description `used for local development by <your-name>` and Expiry - select any value that is appropriate for your use case.
   ![Image showing add secret form](img/add-client-secret.png 'App Registrations')
10. Click add.
11. Copy the secret value this will be used as AZURE_AD_CLIENT_SECRET in your .env
12. Add AZURE_AD_CLIENT_ID AZURE_AD_TENANT_ID AZURE_AD_CLIENT_SECRET to your .env located at the root of your onyx repo
13. You can now run trading-hub and try to authenticate yourself using SSO in localhost.

## Environment variables

Aside from the standard ones needed to run trading hub, you will need:

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
