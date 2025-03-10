# User access management

Merchandising Hub app is using azure RBAC for access. To gain access your Azure AD account needs to have correct role assigned, either directly or through an AD group.

## Adding users by existing AD group

This is the easiest and intended way, it works by delegation. Owner of an AD group can add and remove users and they automatically get the required roles.

Our app officially supports following AD groups.

- [DL - Onsite Merchandising](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/875ac683-ef11-4b8d-88f3-704e6d6de1eb) with `Cat.W, Search.W, Glob.W` roles
- [GRP - Search-and-Sort](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/aeb17e7d-4329-4eb4-90e4-8ccf859a38cb) with `Cat.W, Search.W, Glob.W` roles
- [DL-TCSDigitalSiteMerchandisingTeam](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/0edcdaf6-e6b1-4296-a703-f3255870c71c) with `Cat.W, Search.W, Glob.W` roles

These groups have roles already assigned, if you are part of any of those groups you will get access trough that membership.

## Adding users by new AD group or direct role assignment

This method should be used for cases where access is required and user is not a member of preexisting groups.

The downside of adding users directly is the cost of maintenance of such access.

### Ownership verification

Adding, reassigning or removing users requires ownership of `sp-MandS-V2-Production-Customer&Loyalty-tradehub-TF-Managed` app registration in Azure for Prod or `sp-MandS-V2-NonProduction-Customer&Loyalty-tradehub-TF-Managed` for DEV.

Verification of ownership can be done by opening url for selected environment:

- [Owners - DEV](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Owners/objectId/2ac477a8-64b5-462a-b3e6-b4883feee7af/appId/2c640eb1-36ce-4c8a-be67-0559df1722f5)
- [Owners - PROD](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Owners/objectId/ecc4a46c-6a0a-4128-b6d6-aa828d12cbbb/appId/79325e76-57c8-4d1d-83b9-08e3a5a14760)

Please contact the owner for adding user or got to the next step to do it yourself if you are an owner.

### Adding new user or group

1. Click on selected environment:
   1. [Users and Groups - DEV](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Users/objectId/2ac477a8-64b5-462a-b3e6-b4883feee7af/appId/2c640eb1-36ce-4c8a-be67-0559df1722f5)
   2. [Users and Groups - PROD](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Users/objectId/ecc4a46c-6a0a-4128-b6d6-aa828d12cbbb/appId/79325e76-57c8-4d1d-83b9-08e3a5a14760)
2. Click `Add user/group` button
   1. Select user or group
   2. Select role, to give edit access select role with `<name>.W` please read [authorization](./authorization.md) for more details.
   3. Click `Assign`
3. Repeat step 2 for each required role.
