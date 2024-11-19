import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { MantineProvider } from '@mantine/core';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { LoginCheck } from '@/libs/components/login/login-check';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Layout, Navigation } from '../libs/components/navigation/navigation';

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;
  const [cookies] = useCookies(['flagIreland', 'flagMultipleCategories']);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <FeatureFlagContext.Provider
      value={{
        hasIreland: isClient ? cookies.flagIreland : false,
        hasMultipleCategories: isClient
          ? cookies.flagMultipleCategories
          : false,
      }}
    >
      <SessionProvider session={session}>
        <MantineProvider>
          <LoginCheck
            autoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
          />
          <Layout>
            <Navigation />
            <Component {...pageProps} />
          </Layout>
        </MantineProvider>
      </SessionProvider>
    </FeatureFlagContext.Provider>
  );
}
