# Azure AD Client Secret Rotation Guide

## Prerequisites

- Azure CLI installed and configured on your machine
- Owner permissions on the app registration
- Access to update secrets in GitHub

1. **Login to Azure CLI**

   ```bash
   az login
   ```

   This will open a browser window for authentication. Complete the login process.

2. **Set the correct subscription**

   Select the subscription from the list that appears in the CLI for "MandS - V2 - Non Production - Customer & Loyalty - tradehub" if rotating dev secret, "MandS - V2 - Production - Customer & Loyalty - tradehub" if amending prod secret

3. **Retrieve the Client ID from the existing app registration**

   For dev:

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

   For prod:

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-Production-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

4. **List Current Secrets**

   Using the previously sourced AppId, identify which secrets are currently active:

   ```bash
   az ad app credential list --id <AppId>
   ```

   Example output:

   ```
   DisplayName                    KeyId                                 EndDate
   -----------------------------  ------------------------------------  ----------------------------
   john.doe local secret          abc123-def4-5678-90ab-cdef12345678   2025-12-31T23:59:59.000000Z
   production secret              xyz789-abc1-2345-67de-f890abcd1234   2025-06-30T23:59:59.000000Z
   ```

5. **Create New Secret (keeping old secret active)**

   Create a new secret using the `--append` flag to keep existing secrets active:

   ```bash
   az ad app credential reset --id <AppId> --append --display-name "Enter display name here"
   ```

   **Important:** The `--append` flag ensures the old secret remains valid!

6. **Save New Secret**

   The command will output JSON containing the new secret:

   ```json
   {
     "appId": "abc-app-id",
     "password": "abc123~XYZ789-NewSecretValue",
     "tenant": "..."
   }
   ```

   Copy the `password` value.

7. **Deploy New Secret**

   If updating dev, update the secret in your local .env file

8. **Update GitHub Secret**
   1. Navigate to repository Settings → Secrets and variables → Actions
   2. Update `AZURE_AD_CLIENT_SECRET` with the new value
   3. Create a new branch locally
   4. Update something in the ci folder (just adding an extra space will suffice)
   5. Commit, push and merge your PR
   6. Trigger a new deployment

   **Important:** If you do not make a change in the ci folder, the updated `AZURE_AD_CLIENT_SECRET` secret will not be picked up

9. **Verify New Secret Works**

   Test authentication with the new secret in the environment you updated.

   Monitor logs and production smoke tests for any authentication errors.

10. **Delete Old Secret**

    Once confirmed the new secret works everywhere, delete the old one:

    ```bash
    az ad app credential list --id <APP_ID> --output table


    az ad app credential delete \
    --id <APP_ID> \
    --key-id <OLD_KEY_ID>
    ```

11. **Verify Old Secret is Removed**

    ```bash
    az ad app credential list --id <APP_ID> --output table
    ```

    You should only see the new secret in the list.

## Best Practices

1. **Rotate secrets every 6-12 months** (before they expire)
2. **Use descriptive names** with date and creator info
3. **Always use `--append`** for zero-downtime rotation
4. **Test in non-production first**
5. **Ensure the team are aware before rotating secrets** in team channels

## PROD smoke-test yaccount password reset

Use these steps when production Playwright smoke tests fail due to authentication, or when `PROD_TEST_USER` credentials must be rotated.

1. **Identify the test account**

   Go to the [Access Management](https://mnscorp-rod-myit.onbmc.com/dwp/app/#/itemprofile/403)

2. **Reset password in Azure/Entra**

   Click "Request now" and then fill the form in, and submit. After a while, someone will contact you with a password in the Azure Key Vault, which you can then copy and paste into GitHub secrets.

3. **Update GitHub secret**

   Update `PROD_TEST_USER_PASSWORD` in repository Settings → Secrets and variables → Actions.

4. **Validate end-to-end smoke tests**

   Trigger the [production smoke workflow](../.github/workflows/smoke-tests-prod.yml) using workflow dispatch and verify login-dependent tests pass.
