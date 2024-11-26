import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { useRedirectCreate, useSearchRedirectList } from '@/libs/hooks';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import RedirectRuleSets from './index.page';

const mockRefetchRedirectList = jest.fn();
const mockRedirectDelete = jest.fn();
const mockUpdateRedirect = jest.fn();

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useSearchRedirectList: jest.fn(),
  useRedirectDelete: () => {
    return { deleteRedirect: mockRedirectDelete };
  },
  useRedirectUpdate: () => {
    return { updateRedirect: mockUpdateRedirect, isSaving: true };
  },
  useRedirectCreate: jest.fn(),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Search Rulesets', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockNewRuleset = 'foo123';
  const createRedirect = jest.fn().mockResolvedValue({ id: mockNewRuleset });

  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useRedirectCreate).mockReturnValue({
      createRedirect,
      isSaving: false,
      error: '',
    });
  });

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

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

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

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Create a duplicate redirect rule',
        })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Duplicate rule',
    });
    await user.click(confirmButton);
    expect(createRedirect).toHaveBeenCalledWith({
      redirect: {
        destinationUrl: 'l/women/dresses',
        endDate: '2024-08-01T09:37:06.109Z',
        id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
        isEnabled: false,
        keywords: ['search', 'terms'],
        lastChanged: {
          date: '2024-08-01T09:37:06.109Z',
          user: 'Jo Smith',
        },
        ruleTitle: 'title of redirect',
        startDate: '2024-08-01T09:37:06.109Z',
        type: 'redirectTerm',
      },
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/search/redirects/edit/${mockNewRuleset}`
    );
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

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).not.toBeVisible();
    });

    await user.click(screen.getByLabelText('Delete rule'));
    expect(mockRedirectDelete).toHaveBeenCalledWith({ redirectId: mockId });
  });

  it('should display scheduling column', () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [
        {
          ...returnedRedirectMock,
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasIreland: false, hasMultipleCategories: false }}
      >
        <RedirectRuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('should display country flag and filter if Ireland feature flag is enabled', () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [
        {
          ...returnedRedirectMock,
          countryCode: 'IE',
        },
      ],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasIreland: true, hasMultipleCategories: false }}
      >
        <RedirectRuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByAltText('IE rule')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'All marksandspencer.com' })
    ).toBeVisible();
  });

  it('should not display country flag or filter if Ireland feature flag is not enabled', () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasIreland: false, hasMultipleCategories: false }}
      >
        <RedirectRuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.queryByAltText('IE rule')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'All marksandspencer.com' })
    ).not.toBeInTheDocument();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    const user = userEvent.setup();
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: mockRefetchRedirectList,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasIreland: true, hasMultipleCategories: false }}
      >
        <RedirectRuleSets />
      </FeatureFlagContext.Provider>
    );

    const dropdown = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await user.click(dropdown);

    const showUK = screen.getByText('UK only marksandspencer');
    await user.click(showUK);

    expect(mockRefetchRedirectList).toHaveBeenCalledWith({ countryCode: 'UK' });
    expect(
      screen.getByRole('button', { name: 'UK only marksandspencer' })
    ).toBeVisible();

    const showIE = screen.getByText('IE only marksandspencer');
    await userEvent.click(showIE);

    expect(mockRefetchRedirectList).toHaveBeenCalledWith({ countryCode: 'IE' });
    expect(
      screen.getByRole('button', { name: 'IE only marksandspencer' })
    ).toBeVisible();
  });
});
