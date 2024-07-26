import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useCategoryAttributes,
  useCategoryProductSearch,
  useGetCategories,
  useRuleSetPreview,
  useUpdateRuleSet,
} from '@/libs/hooks';
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
jest.mock('../../../../../libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));
jest.mock('../../../../../libs/hooks/use-rule-set-preview', () => ({
  useRuleSetPreview: jest.fn(),
}));
jest.mock('../../../../../libs/hooks/use-rule-set-update', () => ({
  useUpdateRuleSet: jest.fn(),
}));
jest.mock('../../../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('../../../../../libs/hooks/use-category-attributes', () => ({
  useCategoryAttributes: jest.fn(),
}));

describe('Index', () => {
  const mockUpdateRuleSet = {
    updateRuleSet: jest.fn(() =>
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
    jest.mocked(useCategoryAttributes).mockImplementation(() => ({
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

    expect(mockRouter.push).toHaveBeenCalledWith('/category/rulesets');
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
      updateRuleSet: jest.fn(() =>
        Promise.resolve({
          status: 'fail',
        })
      ),
      isSaving: true,
      error: 'Failed to fetch',
    };
    jest.mocked(useUpdateRuleSet).mockImplementation(() => mockUpdateRuleSet);

    render(<Page id={ruleSetId} />);

    expect(await screen.findByText('Error: Unknown error')).toBeVisible();
  });
});
