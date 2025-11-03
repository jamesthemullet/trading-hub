import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import styled from '@emotion/styled';
import { useContext, useEffect } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { createTheme, MantineProvider, Portal } from '@mantine/core';

import { FeatureFlagContext } from '@/libs/components/feature-flag/feature-flag';
import { LoginCheck } from '@/libs/features/shared/login/login-check';

import { accented } from 'accented';
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
          __html: 'function OptanonWrapper() {}',
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

        <OneTrustScripts />

        {process.env.CLARITY_KEY && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
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
              `,
            }}
          />
        )}
      </FeatureFlagWrapper>
    </CookiesProvider>
  );
}
