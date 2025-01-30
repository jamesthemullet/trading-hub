import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

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

describe('Search ranking rules', () => {
  const mockUpdateRuleSet = {
    updateRuleSet: jest.fn(() =>
      Promise.resolve({
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
        searchTerms: ['foo', 'bar'],
        isEnabled: true,
        categoryName: 'Jeans',
        id: ruleSetId,
        categoriesInfo: [
          {
            id: ruleSetId,
          },
        ],
        lastChanged: { date: '2024-01-02T22:10:17Z', user: 'M&S' },
      })
    ),
    isSaving: true,
    error: '',
  };

  const mockRouter = {
    push: jest.fn(),
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

    expect(mockRouter.push).toHaveBeenCalledWith('/search/rulesets');
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
    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalled();
  });
});
