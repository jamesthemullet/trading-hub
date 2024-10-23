import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetCategories, useRuleSetCreate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import RuleSetCreate from './index.page';

const categoryId1 = 'cat_123';
const categoryId2 = 'cat_456';
const categoryName1 = 'jeans';
const categoryName2 = 'dresses';
const categoryPath1 = 'l/jeans';
const categoryPath2 = 'l/women/dresses';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-rule-set-create', () => ({
  useRuleSetCreate: jest.fn(),
}));
jest.mock('../../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

const INPUT_PLACEHOLDER_TEXT = 'Search...';
const NEW_RULE_BUTTON_TEXT = 'Create';
const REMOVE_SELECTED_CATEGORY_BUTTON = 'Remove selected category';
const MOCK_CATEGORY_ID = '20';

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
const mockRouter = {
  push: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
};

describe('Index', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders', () => {
    render(<RuleSetCreate />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Product Grid'
    );
  });

  it('stores input value', async () => {
    const user = userEvent.setup();
    render(<RuleSetCreate />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507{enter}'
    );

    expect(screen.getByDisplayValue('SubCategory_507')).toBeVisible();
  });

  it('clears category search results', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(() =>
        Promise.resolve({
          id: MOCK_CATEGORY_ID,
          categoryName: "Men's shirts",
          categoryId: 'foo',
          categoriesInfo: [
            {
              id: 'foo',
            },
          ],
          isEnabled: true,
          rules: {
            pinnedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            blockedProducts: [],
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
        })
      ),
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    render(<RuleSetCreate />);

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

    const clear = await screen.findByLabelText(REMOVE_SELECTED_CATEGORY_BUTTON);
    act(() => {
      clear.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT)
    ).toHaveTextContent('');
  });

  it('creates a new rule set and redirects to the edit page', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(() =>
        Promise.resolve({
          id: MOCK_CATEGORY_ID,
          categoryName: "Men's shirts",
          categoryId: 'foo',
          categoriesInfo: [
            {
              id: 'foo',
            },
          ],
          isEnabled: true,
          rules: {
            pinnedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            blockedProducts: [],
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
        })
      ),
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    render(<RuleSetCreate />);

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
    expect(mockRouter.push).toHaveBeenCalledWith('/category/rulesets');
  });

  it('cancels new ruleset creation', async () => {
    renderWithProviders(<RuleSetCreate />);

    const cancel = await screen.findByText('Cancel');

    act(() => {
      cancel.click();
    });

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith(`/category/rulesets`);
  });

  it('creates a new rule set and does not redirect if no id given for the edit page', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(() => Promise.resolve(undefined)),
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    render(<RuleSetCreate />);

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
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
