# Working locally with the auth app

## Table of contents

1. [App Authentication registration for local development](#reg)
2. [Running the Auth application ](#running)

## App Authentication registration for local development (if you have access to Azure Web Portal)

1. Navigate to [azure portal](https://portal.azure.com/)
2. Search for `sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub-TF-Managed`
3. Click on `Overview`, copy the value from `Application (client) ID` paste it to `.env` file as `AZURE_AD_CLIENT_ID`, copy the `Directory (tenant) ID` and paste it to `.env` file as `AZURE_AD_TENANT_ID`
4. Verify whether you are an owner by going to `Manage -> Owners`. If you are not an owner, submit an Access Management Request via [Helix](https://mnscorp-rod-myit.onbmc.com/dwp/app/#/itemprofile/301). If you are an owner, continue.
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

2. **Find the user and confirm their object ID**

   ```bash
   az ad user list --filter "startswith(surname, 'insert-surname')" --query "[].{displayName:displayName, userPrincipalName:userPrincipalName, objectId:id}" --output table
   ```

   This lists all users whose surname starts with the supplied value. Confirm the intended user by their name and user principal name, then use that row's `objectId` in the next step.

3. **Add the user as an owner**

   ```bash
   az ad app owner add --id <CLIENT_ID_FROM_STEP_1> --owner-object-id <USER_OBJECT_ID_FROM_STEP_2>
   ```

4. **Verify the user was added successfully**

   ```bash
   az ad app owner list --id <CLIENT_ID_FROM_PREVIOUS_STEP> --query "[].{name:displayName, userPrincipalName:userPrincipalName, objectId:id}" --output table
   ```

   The new user should appear in this application-owners list. In the Azure portal, the **Type** column (for example, `Member`) describes the user's directory account type; it does not mean the user was added as an app member instead of an owner. Confirm the user appears under the app registration's **Owners** page.
