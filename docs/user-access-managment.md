# User access management

Merchandising Hub uses Microsoft Entra ID app roles (formerly Azure AD app roles) to control access. Users receive the supported role values in their sign-in token when they are assigned those roles directly or through a group assigned to the enterprise application. See [Authorization](./authorization.md) for the role names and access each one grants.

## Adding users by existing AD group

This is the intended way to manage access by delegation. A group owner can manage group membership, but membership grants Merchandising Hub access only when that group has the required app roles assigned to the relevant enterprise application. After being added to a group, the user may need to sign out and back in for the updated roles to appear in their token.

Our app officially supports following AD groups.

- [DL - Onsite Merchandising](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/875ac683-ef11-4b8d-88f3-704e6d6de1eb) with `Cat.W, Search.W, Glob.W` roles
- [GRP - Search-and-Sort](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/aeb17e7d-4329-4eb4-90e4-8ccf859a38cb) with `Cat.W, Search.W, Glob.W` roles
- [DL-TCSDigitalSiteMerchandisingTeam](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/0edcdaf6-e6b1-4296-a703-f3255870c71c) with `Cat.W, Search.W, Glob.W` roles
- [IT APP AZ Merch Hub Super Users](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/b5f97a05-1369-4faa-a9d7-ac6f50571e58) with `Cat.W, Search.W, Glob.W` roles
- [IT MBX Online Platform Operations](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/0236666e-9794-48c5-b1d6-b6d30840e3c2) with `Cat.W, Search.W, Glob.W` roles
- [IT MBX food online fulfilment](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/0cd63872-8910-4f64-a736-f6059f8d373c) with `Cat.W, Search.W, Glob.W` roles
- [Merchandising Hub - Designers](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/6c34d057-ae52-42a9-bef7-b4e1b9b81631) with `Cat.R, Search.R, Glob.R` roles

To-do:

Change roles for DL - Onsite Merchandising, GRP - Search-and-Sort and DL-TCSDigitalSiteMerchandisingTeam to Cat.R, Search.R, Glob.R

These groups have roles already assigned, if you are part of any of those groups you will get access through that membership.

## IT APP AZ Merch Hub Super Users

This is the list of merchandisers who have super user access to Merchandising Hub - ie all `Cat.W, Search.W, Glob.W` roles

### Verify assignment permissions

Adding, reassigning or removing users and groups requires permission to manage assignments on the enterprise application for the relevant environment. App registration ownership and permission to manage user/group assignments are distinct; being an app registration owner alone may not grant the required assignment permission. If you cannot manage assignments in the Users and Groups page, contact an authorized owner or request access through Helix.

Open the relevant environment's Owners page to check its listed owners and contact one if you need assignment access:

- [Owners - DEV](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Owners/objectId/2ac477a8-64b5-462a-b3e6-b4883feee7af/appId/2c640eb1-36ce-4c8a-be67-0559df1722f5)
- [Owners - PROD](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Owners/objectId/ecc4a46c-6a0a-4128-b6d6-aa828d12cbbb/appId/79325e76-57c8-4d1d-83b9-08e3a5a14760)

The Owners page is a reference for who to contact; verify that you have permission to manage assignments in the enterprise application before proceeding.

### Adding new user or group

1. Click on selected environment:
   1. [Users and Groups - DEV](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Users/objectId/2ac477a8-64b5-462a-b3e6-b4883feee7af/appId/2c640eb1-36ce-4c8a-be67-0559df1722f5)
   2. [Users and Groups - PROD](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Users/objectId/ecc4a46c-6a0a-4128-b6d6-aa828d12cbbb/appId/79325e76-57c8-4d1d-83b9-08e3a5a14760)
2. Click `Add user/group` button
   1. Select user or group
   2. Select role, to give edit access select role with `<name>.W` please read [authorization](./authorization.md) for more details.
   3. Click `Assign`
3. Repeat step 2 for each required role.

### Requesting additions

If you do not have the required permissions to add or amend groups, you can make a request via [Helix](https://mnscorp-rod-myit.onbmc.com/dwp/app/#/itemprofile/301)
