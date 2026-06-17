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

  const roleValues: { [K in AccessType]: [AccessMap[K], AccessMap[K]] } = {
    Cat: ['Cat.W', 'Cat.R'],
    Search: ['Search.W', 'Search.R'],
    Glob: ['Glob.W', 'Glob.R'],
  };

  const resolveRole = <K extends AccessType>(key: K): AccessMap[K] => {
    const [writeRole, readRole] = roleValues[key];
    if (roles.includes(writeRole)) return writeRole;
    if (roles.includes(readRole)) return readRole;
    return '';
  };

  const roleMap: AccessMap = {
    Cat: resolveRole('Cat'),
    Search: resolveRole('Search'),
    Glob: resolveRole('Glob'),
  };

  if (override.catOverride !== 'No Override' && override.catOverride !== '') {
    // eslint-disable-next-line functional/immutable-data
    roleMap.Cat = override.catOverride;
  }

  if (
    override.searchOverride !== 'No Override' &&
    override.searchOverride !== ''
  ) {
    // eslint-disable-next-line functional/immutable-data
    roleMap.Search = override.searchOverride;
  }

  if (
    override.globalOverride !== 'No Override' &&
    override.globalOverride !== ''
  ) {
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
