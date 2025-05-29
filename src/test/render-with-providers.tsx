import { render as testingLibraryRender } from '@testing-library/react';
import { createTheme, MantineProvider, Portal } from '@mantine/core';
import { SessionProvider } from 'next-auth/react';
import {
  defaultFeatureFlags,
  FeatureFlagContext,
  FeatureFlags,
} from '../libs/components/context/feature-flag';

const theme = createTheme({
  components: {
    Portal: Portal.extend({
      defaultProps: {
        reuseTargetNode: false,
      },
    }),
  },
});

export function renderWithProviders(
  ui: React.ReactNode,
  roles: string[] = ['Cat.W', 'Search.W', 'Glob.W'],
  ctx:
    | {
        featureFlags: Partial<FeatureFlags>;
      }
    | undefined = {
    featureFlags: defaultFeatureFlags,
  }
) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <SessionProvider
        session={{
          user: {
            id: 'userId',
            email: 'user@mns.com',
          },
          accessTokenExpires: 123,
          expires: '2024-09-30T14:00:00.000Z',
          roles,
        }}
      >
        <FeatureFlagContext.Provider
          value={{ ...defaultFeatureFlags, ...ctx.featureFlags }}
        >
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </FeatureFlagContext.Provider>
      </SessionProvider>
    ),
  });
}
