import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { css, Global } from '@emotion/react';
import React from 'react';
import { createTheme, MantineProvider } from '@mantine/core';

import type { Preview } from '@storybook/nextjs-vite';

import { fontStyles, resetStyles } from '../src/libs/utils/base-styles';

const theme = createTheme({});

const withGlobalStyles = (Story: React.ComponentType) => (
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
const withMantineProvider = (Story: React.ComponentType) => (
  <MantineProvider theme={theme}>
    <Story />
  </MantineProvider>
);

const preview: Preview = {
  decorators: [withGlobalStyles, withMantineProvider],
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
