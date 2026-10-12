# Azure AD Client Secret Rotation Guide

## Prerequisites

- Azure CLI installed and configured on your machine
- Permission to manage credentials on the correct app registration
- Access to update the applicable GitHub Actions secret and run the release workflow

The release workflow references `_AZURE_AD_CLIENT_ID` and `_AZURE_AD_CLIENT_SECRET` in both deployment jobs, but the jobs target separate GitHub environments (`deveun` for dev and `prodeun` for production). GitHub may provide environment-scoped values with the same secret names, or repository-level values; this repository does not show how those secrets are configured. Check the GitHub environment settings and confirm the corresponding app registration with its owners before rotating. Changing the local `.env` value does not update GitHub or a deployed environment.

1. **Login to Azure CLI**

   ```bash
   az login
   ```

   This will open a browser window for authentication. Complete the login process.

2. **Select the subscription for the app registration**

   List available subscriptions:

   ```bash
   az account list --output table
   ```

   Select the subscription that contains the app registration you intend to update:

   - Non-production/dev: `MandS - V2 - Non Production - Customer & Loyalty - tradehub`
   - Production: `MandS - V2 - Production - Customer & Loyalty - tradehub`

   Set the appropriate subscription in the CLI:

   ```bash
   az account set --subscription "MandS - V2 - Non Production - Customer & Loyalty - tradehub"
   ```

   Replace the subscription name with the production subscription when rotating the production app registration. Confirm the app registration and corresponding GitHub environment secret with its owners before proceeding.

3. **Find and confirm the app registration**

   List matching non-production registrations:

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

   List matching production registrations:

   ```bash
   az ad app list --filter "startswith(displayName, 'sp-MandS-V2-Production-Customer&Loyalty-tradehub')" --query "[].{displayName:displayName, appId:appId}" --output table
   ```

   Confirm the correct registration and `appId` with its owners. Both deployment jobs reference the same Actions secret names, but their environment-scoped values may differ. Check the `deveun` or `prodeun` environment settings in GitHub to identify which credential value is used by the deployment you are rotating.

4. **Record the current credential IDs**

   Using the confirmed app ID, record the `keyId` for the credential that will be replaced. Do not copy or share any credential values.

   ```bash
   az ad app credential list --id <APP_ID> --query "[].{displayName:displayName,keyId:keyId,endDateTime:endDateTime}" --output table
   ```

5. **Create a new secret without removing the old one**

   Use `--append` so the existing credential remains available during the transition:

   ```bash
   az ad app credential reset --id <APP_ID> --append --display-name "trading-hub rotation YYYY-MM"
   ```

   The command returns the new secret value once. Store it securely; do not put it in source control, logs, or chat.

6. **Update the GitHub Actions secret**

   The release workflow reads the Actions secret named `_AZURE_AD_CLIENT_SECRET` and writes its value to the app setting named `AZURE_AD_CLIENT_SECRET`. These are different names for the workflow input and the runtime setting.

   The deployment jobs use the GitHub environments `deveun` and `prodeun`. Check **Settings → Environments** to see whether the applicable value is configured as an environment secret. If it is, update the secret in the environment you are rotating. If no environment-level secret overrides it, update the repository secret under **Settings → Secrets and variables → Actions**. Update both scopes/environments only if both should receive the new value.

   If you also need the new credential for local development, update `AZURE_AD_CLIENT_SECRET` in your local `.env` file separately. Do not commit `.env`.

7. **Deploy and verify**

   Changing a GitHub secret does not itself start a workflow. Run the **Release** workflow from GitHub Actions using the `main` branch, or wait for the next push to `main`. The release deploys to both dev and production; each job receives the value resolved for its GitHub environment (or the repository-level value if there is no environment override). Follow the workflow's deployment approvals and checks, then verify sign-in in every environment whose secret you changed. Check the production smoke-test run when production credentials are involved.

8. **Remove the old credential after verification**

   Once the new secret has been verified in every environment that uses it, delete only the old credential by its recorded key ID:

   ```bash
   az ad app credential delete --id <APP_ID> --key-id <OLD_KEY_ID>
   ```

   Confirm that the old key ID is absent. Other credentials may still exist, so do not expect the list to contain only the newly created credential:

   ```bash
   az ad app credential list --id <APP_ID> --query "[].{displayName:displayName,keyId:keyId,endDateTime:endDateTime}" --output table
   ```

## Best Practices

1. **Rotate secrets before expiry** and follow the organisation's rotation policy.
2. **Use descriptive names** with date and creator info
3. **Use `--append`** to keep the existing credential active while deploying and verifying its replacement.
4. **Test in non-production first**
5. **Ensure the team are aware before rotating secrets** in team channels

## Prod Smoke-Test User Password Reset

Use these steps when production Playwright smoke tests fail due to authentication, or when `PROD_TEST_USER` credentials must be rotated.

1. **Identify the test account**

   Go to the [Access Management](https://mnscorp-rod-myit.onbmc.com/dwp/app/#/itemprofile/404)

2. **Reset password in Azure/Entra**

   Click "Request now" and then fill the form in, and submit. Use "Extending a privileged account" as the request type. Note that you will need line manager approval.

   After a while, someone will contact you with a password in the Azure Key Vault, which you can then copy and paste into GitHub secrets.

3. **Update GitHub secret**

   Update `PROD_TEST_USER_PASSWORD` in repository Settings → Secrets and variables → Actions.

4. **Validate end-to-end smoke tests**

   Trigger the [production smoke workflow](../.github/workflows/smoke-tests-prod.yml) using workflow dispatch and verify login-dependent tests pass.
