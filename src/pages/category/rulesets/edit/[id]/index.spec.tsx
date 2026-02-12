import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { useRuleSetDetail } from '@/libs/hooks/category/rulesets/use-rule-set-detail';
import { useAttributes } from '@/libs/hooks/use-attributes';
import { useCategoryProductSearch } from '@/libs/hooks/use-category-product-search';
import { useGetCategories } from '@/libs/hooks/use-get-categories';
import { useUpdateRuleSet } from '@/libs/hooks/use-rule-set-update';
import {
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));
jest.mock('@/libs/hooks/category/rulesets/use-rule-set-detail', () => ({
  useRuleSetDetail: jest.fn(),
}));
jest.mock('@/libs/hooks/use-rule-set-update', () => ({
  useUpdateRuleSet: jest.fn(),
}));
jest.mock('@/libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('@/libs/hooks/use-attributes', () => ({
  useAttributes: jest.fn(),
}));
jest.mock('@/libs/hooks/category/history/use-category-history', () => ({
  useCategoryHistory: jest.fn(() => ({
    history: { changes: [] },
    isLoading: false,
    error: '',
  })),
}));

describe('Index', () => {
  const mockUpdateRuleSet = {
    updateCategoryRuleSet: jest.fn(() =>
      Promise.resolve({
        status: 'success',
      })
    ),
    isSaving: true,
    error: '',
  };

  const mockCategoryProductSearch = {
    searchForProduct: jest.fn(() => {
      return Promise.resolve({
        products: [],
        pagination: {
          totalItems: 0,
        },
      });
    }),
    error: '',
    isLoading: false,
  };

  const mockRouter = {
    push: jest.fn(),
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.mocked(useUpdateRuleSet).mockImplementation(() => mockUpdateRuleSet);
    jest
      .mocked(useCategoryProductSearch)
      .mockImplementation(() => mockCategoryProductSearch);
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('shows a loader', async () => {
    const mockResponse = {
      ...mockUseRuleSetPreviewData,
      isLoading: true,
      isSaving: false,
    };
    const mockUpdateRuleSet = {
      updateCategoryRuleSet: jest.fn(),
      isSaving: false,
      error: '',
    };
    jest.mocked(useUpdateRuleSet).mockImplementation(() => mockUpdateRuleSet);

    jest.mocked(useRuleSetDetail).mockImplementation(() => mockResponse);
    jest.mocked(useAttributes).mockImplementation(() => ({
      attributes: [],
      fetchError: '',
    }));

    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('opens attributes tab', async () => {
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockUseRuleSetPreviewData);
    jest.mocked(useAttributes).mockImplementation(() => ({
      attributes: [],
      fetchError: '',
    }));

    renderWithProviders(<Page id={ruleSetId} />);

    const tab2 = await screen.findByText('Attribute');

    act(() => {
      tab2.click();
    });

    expect(
      screen.getByRole('button', { name: 'Create new attribute rule' })
    ).toBeVisible();
  });

  it('should save ruleset', async () => {
    jest.mocked(useRuleSetDetail).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      ruleSetDetail: {
        ...mockUseRuleSetPreviewData.ruleSetDetail,
        startDate: '2024-09-12T14:17:54Z',
        endDate: '2024-12-19T04:20:03Z',
      },
    }));

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet.updateCategoryRuleSet).toHaveBeenCalled();
  });

  it('should render the access denied page', async () => {
    jest.mocked(useRuleSetDetail).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      ruleSetDetail: {
        ...mockUseRuleSetPreviewData.ruleSetDetail,
        startDate: '2024-09-12T14:17:54Z',
        endDate: '2024-12-19T04:20:03Z',
      },
    }));

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

  it('should save country change to a ruleset', async () => {
    jest.mocked(useRuleSetDetail).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      ruleSetDetail: {
        ...mockUseRuleSetPreviewData.ruleSetDetail,
        countryCode: 'UK_IE',
      },
    }));

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'Select country',
    });

    await user.click(dropdownButton);

    const irelandOption = screen.getByRole('menuitemradio', {
      name: 'IE market only',
    });
    await user.click(irelandOption);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet.updateCategoryRuleSet).toHaveBeenCalledWith({
      countryCode: 'IE',
      categoryIds: ['SubCategory_428'],
      isEnabled: false,
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
      facets: [
        {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          boosted: ['test include'],
          excludedValues: ['test exclude'],
        },
        {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        },
        {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          boosted: [],
          excludedValues: [],
        },
      ],
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      rules: {
        pinnedProducts: [{ id: 'a1' }],
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
    });
  });

  it('should cancel changes to a ruleset', async () => {
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockUseRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/category');
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

  it('should show errors', async () => {
    const mockUpdateRuleSet = {
      updateCategoryRuleSet: jest.fn(() =>
        Promise.resolve({
          status: 'fail',
        })
      ),
      isSaving: true,
      error: 'Failed to fetch',
    };
    jest.mocked(useUpdateRuleSet).mockImplementation(() => mockUpdateRuleSet);

    renderWithProviders(<Page id={ruleSetId} />);

    expect(await screen.findByText('Error: Unknown error')).toBeVisible();
  });

  describe('History view', () => {
    const mockHistoryChange = {
      id: 'history-change-id',
      entityId: 'entity-id',
      savedAt: '2024-01-01T00:00:00Z',
      savedBy: 'test-user',
      schemaVersion: '1',
      change: {
        ...mockUseRuleSetPreviewData.ruleSetDetail,
        id: 'historical-ruleset-id',
      },
    };

    beforeEach(() => {
      jest.mocked(useRuleSetDetail).mockImplementation(() => ({
        ruleSetDetail: mockUseRuleSetPreviewData.ruleSetDetail,
        isLoading: false,
        error: '',
        refreshRuleset: jest.fn(),
      }));
      jest.mocked(useAttributes).mockImplementation(() => ({
        attributes: [],
        fetchError: '',
        isLoading: false,
      }));
    });

    it('should render ruleset from history when history query param is true', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useCategoryHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

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

      jest.mocked(useCategoryHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

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

      jest.mocked(useCategoryHistory).mockReturnValue({
        history: { changes: [] },
        isLoading: true,
        error: '',
      });

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

      jest.mocked(useCategoryHistory).mockReturnValue({
        history: { changes: [] },
        isLoading: false,
        error: 'Failed to load history',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('should not render ruleset when historyId does not match any change', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'non-existent-id' },
      });

      jest.mocked(useCategoryHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.queryByRole('button', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });
  });
});
