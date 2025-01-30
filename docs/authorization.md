# Authorization

## Historical Context

Trading Hub is currently using a hardcoded list of emails through a logic implemented in the backend to control access. Frontend does no control of access whatsoever.

If new user wants to get access to Trading Hub a backend development team needs to add their email to list of approved emails. This requires a full release of backend app and can't be performed during code freeze.

Users not on that hardcoded list can log in and get session but they will not see any data because GET,PUT,POST,DELETE request to the backend will be rejected and return 403 HTTP Code.

For more details on authentication please refer to [authentication doc](./authentication.md)

## Migration to new method of authorization

The goal of the migration is to make sure users do not notice any problems with app access while at the same time malicious actors do not gain access to the protected resources.

The new method of authorization will be based on roles. Roles are simply an array of strings that define access to resource. They are stored in the access token, like so:

```Typescript
const accessToken = {
  // other stuff
  roles: ['Cat.W', 'Glob.R']
}
```

Access token is signed so backend will check that token is valid before interpreting the roles. That is not enough however since anyone can create new app registration and have signed token, we need to also make sure that client id of the token matches the one we have in prod.

At the beginning we are planning to add just one role, to avoid future changes we will call it `Glob.W`. This role will give `read` and `write` access to the whole app.

Once we confirm successful integration we will restrict this role to only allow global access, while introducing more granular roles for category and search ranking.

Adding roles to token will have no visible effect to users, it can however trigger some effects during the migration therefore the whole migration will be done behind feature flag. Once new authorization is implemented in the backend and all required people are assigned the `Glob.W` write roles, we will remove the flag and at this point nothing again will be visibly different except for the fact that there will be two systems of authorization running at the same time.

Once we make sure new system works correctly we will remove the previous system from the backend as new method of authorization will be sufficient in keeping app safe.

After all above is done we can work on restricting people access, first group of people to restrict access will be developers, all developes should get `read` access in prod. There must be a process for getting temporary(up to 8h) access on demand provided an approval is made by authorized personnel. This is required as there are exceptional situations where developer needs to test write access on prod to verify if bug still exists.

## Naming

Roles naming should follow same pattern, it needs to be relatively short as space in token is costly and subject to limits. Some browsers allow only 8Kb of space for header in request and access token is going to travel there between frontend and backend.

This is why Trading Hub will use simple scheme with 3-4 letters, first one uppercase followed by `.` and either `R` or `W` indicating `read` or `write` access.

## Roles

Trading Hub is using roles section of token to declare roles.

There are 3 modes of access to resource:

- `no access`, for everyone who don't have any roles assigned. From a token perspective it means roles field is either `undefined` or empty - `[]`
- `read access`\*, it allows to see the data but not change it. For example `[Glob.R]`
- `write access`, this role allows users to change data.

\*Note: in first release the `read access` is not going to be supported, as it requires more work - each component needs to support read only state which is not the case currently.

There are following sections of the page protected independently:

- Category Ranking\*
- Search Ranking\*
- Global Ranking

\*Note: in first release the whole website will be protected by 1 role. This is to steadily release access to website and not complicate things.

In total there are following roles:

- `Cat.R` for read access to category ranking
- `Cat.W` for read and write access to category ranking
- `Search.R` for read access to search ranking
- `Search.W` for read and write access to search ranking
- `Glob.R` for read access to global ranking
- `Glob.W` for read and write access to global ranking

Roles define access with one caveat, `write` role contains `read` role. This is to simplify role assignment and there is no point with giving someone `write` access without `read` access.

Write role from the REST perspective means users can perform all HTTP requests including but not limited to PUT,POST,DELETE.

Read role from REST perspective means users can perform only GET request.

## Frontend support of roles

Website is operating in untrusted regime by default, that means if the user wants he can bypass all checks. Checks however will be done in the frontend to avoid network calls to backend in the default scenario.

Frontend will copy roles from access token and it will make the copy accessible from session object under:

```Typescript
session.data.roles
```

Developers can use this directly by simply checking if a roles is contained in the array like:

```Typescript
  if(!session.data?.roles.includes('Glob.R')) {
    return;
  }
```

It is easier however to use the provided `useAccess` hook:

```Typescript
  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: SEARCH_READ_ROLE,
    writeRole: SEARCH_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={SEARCH_READ_ROLE} />;
  }
```

## Backend support of roles

Backend needs to verify that the request method is satisfied by a given user role, but they also needs to make sure that the token client id is correct.

Since many developers are using their own app registration for authentication we either need to disable client id verification or make a list of all approved developer owned app registrations.

Optionally backend can also verify if token method of authentication is using 2FA, if we want to force users to use safe method of authentication.

## Local development with roles

Frontend developers can modify their app registration with roles to be able to test any access they want. This is also going to be required for future workflows as by default frontend will require role based access once feature flag is off.

To modify your own app registration please follow those steps:

1. Log in to azure.
2. Locate your app registration, typically it starts with `<your-name>-trading-hub`
3. Navigate to roles section, in Azure it is called `App roles`
4. It will contain no roles if you are adding them for the first time, but there might be already some roles there if you have been following this guide before.
   ![App Roles](img/authorization-roles-azure.png 'App Roles')
5. The list of roles currently supported can be found [here](./../.github/workflows/pr-infrastructure.yml) look for '"App does not exist, creating..."' section. Alternatively you can look up kk-trading-hub app registration and copy its setup - though that is not guaranteed to be up to date.
6. For each role that you are missing:
   1. Click `Create app role`, this will open a panel on the right side
   2. Set `Display name` like `MerchHubGlobal.Read`
   3. Set `Allowed member types` to `Users/Groups`
   4. Set `Value` like `Glob.R`
   5. Set `Description` like `Allows the app to update Merchandising Hub Global level rules`
   6. Set `Do you want to enable this app role?` on.
   7. Click apply button
7. At this point your app registration has ability to assign roles, so lets assign them.
8. Click on `How do I assign App roles` on the same page where you can see your roles.
9. Click on `Enterprise applications` link that pops up on the right. This will navigate you to enterprise side of your app. App registration is like Class in programming, Enterprise side is like instance of that Class, here we can assign roles.
10. Click on `Users and groups`, this will open a screen where you can assign your newly created roles to both peoples and groups.
    ![Roles assignment](img/authorization-roles-assign.png 'Roles assignment')
11. You can assign roles to anyone but typically you just want to assign them to yourself to be able to develop locally.
12. Click on `Add user/group` button, new panel will pop out.
13. Select yourself
    ![Roles assignment - add user](img/authorization-add-assignment-user.png 'Roles assignment - add user')
14. Select the role you want to add, typically you want `write` access everywhere unless you are testing `read` access.
    ![Roles assignment - select role](img/authorization-select-role.png 'Roles assignment - select role')
15. Click `Assign`.
16. Remember that you need to `log out` and `log in` in your local env for this change to take effect.
