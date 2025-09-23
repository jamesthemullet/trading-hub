import { css } from '@emotion/react';

import { fonts } from '@/libs/components';
import { color } from '@/libs/utils/constants';

export const fontStyles = css`
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
export const resetStyles = () => css`
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
