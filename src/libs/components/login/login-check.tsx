import { useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

export const LoginCheck = ({
  autoLogin: autoLoginEnabled = false,
}: {
  autoLogin?: boolean;
}) => {
  const { data: session, status } = useSession();

  const login = async () => {
    await signIn('azure-ad');
  };

  useEffect(() => {
    if (autoLoginEnabled && status === 'unauthenticated') {
      login();
    }
  }, [status, session, autoLoginEnabled]);

  return <div></div>;
};
