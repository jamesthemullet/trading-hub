import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import styled from '@emotion/styled';
import { CookiesProvider, useCookies } from 'react-cookie';
import { createTheme, MantineProvider, Portal } from '@mantine/core';

import { FeatureFlagContext } from '@/libs/components/feature-flag/feature-flag';
import { LoginCheck } from '@/libs/features/shared/login/login-check';

import type { AppProps } from 'next/app';
import Script from 'next/script';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Navigation } from '../libs/components/navigation/navigation';

const theme = createTheme({
  components: {
    Portal: Portal.extend({
      defaultProps: {
        reuseTargetNode: false,
      },
    }),
  },
});

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

const FeatureFlagWrapper = ({ children }: { children: React.ReactNode }) => {
  const [cookies] = useCookies([
    'flagAuthorization',
    'flagAuthorizationRoleOverride',
    'flagShowNewFacetValuesPage',
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
        showNewFacetValuesPage: cookies.flagShowNewFacetValuesPage,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;

  return (
    <CookiesProvider>
      {typeof window !== 'undefined' &&
        navigator.userAgent !== 'smoke-test-playwright' &&
        // TODO: when code freeze over change to !== 'development'
        process.env.NODE_ENV === 'development' && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="35c4c416-e422-4130-9b76-b344be44cefa"
          />
        )}
      <FeatureFlagWrapper>
        <SessionProvider session={session}>
          <MantineProvider theme={theme}>
            <LoginCheck
              autoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
            />
            <Layout>
              <Navigation />
              <StyledMain>
                <Component {...pageProps} />
              </StyledMain>
            </Layout>
          </MantineProvider>
        </SessionProvider>
      </FeatureFlagWrapper>
    </CookiesProvider>
  );
}
