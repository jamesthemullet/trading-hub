import { useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

export const LoginCheck = ({
  autoLogin: autoLoginEnabled = false,
}: {
  autoLogin?: boolean;
}) => {
  const { data: session, status, update } = useSession();

  const login = async () => {
    await signIn('azure-ad');
  };

  useEffect(() => {
    if (autoLoginEnabled && status === 'unauthenticated') {
      login();
    }
  }, [status, session, autoLoginEnabled]);

  // https://next-auth.js.org/getting-started/client#updating-the-session
  useEffect(() => {
    const interval = setInterval(() => update(), 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [update]);

  useEffect(() => {
    const visibilityHandler = () =>
      document.visibilityState === 'visible' && update();
    window.addEventListener('visibilitychange', visibilityHandler, false);
    return () =>
      window.removeEventListener('visibilitychange', visibilityHandler, false);
  }, [update]);

  return <div></div>;
};
