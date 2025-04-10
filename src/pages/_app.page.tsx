import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { useCookies } from 'react-cookie';
import { MantineProvider } from '@mantine/core';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { LoginCheck } from '@/libs/components/login/login-check';

import type { AppProps } from 'next/app';
import Script from 'next/script';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Layout, Navigation } from '../libs/components/navigation/navigation';

const GA_TRACKING_ID = 'G-J7MXRHSQLJ';

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;
  const [cookies] = useCookies([
    'flagAuthorization',
    'flagAuthorizationRoleOverride',
  ]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', {
          page_path: window.location.pathname,
        });
      `,
        }}
      />
      <FeatureFlagContext.Provider
        value={{
          hasAuthorization: cookies.flagAuthorization,
          authorizationRoleOverride: cookies.flagAuthorizationRoleOverride || {
            catOverride: 'No Override',
            searchOverride: 'No Override',
            globalOverride: 'No Override',
          },
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
    </>
  );
}
