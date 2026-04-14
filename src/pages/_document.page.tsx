import type { ReactElement } from 'react';
import { ColorSchemeScript } from '@mantine/core';

import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

type MerchHubInitialProps = DocumentInitialProps & {
  dynatraceRumScriptUrl?: string;
};

class RootDocument extends Document<MerchHubInitialProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<MerchHubInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      dynatraceRumScriptUrl: process.env.DYNATRACE_RUM_SCRIPT_URL,
    };
  }

  // istanbul ignore next
  render(): ReactElement {
    const { dynatraceRumScriptUrl } = this.props;
    return (
      <Html lang="en">
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" content="#000000" />
          {dynatraceRumScriptUrl && (
            <Script
              type="text/javascript"
              src={dynatraceRumScriptUrl}
              strategy="beforeInteractive"
              crossOrigin="anonymous"
            />
          )}
          <ColorSchemeScript defaultColorScheme="light" />
          <link
            rel="shortcut icon"
            href="https://static.marksandspencer.com/images/favicon.ico"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RootDocument;
