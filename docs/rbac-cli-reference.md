# RBAC CLI Reference

Quick reference for Azure CLI commands useful for managing Trading Hub RBAC.

## Get App Roles

List all app roles defined for an app registration (table format):

```bash
az ad app show --id 2c640eb1-36ce-4c8a-be67-0559df1722f5 --query 'appRoles[]' -o table
```

Returns: Display name, ID, value (role code), enabled status, and member types.

Or as JSON:

```bash
az ad app show --id 2c640eb1-36ce-4c8a-be67-0559df1722f5 --query appRoles
```

## Get Groups with Access to Trading Hub

List all groups assigned app roles on the enterprise application:

```bash
APP_ID='2c640eb1-36ce-4c8a-be67-0559df1722f5'; SP_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv); az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" -o json | jq -r '.value[] | select(.principalType == "Group") | [.principalDisplayName, .principalId] | @tsv' | sort -u | column -t
```

Returns: Group Name | Group Object ID

## View Enterprise App Users and Groups (Portal Equivalent)

These two commands are the CLI equivalent of the Azure Portal Users and Groups blade for Trading Hub.

1. List all user and group assignments on the enterprise application:

```bash
SP_ID='2ac477a8-64b5-462a-b3e6-b4883feee7af'; az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" --query "value[?principalType=='User' || principalType=='Group'].{Type:principalType,Name:principalDisplayName,ObjectId:principalId,RoleId:appRoleId}" -o table
```

What it does: Reads all app role assignments for the Trading Hub enterprise application and shows who has access (users and groups), including the assigned role ID.

2. Resolve role IDs to role names from the app registration:

```bash
APP_ID='2c640eb1-36ce-4c8a-be67-0559df1722f5'; az ad app show --id "$APP_ID" --query "appRoles[].{RoleId:id,Role:value,DisplayName:displayName,Enabled:isEnabled}" -o table
```

What it does: Lists the role catalogue for the app registration so you can map each RoleId from command 1 to a readable role value such as Cat.W, Search.W, or Glob.W.

## View Members of an AD Group

List user members for a specific group object ID:

```bash
GROUP_ID='aeb17e7d-4329-4eb4-90e4-8ccf859a38cb'; az rest --method GET --url "https://graph.microsoft.com/v1.0/groups/$GROUP_ID/members/microsoft.graph.user?\$select=id,displayName,userPrincipalName" --query "value[].{Name:displayName,UPN:userPrincipalName,Id:id}" -o table
```

What it does: Shows all direct user members in the specified Azure AD group, including display name, sign-in UPN, and object ID.

## Resolve a Role ID to Role Name

Look up a specific role ID and return its readable role value and display name:

```bash
APP_ID='2c640eb1-36ce-4c8a-be67-0559df1722f5'; ROLE_ID='4b306590-1a88-475b-ac94-cddf9f884e4b'; az ad app show --id "$APP_ID" --query "appRoles[?id=='$ROLE_ID'].{Role:value,DisplayName:displayName,Id:id,Enabled:isEnabled}" -o table
```

What it does: Maps a GUID role ID (for example from appRoleAssignedTo output) to the actual Trading Hub role code.

## Remove a Group Role Assignment

Remove one app role assignment for a group on the enterprise application:

```bash
APP_ID='2c640eb1-36ce-4c8a-be67-0559df1722f5'; SP_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv); GROUP_ID='aeb17e7d-4329-4eb4-90e4-8ccf859a38cb'; ROLE_ID='4b306590-1a88-475b-ac94-cddf9f884e4b'; ASSIGNMENT_ID=$(az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" -o json | jq -r --arg gid "$GROUP_ID" --arg rid "$ROLE_ID" '.value[] | select(.principalId==$gid and .appRoleId==$rid) | .id' | head -n 1); echo "Assignment to delete: $ASSIGNMENT_ID"; az rest --method DELETE --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo/$ASSIGNMENT_ID"
```

What it does: Finds the exact assignment object for the group + role pair and deletes it.

Note: This removes that role from the whole group (all members inherit that change).

Verify remaining group role assignments:

```bash
az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" --query "value[?principalType=='Group' && principalId=='$GROUP_ID'].{Group:principalDisplayName,RoleId:appRoleId}" -o table
```

## Next Steps: Getting RBAC Working

Follow this sequence to audit, test, and manage Trading Hub RBAC end to end.

### 1. Audit current state

List all groups and their assigned roles on the DEV enterprise app:

```bash
APP_ID='2c640eb1-36ce-4c8a-be67-0559df1722f5'; SP_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv); ROLES=$(az ad app show --id "$APP_ID" -o json); ASSIGNMENTS=$(az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" -o json); echo "$ASSIGNMENTS" | jq -r --argjson roles "$(echo "$ROLES" | jq '.appRoles')" '.value[] | select(.principalType=="Group") as $a | $roles[] | select(.id==$a.appRoleId) | [$a.principalDisplayName,$a.principalId,.value] | @tsv' | column -t
```

Returns: Group Name | Group Object ID | Role (for example Cat.W, Search.W, Glob.W)

### 2. Verify members of each group

Check who is in any group that has access:

```bash
GROUP_ID='<group-object-id>'; az rest --method GET --url "https://graph.microsoft.com/v1.0/groups/$GROUP_ID/members/microsoft.graph.user?\$select=id,displayName,userPrincipalName" --query "value[].{Name:displayName,UPN:userPrincipalName,Id:id}" -o table
```

### 3. Test access in the app

Log in to Trading Hub DEV and confirm the correct features are visible/locked for each role. See [authorization.md](./authorization.md) for what each role controls.

### 4. Make changes

To add or remove a group role assignment you need write access on the enterprise app. If your delete attempt returns `Authorization_RequestDenied`:

1. Confirm you are owner of the enterprise app (service principal):

```bash
az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/owners?\$select=id,displayName,userPrincipalName" --query "value[].{Name:displayName,UPN:userPrincipalName,Id:id}" -o table
```

2. Refresh your CLI token and retry:

```bash
az account clear; az login
```

3. If still forbidden, request elevated access:

- Role: **Cloud Application Administrator** (PIM/JIT activation preferred)
- Scope: Trading Hub DEV enterprise app
- Enterprise app object ID: `2ac477a8-64b5-462a-b3e6-b4883feee7af`
- App ID: `2c640eb1-36ce-4c8a-be67-0559df1722f5`

Suggested request text for IT:

> "Please grant me DEV tenant access to manage Trading Hub enterprise app role assignments. I need Cloud Application Administrator via PIM (preferred), or equivalent permissions, for service principal objectId 2ac477a8-64b5-462a-b3e6-b4883feee7af (appId 2c640eb1-36ce-4c8a-be67-0559df1722f5). I need this to remove incorrect Users/Groups role assignments and validate RBAC in DEV."

### 5. Verify changes

After any change, re-audit assignments and retest in the app:

```bash
az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignedTo" --query "value[?principalType=='Group'].{Group:principalDisplayName,GroupObjectId:principalId,RoleId:appRoleId}" -o table
```

## Variable Reference

- `APP_ID`: Client/app registration ID (2c640eb1-36ce-4c8a-be67-0559df1722f5 for Trading Hub DEV)
- `SP_ID`: Enterprise app (service principal) object ID — derived from app registration
- `GROUP_ID`: Azure AD group object ID
- `ROLE_ID`: App role ID from assignment output
- `ASSIGNMENT_ID`: Specific app role assignment object ID (used for delete)
