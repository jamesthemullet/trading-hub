import { Screen, act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent, { UserEvent } from '@testing-library/user-event';

jest.mock('../../hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));
jest.mock('../../hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

import { Ruleset } from './ruleset';
import { useGetCategories } from '../../hooks/use-get-categories';
import { useCategoryPreview } from '../../hooks/use-category-preview';
import { useCategoryProductSearch } from '../../hooks/use-category-product-search';

const CATEGORY_SEARCH_PLACEHOLDER_TEXT = 'Search...';
const PRODUCT_SEARCH_PLACEHOLDER_TEXT = 'Search for product';
const SAVE_BUTTON = 'Save';

const categoryId1 = 'cat_123';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
const product1Id = 'a1';
const product2Id = 'b2';
const product3Id = 'c2';
const product1Title = 'first product';
const product2Title = 'second product';
const product3Title = 'third product';
const product1Brand = 'Monsoon';
const product2Brand = 'M&S';
const product1Price = '£5';
const product2Price = '£10';
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
  ],
  pagination: { totalItems: 20 },
};
const mockProduct = {
  id: 'productId',
  title: 'productTitle',
  imageUrl: ['example.jpg'],
  brand: 'productBrand',
  metadata: { isPinned: false },
  isInStock: true,
  price: 'productPrice',
  rating: 4.5,
  url: '',
};

const selectCategory = async (screen: Screen, user: UserEvent) => {
  await user.type(
    screen.getByPlaceholderText(CATEGORY_SEARCH_PLACEHOLDER_TEXT),
    'SubCategory_507{enter}'
  );

  const categoryToSelect = await screen.findByText(
    `${categoryId1} | ${categoryName1} | ${categoryPath1}`
  );

  act(() => {
    categoryToSelect.click();
  });
};

describe('Ruleset', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
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
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      ...mockCategoryProductSearch,
      handleGet: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: product1Id,
              title: product1Title,
              imageUrl: ['example1.jpg'],
              brand: product1Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product1Price,
              rating: 4.5,
              url: '',
            },
            {
              id: product2Id,
              title: product2Title,
              imageUrl: ['example2.jpg'],
              brand: product2Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product2Price,
              rating: 5,
              url: '',
            },
            {
              id: product3Id,
              title: product3Title,
              imageUrl: ['example.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£10',
              rating: 4.5,
              url: '',
            },
          ],
          pagination: {
            totalItems: 3,
          },
        });
      }),
    }));

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });

    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryPreview: [mockProduct, { ...mockProduct, id: 'product2' }],
      error: '',
      refetchRuleSetPreview: jest.fn(),
    });
  });

  it('should render correctly', () => {
    render(<Ruleset onSave={jest.fn()} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should select a category', async () => {
    const user = userEvent.setup();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onSave={jest.fn()} />);

    await selectCategory(screen, user);

    expect(screen.getByText(categoryId1)).toBeVisible();
  });

  it('should create a new ruleset', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onCreate={mockCreate} />);

    await selectCategory(screen, user);

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: categoryId1 })
    );
  });

  it('should edit a ruleset', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(
      <Ruleset
        onSave={mockSave}
        rulesetCategory={{
          identifier: categoryId1,
          name: categoryName1,
          path: categoryPath1,
        }}
        rulesetMerchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        }}
        rulesetId={ruleSetId}
      />
    );

    await user.click(screen.getAllByTitle('Open menu')[0]);

    await user.click(screen.getByText('Boost to Top'));

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: categoryId1 })
    );
  });

  it('should not save changes with no category selected', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onSave={mockSave} />);

    await selectCategory(screen, user);

    const clearButton = screen.getByLabelText('Remove selected category');

    act(() => {
      clearButton.click();
    });

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('searches for products', async () => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    const user = userEvent.setup({ delay: null });

    render(
      <Ruleset
        onSave={jest.fn()}
        rulesetCategory={{
          identifier: categoryId1,
          name: categoryName1,
          path: categoryPath1,
        }}
        rulesetMerchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        }}
        rulesetId={ruleSetId}
      />
    );

    await user.type(
      screen.getByPlaceholderText(PRODUCT_SEARCH_PLACEHOLDER_TEXT),
      '123'
    );

    expect(screen.getByText('3 results')).toBeVisible();
  });

  it('does not search for products when no category selected', async () => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    const user = userEvent.setup({ delay: null });

    render(<Ruleset onSave={jest.fn()} />);

    await user.type(
      screen.getByPlaceholderText(PRODUCT_SEARCH_PLACEHOLDER_TEXT),
      '123'
    );

    expect(screen.getByText('0 results')).toBeVisible();
  });

  it('should show and close preview', async () => {
    const user = userEvent.setup({ delay: null });

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onSave={jest.fn()} />);

    await selectCategory(screen, user);

    const previewButton = screen.getByText('Preview');

    act(() => {
      previewButton.click();
    });

    expect(
      screen.getByText('Search across the site to preview the rule influence')
    ).toBeInTheDocument();

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });

    expect(
      screen.queryByText('Search across the site to preview the rule influence')
    ).not.toBeInTheDocument();
  });

  it('should handle position change when product is selected from product search', async () => {
    const user = userEvent.setup();
    const productSearchTitle = 'productSearchTitle';

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryPreview: [
        {
          id: 'product-id-1',
          title: productSearchTitle,
          imageUrl: ['example1.jpg'],
          brand: product1Brand,
          metadata: { isPinned: false },
          isInStock: true,
          price: product1Price,
          rating: 4.5,
          url: '',
        },
      ],
      error: '',
      refetchRuleSetPreview: jest.fn(),
    });

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      handleGet: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: 'product-id-2',
              title: productSearchTitle,
              imageUrl: ['example2.jpg'],
              brand: product1Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product1Price,
              rating: 4.5,
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
      error: '',
    });

    render(
      <Ruleset
        onSave={jest.fn()}
        rulesetCategory={{
          identifier: categoryId1,
          name: categoryName1,
          path: categoryPath1,
        }}
        rulesetMerchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        }}
        rulesetId={ruleSetId}
      />
    );

    // expect to see 1 product in the visual editor
    expect(screen.getByLabelText('Position 1')).toBeVisible();
    expect(screen.queryByLabelText('Position 2')).toBeNull();

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    const menuButton = screen
      .getByLabelText('Product Search Container')
      .querySelector('button[title="Open menu"]');

    act(() => {
      if (menuButton) {
        user.click(menuButton);
      }
    });

    const pinToPositionButton = await screen.findByText('Pin in position#');

    act(() => {
      user.click(pinToPositionButton);
    });

    const input = await screen.findByPlaceholderText('i.e. 3');

    await user.type(input, '1');

    const confirmButton = screen.getByText('Confirm');

    act(() => {
      user.click(confirmButton);
    });

    // expect to see 2 products in the visual editor
    expect(await screen.findByLabelText('Position 1')).toBeVisible();
    expect(await screen.findByLabelText('Position 2')).toBeVisible();
  });

});
