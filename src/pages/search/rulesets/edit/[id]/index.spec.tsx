import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';
import { useSearchRuleSetPreview } from '@/libs/hooks/search/ruleset/use-search-ruleset-preview';
import { useSearchRuleSetUpdate } from '@/libs/hooks/search/ruleset/use-search-ruleset-update';
import { usePreview } from '@/libs/hooks/use-preview';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { mockUseSearchRuleSetPreviewData } from '@/test/data/mock-use-search-ruleset-preview';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/search/ruleset/use-search-ruleset-preview', () => ({
  ...jest.requireActual(
    '@/libs/hooks/search/ruleset/use-search-ruleset-preview'
  ),
  useSearchRuleSetPreview: jest.fn(),
}));
jest.mock('@/libs/hooks/search/ruleset/use-search-ruleset-update', () => ({
  ...jest.requireActual(
    '@/libs/hooks/search/ruleset/use-search-ruleset-update'
  ),
  useSearchRuleSetUpdate: jest.fn(),
}));
jest.mock('@/libs/hooks/use-preview', () => ({
  ...jest.requireActual('@/libs/hooks/use-preview'),
  usePreview: jest.fn(),
}));
jest.mock('@/libs/hooks/search/history/use-search-history', () => ({
  useSearchHistory: jest.fn(() => ({
    history: { changes: [], pagination: { totalItems: 0 } },
    isLoading: false,
    error: '',
  })),
}));

describe('Search ranking rules', () => {
  const mockUpdateRuleSet = {
    updateRuleSet: jest.fn(() =>
      Promise.resolve({ status: 'success' as const })
    ),
    isSaving: true,
    error: '',
  };

  const mockRouter = {
    push: jest.fn(),
    reload: jest.fn(),
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeAll(() => {
    jest.mocked(usePreview).mockReturnValue({
      data: {
        products: [],
        facets: [],
        category: '123',
        ruleSet: {
          facets: [],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
        },
        externalChanges: {
          pinnedProducts: [],
          boosts: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          buries: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
        },
        pagination: {
          totalItems: 1,
        },
      },
      error: '',
      isLoading: false,
      setFacetConfigRules: jest.fn(),
    });
    jest
      .mocked(useSearchRuleSetUpdate)
      .mockImplementation(() => mockUpdateRuleSet);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders', async () => {
    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);

    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByText('Search Keywords')).toBeVisible();
  });

  it('should render the access denied page', async () => {
    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);
    renderWithProviders(<Page id={ruleSetId} />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should cancel changes to a ruleset', async () => {
    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/search');
  });

  it('should show an error', async () => {
    const errorMessage = 'my error message';
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      error: errorMessage,
    }));

    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });

  it('should save ruleset', async () => {
    const mockStartDate = '2024-09-12T14:17:54Z';
    const mockEndDate = '2024-12-19T04:20:03Z';
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      ruleSet: {
        ...mockUseSearchRuleSetPreviewData.ruleSet,
        startDate: mockStartDate,
        endDate: mockEndDate,
      },
    }));

    const user = userEvent.setup({ delay: null });

    const expectedData = {
      countryCode: 'UK_IE',
      excludedFacets: {
        facets: [{ id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88' }],
      },
      facets: [
        {
          boosted: ['Pink', 'Navy', 'Grey', 'Blue', 'Green'],
          excludedValues: ['Brown'],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        },
        {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
        },
      ],
      isEnabled: false,
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      rules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [{ id: 'a1' }],
      },
      searchTerms: ['foo', 'bar'],
      startDate: mockStartDate,
      endDate: mockEndDate,
    };

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenLastCalledWith(
      expectedData
    );
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    const currentEntity = {
      ...mockUseSearchRuleSetPreviewData.ruleSet,
      version: 7,
      searchTerms: ['foo', 'bar'],
      lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
    };
    const updateRuleSet = jest.fn(() =>
      Promise.resolve({ status: 'conflict' as const, currentEntity })
    );
    jest.mocked(useSearchRuleSetUpdate).mockImplementation(() => ({
      updateRuleSet,
      isSaving: false,
      error: '',
    }));
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      ruleSet: { ...mockUseSearchRuleSetPreviewData.ruleSet, version: 3 },
    }));

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(updateRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ version: 3 })
    );
    expect(
      await screen.findByRole('dialog', {
        name: 'This keyword ruleset was changed by someone else',
      })
    ).toBeInTheDocument();
  });

  it('surfaces an update error and does not navigate when the save fails', async () => {
    jest.mocked(useSearchRuleSetUpdate).mockImplementation(() => ({
      updateRuleSet: jest.fn(() =>
        Promise.resolve({ status: 'error' as const })
      ),
      isSaving: false,
      error: 'Failed to update ruleset',
    }));
    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to update ruleset'
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  describe('History view', () => {
    const mockHistoryChange = {
      id: 'history-change-id',
      entityId: 'entity-id',
      savedAt: '2024-01-01T00:00:00Z',
      savedBy: 'test-user',
      schemaVersion: '1',
      change: {
        ...mockUseSearchRuleSetPreviewData.ruleSet,
        id: 'historical-ruleset-id',
      },
    };

    beforeEach(() => {
      jest
        .mocked(useSearchRuleSetUpdate)
        .mockImplementation(() => mockUpdateRuleSet);
      jest.mocked(useSearchHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: '',
      });
    });

    it('should render ruleset from history when history query param is true', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useSearchHistory).mockReturnValue({
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
        isLoading: false,
        error: '',
      });

      jest
        .mocked(useSearchRuleSetPreview)
        .mockImplementation(() => mockUseSearchRuleSetPreviewData);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('should disable write access when viewing history', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useSearchHistory).mockReturnValue({
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
        isLoading: false,
        error: '',
      });

      jest
        .mocked(useSearchRuleSetPreview)
        .mockImplementation(() => mockUseSearchRuleSetPreviewData);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('should show loader when history is loading', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useSearchHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: true,
        error: '',
      });

      jest
        .mocked(useSearchRuleSetPreview)
        .mockImplementation(() => mockUseSearchRuleSetPreviewData);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.getAllByLabelText('loading content').length
      ).toBeGreaterThan(0);
    });

    it('should show history error when present', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useSearchHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: 'Failed to load history',
      });

      jest
        .mocked(useSearchRuleSetPreview)
        .mockImplementation(() => mockUseSearchRuleSetPreviewData);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('should not render ruleset when historyId does not match any change', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'non-existent-id' },
      });

      jest.mocked(useSearchHistory).mockReturnValue({
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
        isLoading: false,
        error: '',
      });

      jest
        .mocked(useSearchRuleSetPreview)
        .mockImplementation(() => mockUseSearchRuleSetPreviewData);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.queryByRole('button', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });
  });
});
