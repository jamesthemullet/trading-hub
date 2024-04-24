import { act, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  useCategoryProductSearch,
  useRuleSetPreview,
  useUpdateRuleSet,
  useGetCategories,
  useAttributes,
} from '@/libs/hooks';

import type { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';
import { renderWithProviders } from '@/test/render-with-providers';
import {
  categoryId,
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-rule-set-preview', () => ({
  useRuleSetPreview: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-update-rule-set', () => ({
  useUpdateRuleSet: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-attributes', () => ({
  useAttributes: jest.fn(),
}));

describe('Index', () => {
  const mockUpdateRuleSet = {
    updateRuleSet: jest.fn(() =>
      Promise.resolve({
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: { numeric: [], alphanumeric: [], product: [] },
          buries: { numeric: [], alphanumeric: [], product: [] },
        },
        categoryId: categoryId,
        isEnabled: true,
        categoryName: 'Jeans',
        id: ruleSetId,
        lastChanged: { date: '2024-01-02T22:10:17Z', user: 'M&S' },
      })
    ),
    error: '',
  };

  const mockCategoryProductSearch = {
    handleGet: jest.fn(() => {
      return Promise.resolve({
        products: [],
        pagination: {
          totalItems: 0,
        },
      });
    }),
    error: '',
  };

  const mockRouter = {
    push: jest.fn(),
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

  it('opens attributes tab', async () => {
    jest
      .mocked(useRuleSetPreview)
      .mockImplementation(() => mockUseRuleSetPreviewData);
    jest.mocked(useAttributes).mockImplementation(() => ({
      attributes: [],
    }));

    renderWithProviders(<Page id={ruleSetId} />);

    const tab2 = await screen.findByText('Attribute');

    act(() => {
      tab2.click();
    });

    expect(screen.getByText('Create new attribute rule')).toBeVisible();
  });

  it('should save ruleset', async () => {
    jest
      .mocked(useRuleSetPreview)
      .mockImplementation(() => mockUseRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Save'));

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalled();
  });

  it('should cancel changes to a ruleset', async () => {
    jest
      .mocked(useRuleSetPreview)
      .mockImplementation(() => mockUseRuleSetPreviewData);

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Cancel'));

    expect(mockRouter.push).toHaveBeenCalledWith('/rules');
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
});
