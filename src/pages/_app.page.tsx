import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/libs/styles/globals.css';
import '@/libs/utils/base-styles.module.css';

import { useContext, useEffect } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { createTheme, MantineProvider, Portal } from '@mantine/core';

import { ErrorBoundary } from '@/libs/components/error-boundary/error-boundary';
import { FeatureFlagContext } from '@/libs/components/feature-flag/feature-flag';
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

const FeatureFlagWrapper = ({ children }: { children: React.ReactNode }) => {
  const [cookies] = useCookies([
    'flagAuthorization',
    'flagAuthorizationRoleOverride',
    'flagOneTrust',
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
        oneTrust: cookies.flagOneTrust,
        showNewFacetValuesPage: cookies.flagShowNewFacetValuesPage,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

const OneTrustScripts = () => {
  const { oneTrust } = useContext(FeatureFlagContext);
  const isLocal =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

  if (!oneTrust || isLocal) {
    return null;
  }
  return (
    <>
      <Script
        src="https://cdn-ukwest.onetrust.com/scripttemplates/otSDKStub.js"
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script="01999609-8173-7554-b57e-cebe580c3242"
        strategy="afterInteractive"
      />
      <Script
        id="onetrust-inline"
        type="text/javascript"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: sanitize('function OptanonWrapper() {}'),
        }}
      />
      <Script id="onetrust-clarity-consent" strategy="afterInteractive">
        {`
          function sendClarityConsent() {
            if (typeof OneTrust === 'undefined' || typeof clarity === 'undefined') return;
            console.log(OneTrust);
            // to be completed
          }

          window.addEventListener('OneTrustGroupsUpdated', sendClarityConsent);
          window.addEventListener('load', sendClarityConsent);
        `}
      </Script>
    </>
  );
};

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
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
                autoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
              />
              <div className={styles.layout}>
                <Navigation />
                <main className={styles.main}>
                  <Component {...pageProps} />
                </main>
              </div>
            </ErrorBoundary>
          </MantineProvider>
        </SessionProvider>

        <OneTrustScripts />

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
