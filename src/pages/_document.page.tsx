import { css, Global } from '@emotion/react';
import { ColorSchemeScript } from '@mantine/core';

import { logger } from '@/libs/components/logger/logger';
import { fontStyles, resetStyles } from '@/libs/utils/base-styles';

import newrelic from 'newrelic';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

type MerchHubInitialProps = DocumentInitialProps & {
  browserTimingHeader: string;
};

const checkNewRelicConnection = async () => {
  const shouldWaitForConnection =
    process.env.NEW_RELIC_APP_NAME &&
    process.env.NEW_RELIC_LICENSE_KEY &&
    newrelic.agent?.collector &&
    newrelic.agent.collector.isConnected() === false;

  if (shouldWaitForConnection) {
    return new Promise((resolve) => {
      newrelic.agent.on('connected', resolve);
    });
  }

  // istanbul ignore else
  const shouldWarnMissingEnvVars =
    process.env.NODE_ENV !== 'development' &&
    (!process.env.NEW_RELIC_APP_NAME || !process.env.NEW_RELIC_LICENSE_KEY);

  // istanbul ignore else
  if (shouldWarnMissingEnvVars) {
    logger.warn('missing new relic env vars');
  }
};

class RootDocument extends Document<MerchHubInitialProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<MerchHubInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    await checkNewRelicConnection();
    const browserTimingHeader =
      process.env.NEW_RELIC_ENABLED === 'true'
        ? newrelic.getBrowserTimingHeader({
            hasToRemoveScriptWrapper: true,
            allowTransactionlessInjection: true,
          })
        : '';

    logger.info('Trading Hub Loaded', {
      application: 'Trading Hub',
      test: 'Testing logging with Winston',
      pathname: ctx.pathname,
    });

    return {
      ...initialProps,
      browserTimingHeader,
    };
  }

  // istanbul ignore next
  render() {
    return (
      <Html lang="en">
        <Head>
          <Script
            id="browser-timing-header"
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: this.props.browserTimingHeader }}
          />
          <ColorSchemeScript defaultColorScheme="light" />
          <link
            rel="shortcut icon"
            href="https://static.marksandspencer.com/images/favicon.ico"
          />
          {process.env.CLARITY_KEY && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
         (function(c,l,a,r,i,t,y){
             c[a] = c[a] || function () { (c[a].q = c[a].q || 
             []).push(arguments) };
             t=l.createElement(r);
             t.async=1;
             t.src="https://www.clarity.ms/tag/"+i;
             y=l.getElementsByTagName(r)[0];
             y.parentNode.insertBefore(t,y);
         })(window, document, "clarity", "script", "${process.env.CLARITY_KEY}");`,
              }}
            />
          )}
        </Head>
        <Global
          styles={css`
            ${resetStyles()}
            ${fontStyles}
          `}
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RootDocument;
