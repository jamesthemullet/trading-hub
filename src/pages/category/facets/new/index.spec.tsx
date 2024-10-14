import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetCategories, useRuleSetCreate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import NewFacetRuleset from './index.page';

const categoryId1 = 'cat_123';
const categoryId2 = 'cat_456';
const categoryName1 = 'jeans';
const categoryName2 = 'dresses';
const categoryPath1 = 'l/jeans';
const categoryPath2 = 'l/women/dresses';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetCreate: jest.fn(),
  useGetCategories: jest.fn(),
}));

const logSpy = jest.spyOn(console, 'log');
logSpy.mockImplementation(jest.fn());

const INPUT_PLACEHOLDER_TEXT = 'Search...';
const NEW_RULE_BUTTON_TEXT = 'Create';

const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId2,
      name: categoryName2,
      path: categoryPath2,
    },
  ],
  pagination: { totalItems: 20 },
};

describe('Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render category ruleset facet editor', async () => {
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });
    renderWithProviders(<NewFacetRuleset />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewFacetRuleset />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup();
    const createRuleset = jest.fn().mockResolvedValue({});
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset,
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      submit.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();
    expect(createRuleset).toHaveBeenCalledWith({
      categoryId: 'cat_123',
      facets: [],
      isEnabled: true,
      merchandisingRules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });
});
