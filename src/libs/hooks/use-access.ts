import { useSession } from 'next-auth/react';

import {
  useAuthorizationFlag,
  useAuthorizationRoleOverride,
} from '../components/feature-flag/feature-flag';

type AccessType = 'Cat' | 'Search' | 'Glob';
type AccessMap = {
  Cat: '' | 'Cat.R' | 'Cat.W';
  Search: '' | 'Search.R' | 'Search.W';
  Glob: '' | 'Glob.R' | 'Glob.W';
};

export const useAccess = (
  type: AccessType
): {
  hasReadAccess: boolean;
  hasWriteAccess: boolean;
  requiredReadRole: string;
  requiredWriteRole: string;
} => {
  const session = useSession();
  const isAuthorizationEnabled = useAuthorizationFlag();
  const override = useAuthorizationRoleOverride();
  const requiredReadRole = `${type}.R`;
  const requiredWriteRole = `${type}.W`;

  if (!isAuthorizationEnabled) {
    return {
      hasReadAccess: true,
      hasWriteAccess: true,
      requiredReadRole,
      requiredWriteRole,
    };
  }

  const roles = session.data?.roles ?? [];

  function resolveRole(key: 'Cat'): AccessMap['Cat'];
  function resolveRole(key: 'Search'): AccessMap['Search'];
  function resolveRole(key: 'Glob'): AccessMap['Glob'];
  function resolveRole(key: AccessType) {
    const writeRole = `${key}.W`;
    if (roles.includes(writeRole)) return writeRole;

    const readRole = `${key}.R`;
    if (roles.includes(readRole)) return readRole;

    return '';
  }

  const roleMap: AccessMap = {
    Cat: resolveRole('Cat'),
    Search: resolveRole('Search'),
    Glob: resolveRole('Glob'),
  };

  if (override.catOverride !== 'No Override') {
    // eslint-disable-next-line functional/immutable-data
    roleMap.Cat = override.catOverride;
  }

  if (override.searchOverride !== 'No Override') {
    // eslint-disable-next-line functional/immutable-data
    roleMap.Search = override.searchOverride;
  }

  if (override.globalOverride !== 'No Override') {
    // eslint-disable-next-line functional/immutable-data
    roleMap.Glob = override.globalOverride;
  }

  const hasWriteAccess = roleMap[type] === `${type}.W`;
  const hasReadAccess = hasWriteAccess || roleMap[type] === `${type}.R`;

  return {
    hasReadAccess,
    hasWriteAccess,
    requiredReadRole,
    requiredWriteRole,
  };
};
