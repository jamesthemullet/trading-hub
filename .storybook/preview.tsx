import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/libs/styles/globals.css';

import type React from 'react';
import type { ReactElement } from 'react';
import { createTheme, MantineProvider } from '@mantine/core';

import type { Preview } from '@storybook/nextjs-vite';

const theme = createTheme({});

const withMantineProvider = (Story: React.ComponentType): ReactElement => (
  <MantineProvider theme={theme}>
    <Story />
  </MantineProvider>
);

const preview: Preview = {
  decorators: [withMantineProvider],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'error' },
  },
};

export default preview;
