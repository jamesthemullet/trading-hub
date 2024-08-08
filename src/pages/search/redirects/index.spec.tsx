import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import RedirectRuleSets from './index.page';

describe('Search Rulesets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('displays the list of redirects', () => {
    renderWithProviders(<RedirectRuleSets />);

    expect(screen.getByText('Keyword Redirect')).toBeVisible();
  });
});
