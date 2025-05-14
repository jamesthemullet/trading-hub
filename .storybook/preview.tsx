import React from 'react';
import type { Preview } from '@storybook/react';
import { Global, css } from '@emotion/react';

import { resetStyles, fontStyles } from '../src/libs/utils/base-styles';

const withGlobalStyles = (Story) => (
  <>
    <Global
      styles={css`
        ${resetStyles()}
        ${fontStyles}
      `}
    />
    <Story />
  </>
);

const preview: Preview = {
  decorators: [withGlobalStyles],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
