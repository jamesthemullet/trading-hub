import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSearchRedirectList } from '@/libs/hooks';
import { returnedRedirectMock } from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import RedirectRuleSets from './index.page';

jest.mock('@/libs/hooks/search/redirect/use-redirect-list', () => ({
  useSearchRedirectList: jest.fn(),
}));

describe('Search Rulesets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('displays the list of redirects', () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
    });

    renderWithProviders(<RedirectRuleSets />);

    expect(screen.getByText('Keyword Redirect')).toBeVisible();
  });

  it('should search', async () => {
    const mockKeywords = ['search', 'terms'];
    const user = userEvent.setup();
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
    });
    renderWithProviders(<RedirectRuleSets />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await user.type(search, mockKeywords[0]);

    await waitFor(() =>
      expect(useSearchRedirectList).toHaveBeenCalledWith(mockKeywords[0], 0, 10)
    );
  });
});
