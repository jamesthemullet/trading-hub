# Authorization

## Historical Context

Merchandising Hub previously used a hardcoded list of emails through a logic implemented in the backend to control access.

## New method of authorization

The new method of authorization is based on roles. Roles are simply an array of strings that define access to resource. They are stored in the access token, like so:

```Typescript
const accessToken = {
  // other stuff
  roles: ['Cat.W', 'Glob.R']
}
```

Access token is signed so backend will check that token is valid before interpreting the roles. That is not enough however since anyone can create new app registration and have signed token, we need to also make sure that client id of the token matches the one we have in prod.

Access is granted independently for each area. Category Ranking requires `Cat.R` for read access or `Cat.W` for read and write access; Search Ranking requires `Search.R` or `Search.W`; and Global Ranking requires `Glob.R` or `Glob.W`. `Glob.W` grants access to Global Ranking only.

Intended users need the expected role values in their access token before they will be able to use the corresponding areas. Backend role enforcement is being delivered separately; frontend checks control the UI and do not replace backend authorization.

Still to do - all developers should get `read` access in prod. There must be a process for getting temporary (up to 8h) access on demand provided an approval is made by authorized personnel. This is required as there are exceptional situations where developer needs to test write access on prod to verify if bug still exists.

## Naming

Role naming should follow same pattern, it needs to be relatively short as space in token is costly and subject to limits. Some browsers allow only 8Kb of space for header in request and access token is going to travel there between frontend and backend.

This is why Merchandising Hub uses a short area prefix followed by `.` and either `R` or `W`, indicating `read` or `write` access.

## Roles

Merchandising Hub is using roles section of token to declare roles.

There are 3 modes of access to resource:

- `no access`, for everyone who don't have any roles assigned. From a token perspective it means roles field is either `undefined` or empty - `[]`
- `read access`, it allows to see the data but not change it. For example `[Glob.R]`
- `write access`, this role allows users to change data.

There are following sections of the page protected independently:

- Category Ranking
- Search Ranking & Redirects
- Global Ranking

In total there are following roles:

- `Cat.R` for read access to category ranking
- `Cat.W` for read and write access to category ranking
- `Search.R` for read access to search ranking and redirects
- `Search.W` for read and write access to search ranking and redirects
- `Glob.R` for read access to global ranking
- `Glob.W` for read and write access to global ranking

Roles define access with one caveat, `write` role contains `read` role. This is to simplify role assignment and there is no point with giving someone `write` access without `read` access.

Write role from the REST perspective means users can perform all HTTP requests including but not limited to PUT,POST,DELETE.

Read role from REST perspective means users can perform only GET request.

## Frontend support of roles

The frontend copies roles from the access token into the session object under:

```Typescript
session.roles
```

Azure role assignments to users or groups must produce the supported values (for example, `Cat.W`) in the access-token `roles` claim. The frontend copies that claim directly; it does not translate a separate `groups` claim.

Developers can use this directly by simply checking if a roles is contained in the array like:

```Typescript
  if (!session?.roles?.includes('Glob.R')) {
    return;
  }
```

The `useAccess` hook checks roles for each application area. Users without a session role for that area have no access; read roles allow viewing and write roles allow viewing and editing. For example:

```Typescript
  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }
```

## Backend support of roles

Backend needs to verify that the request method is satisfied by a given user role, but they also needs to make sure that the token client id is correct.

Since many developers are using their own app registration for authentication we either need to disable client id verification or make a list of all approved developer owned app registrations.

Optionally backend can also verify if token method of authentication is using 2FA, if we want to force users to use safe method of authentication.

## Local development with roles

Frontend developers can modify their app registration with roles to test access. As authorization is always enabled in the frontend, local development requires the app registration to issue the roles needed by the area being tested.

To modify your own app registration please follow those steps:

1. Log in to azure.
2. Locate your app registration, typically it starts with `<your-name>-trading-hub`
3. Navigate to roles section, in Azure it is called `App roles`
4. It will contain no roles if you are adding them for the first time, but there might be already some roles there if you have been following this guide before.
   ![App Roles](img/authorization-roles-azure.png 'App Roles')
5. The supported roles are:
   - `Cat.W` - MerchHubCategory.Write
   - `Cat.R` - MerchHubCategory.Read
   - `Search.W` - MerchHubSearch.Write
   - `Search.R` - MerchHubSearch.Read
   - `Glob.W` - MerchHubGlobal.Write
   - `Glob.R` - MerchHubGlobal.Read

   Alternatively you can look up kk-trading-hub app registration and copy its setup - though that is not guaranteed to be up to date.

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
