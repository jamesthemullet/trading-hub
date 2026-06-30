## Background

We are currently unable to release updates to Merch Hub because we have no access to GitHub Actions.

To regain access to GitHub Actions, we need to follow the steps outlined in [Securing Service Principals](https://github.com/DigitalInnovation/domains/blob/main/docs/how-to-guides/securing-service-principals.md), which includes both rotating secrets and updating authentication on pipelines to use OIDC. This is a process that we have been asked to follow.

The merchandising hub (aka trading hub) relies on the Azure secret for user log-in.

## Incident Trigger

I (James Winfield) was following the steps to confirm that we had federated credentials for the trading-hub repo (we do).  
Then the request under [Securing Service Principals](https://github.com/DigitalInnovation/domains/blob/main/docs/how-to-guides/securing-service-principals.md#Deletion-Revocation) states:

> “If you are unable to use OIDC and require a client secret for authentication, you should reset the secret from the app registration and ensure that any existing secrets are deleted from app registration and service principal to maintain security.”

This process I followed at around 10:30am, and then updated the secrets in GitHub… forgetting that we need to also update the secret via the pipelines for users to be able to log in, of which we do not have access.

---

## Timeline (Detection)

- **10:56**  
  Lucy Stanhope (Merchandising Team) raised an issue with logging in:  
  _Stanhope, Lucy: Elastic log in error (Important)_  
  Posted in `[D&T] Personalisation / [Squad] Merchandising Hub - Feedback; New Updates` on 17 June 2025 10:56.

- **11:23**  
  JW noticed the request in Teams and started to investigate.  
  It became apparent that my refreshing of the secret was to blame, and the solution was to process a release with an update to the `ci` folder in the trading-hub repo.  
  This solution would have taken circa 15 minutes in normal times.  
  Alas, we had no access to GitHub Actions.

- **11:54**  
  Requested temporary access to GitHub Actions for trading-hub:  
  [Pull Request](https://github.com/DigitalInnovation/github-actions-access-list/pull/235/commits/799694defaeefdbc2ec23e4449f5bc807ba6dfdf).

- **12:08**  
  PM’d Stuart Brown to try to expedite approval.

- **13:08**  
  Approved by Stuart Brown and subsequently merged.

- **13:50**  
  Incident raised, Prihabrata Sahu informed.

- **14:08**  
  Initial attempt at fix failed on the deploy to dev process, on the Login via Azure CLI step, due to the hotfix pipeline using old credentials.  
  JW fixed this both by replacing the “creds” with the OIDC set-up on dev, and also added required write permissions:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/commit/a3bd8179d3625af63697edc82ea099f0fb8ed2cf).

- **14:50**  
  The build failed again – I had to replace “creds” in another step:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1340/commits/21186ad3a5827cf22335d78dae448f1418090e41).

- **15:04**  
  The build failed again, due to:

  > “AttributeError: Can't get attribute 'NormalizedResponse' on <module 'msal.throttled_http_client' from '/usr/local/lib/python3.10/site-packages/msal/throttled_http_client.py'>”  
  > [GitHub Actions Run](https://github.com/DigitalInnovation/trading-hub/actions/runs/15709363681/job/44263431097).

I tried various solutions:

- Removing secrets from the failing step:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1341/commits/7c6e2598aec3c828ed4bc8b5b37360c3c469a61f).
- Reverted the above and upgraded `azcliversion` to 2.55.0:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1343/commits/b09ba8793dafc13b936aa0e89ef192e6a53bc76e).
- Removed the step entirely, as I wasn’t sure whether it was necessary:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1344/commits/765098ff6f0a9d10f16500767459c77f76ce25aa).

- **15:53**  
  The deploy to dev step worked, though I remained unsure about the previous solution of removing the failing step – however, dev was still working.

### Incident Timeline

- **16:12** Tried to deploy to prod, but it failed due to:  
  _“Failed to fetch federated token from GitHub. Please make sure to give write permissions to id-token in the workflow.”_  
  [GitHub Actions Run](https://github.com/DigitalInnovation/trading-hub/actions/runs/15710994886/job/44269323490)  
  Added permission to prod:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1346/commits/c46edb648221e1cae4bff50697e44e0bba1f173f)

- **16:21** Deploy to prod failed:  
  _“No matching federated identity record found for presented assertion subject 'repo:DigitalInnovation/trading-hub:environment:prodeun'. Check your federated identity credential Subject, Audience and Issuer against the presented assertion.”_  
  Realised wrong secret keys were used on prod and fixed this:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1347/commits/ca8c174a85ba734b7148301a36dd2314082dcf16)

- **16:47** Failed with the same error as before:  
  [GitHub Actions Run](https://github.com/DigitalInnovation/trading-hub/actions/runs/15711573076/job/44272032654)

- **17:00** Discussions were had with Toyin, Holly, and Nic, and a back-up plan was made for urgent merchandising requirements.

- **17:08** Decided to add the env step that was removed earlier, resulting in failure with:  
  _“AttributeError: Can't get attribute 'NormalizedResponse' on <module 'msal.throttled_http_client' from '/usr/local/lib/python3.11/site-packages/msal/throttled_http_client.py'>”_

- **17:21** Took a long walk due to skipping lunch.  
  Upon return, discovered that adding `AZURE_CORE_USE_MSAL_HTTP_CACHE: false` as an env variable in the pipeline resolved the _“'NormalizedResponse'”_ issue.

- **18:50** Deploy to Azure Web App (dev) succeeded.  
  Deploy to Azure Web App (prod) failed as before:  
  [GitHub Actions Run](https://github.com/DigitalInnovation/trading-hub/actions/runs/15714392553/job/44280787102)  
  Realised wrong secrets were still being used in prod:  
  [Commit](https://github.com/DigitalInnovation/trading-hub/pull/1355/files)

- **19:05** Deploy to prod failed again with:  
  _“AttributeError: Can't get attribute 'NormalizedResponse' on <module 'msal.throttled_http_client' from '/usr/local/lib/python3.11/site-packages/msal/throttled_http_client.py'>”_  
  [GitHub Actions Run](https://github.com/DigitalInnovation/trading-hub/actions/runs/15714660872/job/44281667518)  
  Made two more commits to add `AZURE_CORE_USE_MSAL_HTTP_CACHE: false` as an env variable in the prod pipeline:  
  [Pull Request 1356](https://github.com/DigitalInnovation/trading-hub/pull/1356)  
  [Pull Request 1357](https://github.com/DigitalInnovation/trading-hub/pull/1357)

- **19:29** Deploy to Azure Web App (prod) succeeded.

- **19:53** Advised the team that the merchandising hub was working again.

---

### Things to Note

- The Azure login secret expires every 6 months, and its expiration was a known risk. Without access to Azure, the exact expiration date was unknown.
- Normally, updating this secret and releasing to prod would take 15 minutes.
- These steps were necessary to refresh the secret and update pipelines, improving security posture and enabling continued app improvements.
- A planned outage would have been preferable.

---

### Track Smoke Test Results

- Smoke tests (15-minute intervals) failed twice in a row but did not trigger alerts due to the pipeline not running.

---

### Root Cause

- Rotating secrets in Azure.
- How the secret is consumed by the app.

---

### Status

- **Resolved**

---

### Mitigation / Fix

- Released a change in the CI folder.
- Updated pipelines to use OIDC.
- Added cache parameters and write access.

---

### Learnings / Suggestions / Next Steps

- Rotate secrets when pipelines are inactive.
- Always prioritize development first.
- Schedule maintenance windows for out-of-hours work.
- Implement health checks.
