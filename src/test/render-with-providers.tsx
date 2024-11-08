import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import {
  defaultFeatureFlags,
  FeatureFlagContext,
  type FeatureFlags,
} from '@/libs/components/context/feature-flag';

export function renderWithProviders(
  ui: React.ReactNode,
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
      <FeatureFlagContext.Provider
        value={{ ...defaultFeatureFlags, ...ctx.featureFlags }}
      >
        <MantineProvider>{children}</MantineProvider>
      </FeatureFlagContext.Provider>
    ),
  });
}
