import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

export function renderWithProviders(ui: React.ReactNode) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider>{children}</MantineProvider>
    ),
  });
}
