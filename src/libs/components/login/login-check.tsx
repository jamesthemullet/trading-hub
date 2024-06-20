import { useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

export const LoginCheck = () => {
  const { data: session, status } = useSession();

  const login = async () => {
    await signIn('azure-ad', {
      callbackUrl: '/category/rulesets',
      redirect: false,
    });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      login();
    }
  }, [status, session]);

  return <div></div>;
};
