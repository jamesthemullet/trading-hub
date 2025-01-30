import { useSession } from 'next-auth/react';

import { useAuthorizationFlag } from '../components/context/feature-flag';

export const useAccess = (config: { readRole: string; writeRole: string }) => {
  const session = useSession();
  const authorizationEnabled = useAuthorizationFlag();

  if (!authorizationEnabled) {
    return {
      hasReadAccess: true,
      hasWriteAccess: true,
    };
  }

  const hasWriteAccess =
    session.data?.roles.includes(config.writeRole) ?? false;
  const hasReadAccess =
    hasWriteAccess || (session.data?.roles.includes(config.readRole) ?? false);

  return {
    hasReadAccess,
    hasWriteAccess,
  };
};
