import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import styled from '@emotion/styled';
import { useCookies } from 'react-cookie';
import { MantineProvider } from '@mantine/core';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { LoginCheck } from '@/libs/components/login/login-check';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Navigation } from '../libs/components/navigation/navigation';

const Layout = styled.div`
  display: flex;
  height: 100vh;
`;

const StyledMain = styled.main`
  margin-left: 90px;
  width: 100%;
  overflow-y: auto;
  height: 100vh;
`;

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
            <Navigation
              autoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
            />
            <StyledMain>
              <Component {...pageProps} />
            </StyledMain>
          </Layout>
        </MantineProvider>
      </SessionProvider>
    </FeatureFlagContext.Provider>
  );
}
