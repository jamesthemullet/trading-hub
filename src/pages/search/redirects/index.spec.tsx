import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSearchRedirectList } from '@/libs/hooks';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import RedirectRuleSets from './index.page';

jest.mock('@/libs/hooks/search/redirect/use-redirect-list', () => ({
  useSearchRedirectList: jest.fn(),
}));

const mockUpdateRedirect = jest.fn();
jest.mock('@/libs/hooks/search/redirect/use-redirect-update', () => ({
  useRedirectUpdate: () => {
    return { updateRedirect: mockUpdateRedirect, isSaving: true };
  },
}));

const mockRedirectDelete = jest.fn();
jest.mock('@/libs/hooks/search/redirect/use-redirect-delete', () => ({
  useRedirectDelete: () => {
    return { deleteRedirect: mockRedirectDelete };
  },
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
      setKeywordList: jest.fn(),
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
      setKeywordList: jest.fn(),
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

  it('should enable or disable a redirect', async () => {
    const mockId = returnedRedirectMock.id;
    const mockKeywords = ['search', 'terms'];

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRedirect).toHaveBeenCalledWith({
      redirectId: mockId,
      redirect: {
        ...returnedRedirectMock,
        isEnabled: false,
        keywords: mockKeywords,
      },
    });
  });

  it('should delete a ruleset', async () => {
    const mockId = returnedRedirectMock.id;
    const mockKeywords = ['search', 'terms'];

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

    const user = userEvent.setup();

    const rulesetDropdown = screen.getAllByTitle('More options');

    await user.click(rulesetDropdown[0]);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).toBeVisible();
    });

    await user.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).not.toBeVisible();
    });

    await user.click(screen.getByLabelText('Delete rule'));
    expect(mockRedirectDelete).toHaveBeenCalledWith({ redirectId: mockId });
  });
});
