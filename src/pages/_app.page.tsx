import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/libs/styles/globals.css';
import '@/libs/utils/base-styles.module.css';

import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { createTheme, MantineProvider, Portal } from '@mantine/core';

import { ErrorBoundary } from '@/libs/components/error-boundary/error-boundary';
import { FeatureFlagContext } from '@/libs/components/feature-flag/feature-flag';
import { SmokeTestTokenWarning } from '@/libs/components/smoke-test-token-warning/smoke-test-token-warning';
import { ToastProvider } from '@/libs/components/toast/toast-provider';
import { LoginCheck } from '@/libs/features/shared/login/login-check';
import { setupGlobalErrorHandlers } from '@/libs/utils/dynatrace';

import { accented } from 'accented';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import sanitize from 'xss';

import { Navigation } from '../libs/components/navigation/navigation';
import styles from './_app.module.css';

const theme = createTheme({
  components: {
    Portal: Portal.extend({
      defaultProps: {
        reuseTargetNode: false,
      },
    }),
  },
});

const FeatureFlagWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  const [cookies] = useCookies([
    'flagAuthorization',
    'flagAuthorizationRoleOverride',
    'flagProfilePage',
    'flagFavouriteRulesets',
  ]);

  return (
    <FeatureFlagContext.Provider
      value={{
        hasAuthorization: cookies.flagAuthorization,
        authorizationRoleOverride: cookies.flagAuthorizationRoleOverride ?? {
          catOverride: 'No Override',
          searchOverride: 'No Override',
          globalOverride: 'No Override',
        },
        hasProfilePage: cookies.flagProfilePage === true,
        hasFavouriteRulesets: cookies.flagFavouriteRulesets === true,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>): ReactElement {
  const { session } = pageProps;

  // istanbul ignore next
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_RUN_ACCENTED_ON_DEV === 'true'
    ) {
      accented();
    }
  }, []);

  // Setup global error handlers for Dynatrace
  useEffect(() => {
    const cleanup = setupGlobalErrorHandlers();
    return cleanup;
  }, []);

  return (
    <CookiesProvider>
      {process.env.NODE_ENV === 'development' && <SmokeTestTokenWarning />}
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
            <ErrorBoundary>
              <LoginCheck
                shouldAutoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
              />
              <div className={styles.layout}>
                <a href="#main-content" className={styles.skipLink}>
                  Skip to main content
                </a>
                <Navigation />
                <main id="main-content" className={styles.main}>
                  <Component {...pageProps} />
                </main>
              </div>
              <ToastProvider />
            </ErrorBoundary>
          </MantineProvider>
        </SessionProvider>

        {process.env.CLARITY_KEY && (
          <script
            dangerouslySetInnerHTML={{
              __html: sanitize(`
                (function(c,l,a,r,i,t,y){
                  c[a] = c[a] || function () { 
                    (c[a].q = c[a].q || []).push(arguments) 
                  };
                  t=l.createElement(r);
                  t.async=1;
                  t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];
                  y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.CLARITY_KEY}");
              `),
            }}
          />
        )}
      </FeatureFlagWrapper>
    </CookiesProvider>
  );
}
