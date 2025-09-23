import { css, Global } from '@emotion/react';
import { ColorSchemeScript } from '@mantine/core';

import { fontStyles, resetStyles } from '@/libs/utils/base-styles';

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
  render() {
    const { dynatraceRumScriptUrl } = this.props;
    return (
      <Html lang="en">
        <Head>
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
