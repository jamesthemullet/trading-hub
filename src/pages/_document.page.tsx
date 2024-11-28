import { css, Global } from '@emotion/react';
import { ColorSchemeScript } from '@mantine/core';

import { logger } from '@/libs/components/logger/logger';

import newrelic from 'newrelic';
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

import { fonts } from '../libs/components';
import { color } from '../libs/components/utils/constants';

const fontStyles = css`
  @font-face {
    font-family: mnsLondonRegular;
    font-weight: 400;
    src:
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonRegular.woff2')
        format('woff2'),
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonRegular.woff')
        format('woff');
  }

  @font-face {
    font-family: mnsLondonSemiBold;
    font-weight: 600;
    src:
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonSemiBold.woff2')
        format('woff2'),
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonSemiBold.woff')
        format('woff');
  }

  @font-face {
    font-family: mnsLondonBold;
    font-weight: 700;
    src:
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonBold.woff2')
        format('woff2'),
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonBold.woff')
        format('woff');
  }

  @font-face {
    font-family: mnsLondonBoldCondensed;
    font-stretch: condensed;
    font-weight: 400;
    src:
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonBoldCondensed.woff2')
        format('woff2'),
      url('https://static.marksandspencer.com/fonts/mnsLondon/mnsLondonBoldCondensed.woff')
        format('woff');
  }
`;

// istanbul ignore next
const resetStyles = () => css`
  html {
    box-sizing: border-box;
    font-size: 16px;
  }
  body {
    min-height: 100vh;
    min-width: 990px;
    scroll-behavior: smooth;
    text-rendering: optimizeSpeed;
    font-weight: normal;
    font-family: ${fonts.regular};
    color: #222;
    &:focus,
    .focus-visible {
      outline: 0;
      box-shadow: ${`0 0 0 0.125rem #fff, 0 0 0 0.25rem ${color.infoBlueBackground}, 0 0 0.25rem 0.25rem ${color.infoBlueBackground}`};
    }
  }

  button {
    cursor: pointer;
  }

  hr {
    margin: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  ul,
  ol {
    padding: 0;
    list-style: none;
  }

  body,
  h1,
  h2,
  h3,
  h4,
  p,
  ul,
  ol,
  li {
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

type MerchHubInitialProps = DocumentInitialProps & {
  browserTimingHeader: string;
};

const checkNewRelicConnection = async () => {
  if (
    process.env.NEW_RELIC_APP_NAME &&
    process.env.NEW_RELIC_LICENSE_KEY &&
    newrelic.agent &&
    newrelic.agent.collector &&
    newrelic.agent.collector.isConnected() === false
  ) {
    return new Promise((resolve) => {
      newrelic.agent.on('connected', resolve);
    });
  } else if (
    process.env.NODE_ENV !== 'development' &&
    (!process.env.NEW_RELIC_APP_NAME || !process.env.NEW_RELIC_LICENSE_KEY)
  ) {
    logger.warn('missing new relic env vars');
  }
};

// eslint-disable-next-line functional/no-classes
class RootDocument extends Document<MerchHubInitialProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<MerchHubInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    await checkNewRelicConnection();
    const browserTimingHeader = newrelic.getBrowserTimingHeader({
      hasToRemoveScriptWrapper: true,
      allowTransactionlessInjection: true,
    });

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
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: this.props.browserTimingHeader }}
          />
          <ColorSchemeScript defaultColorScheme="light" />
          <link
            rel="shortcut icon"
            href="https://static.marksandspencer.com/images/favicon.ico"
          />
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
