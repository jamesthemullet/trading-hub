import '@testing-library/jest-dom';

import type { Screen } from '@testing-library/react';
import { act, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type {
  MerchandisingBoostsBuries,
  MerchandisingRules,
  MerchandisingSearchPreviewResponseBeta,
} from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks/use-category-product-search';
import { useGetCategories } from '@/libs/hooks/use-get-categories';
import { usePreview } from '@/libs/hooks/use-preview';
import * as analytics from '@/libs/hooks/utils/analytics';
import { boostMock, buriesMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';
import { renderWithProviders } from '@/test/render-with-providers';

import { Ruleset } from './ruleset';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('@/libs/hooks/use-preview', () => ({
  usePreview: jest.fn(),
}));
jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));
jest.mock('@/libs/hooks/use-attributes', () => ({
  useAttributes: ({ type }: { type: string }) => {
    if (type === 'alphanumeric') {
      return {
        attributes: [
          {
            type: 'alphanumeric',
            name: 'Colour',
            values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
          },
          {
            type: 'alphanumeric',
            name: 'Brand',
            values: [{ value: 'Nike' }, { value: 'Adidas' }, { value: 'Puma' }],
          },
          {
            type: 'alphanumeric',
            name: 'Category',
            values: [
              { value: 'Shoes' },
              { value: 'Clothing' },
              { value: 'Accessories' },
            ],
          },
        ],
      };
    }
    return {
      attributes: [
        {
          type: 'numeric',
          name: 'Size',
          values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
        },
        {
          type: 'numeric',
          name: 'Price',
          values: [
            { value: '0-50' },
            { value: '50-100' },
            { value: '100-200' },
            { value: '200+' },
          ],
        },
      ],
    };
  },
}));

jest.mock('@/libs/hooks/utils/analytics', () => {
  return {
    track: jest.fn(),
  };
});
const analyticsSpy = jest.spyOn(analytics, 'track');

const CATEGORY_SEARCH_PLACEHOLDER_TEXT = 'Search...';
const PRODUCT_SEARCH_PLACEHOLDER_TEXT = 'Search for product';
const SAVE_BUTTON = 'Save';
const CREATE_BUTTON = 'Create';
const CANCEL_BUTTON = 'Cancel';
const CONFIRM_BUTTON = 'Close without saving';

const categoryId1 = 'cat_123';
const categoryId3 = 'IE_cat_456';
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
const mockRouterEvents = {
  emit: jest.fn(),
  off: jest.fn(),
  on: jest.fn(),
};
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId3,
      name: categoryName1,
      path: categoryPath1,
    },
  ],
  pagination: { totalItems: 20 },
};
const mockProduct = {
  id: 'productId',
  productId: 'productId',
  title: 'productTitle',
  imageUrl: ['example.jpg'],
  brand: 'productBrand',
  metadata: { isPinned: false },
  isInStock: true,
  price: 'productPrice',
  url: '',
};

const mockMerchandisingRules = {
  pinnedProducts: [{ id: 'productId' }],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  blockedProducts: [],
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

const mockData: MerchandisingSearchPreviewResponseBeta = {
  category: categoryId1,
  externalChanges: mockMerchandisingRulesWithInfo,
  facets: [],
  pagination: {
    totalItems: 1,
  },
  ruleSet: {
    facets: [],
    rules: mockMerchandisingRulesWithInfo,
  },
  products: [],
};

const mockCategoryReturnValue = {
  data: {
    ...mockData,
    products: [
      mockProduct,
      {
        ...mockProduct,
        id: 'product2',
        title: 'productTitle2',
        productId: 'productId2',
        metadata: { isPinned: false, isBoosted: true },
      },
    ],
    ruleSet: {
      ...mockData.ruleSet,
      rules: {
        ...mockMerchandisingRules,
        pinnedProducts: [mockProduct],
      },
    },
  },
  error: '',
  isLoading: false,
  setFacetConfigRules: jest.fn(),
};

const mockCategoriesInfo = [
  { id: categoryId1, name: categoryName1, plpUrl: categoryPath1 },
];

const mockCategoriesInfo507 = [
  {
    id: 'SubCategory_507',
    name: 'dresses',
    plpUrl: 'c/dresses',
  },
];

const selectCategory = async (screen: Screen, user: UserEvent) => {
  const modalButton = await screen.findByRole('button', {
    name: 'Edit',
  });

  act(() => {
    modalButton.click();
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
  });

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

const defaultProps = {
  isEnabled: true,
  isWriteEnabled: true,
};

describe('Ruleset', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      ...mockCategoryProductSearch,
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: product1Id,
              productId: product1Id,
              title: product1Title,
              imageUrl: ['example1.jpg'],
              brand: product1Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product1Price,
              url: '',
            },
            {
              id: product2Id,
              productId: product2Id,
              title: product2Title,
              imageUrl: ['example2.jpg'],
              brand: product2Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product2Price,
              url: '',
            },
            {
              id: product3Id,
              productId: product3Id,
              title: product3Title,
              imageUrl: ['example.jpg'],
              brand: 'brand',
              metadata: { isPinned: false, isBoosted: true },
              isInStock: true,
              price: '£10',
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

    jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

    (useRouter as jest.Mock).mockImplementation(() => {
      return {
        events: mockRouterEvents,
      };
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render correctly', () => {
    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should render a loading when updating data', () => {
    jest.mocked(usePreview).mockReturnValueOnce({
      ...mockCategoryReturnValue,
      isLoading: true,
    });
    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('should show preview errors', () => {
    jest.mocked(usePreview).mockReturnValueOnce({
      ...mockCategoryReturnValue,
      error: 'Failed to preview',
    });
    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Error: Failed to preview'
    );
  });

  it('should select a category', async () => {
    const user = userEvent.setup();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    await selectCategory(screen, user);

    expect(screen.getByText(`${categoryId1} : ${categoryName1}`)).toBeVisible();
  });

  it('should create a new ruleset', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreate={mockCreate}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    await selectCategory(screen, user);

    const saveButton = await screen.findByText(CREATE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoryIds: [categoryId1] })
    );
  });

  it('should keep the unsaved changes guard active when creating a ruleset does not navigate', async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockCreate = jest.fn(async () => undefined);

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreate={mockCreate}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    await selectCategory(screen, user);
    await user.click(
      await screen.findByRole('button', { name: CREATE_BUTTON })
    );

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

    const handleBrowseAway = mockRouterEvents.on.mock.calls.at(
      -1
    )?.[1] as () => void;

    expect(() => handleBrowseAway()).not.toThrow();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should not treat an untouched new ruleset as having changes', async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreate={jest.fn()}
        onCancel={mockCancel}
        rulesetType="category"
      />
    );

    await user.click(screen.getByRole('button', { name: CANCEL_BUTTON }));

    expect(mockCancel).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: CONFIRM_BUTTON })
    ).not.toBeInTheDocument();
  });

  it('should create a ruleset with the country code selected in the dropdown', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreate={mockCreate}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    await selectCategory(screen, user);

    const dropdownButton = screen.getByRole('button', {
      name: /^Select country/i,
    });

    await user.click(dropdownButton);

    const selectIE = screen.getByRole('menuitemradio', {
      name: 'UK/IE Market',
    });

    await user.click(selectIE);

    const saveButton = await screen.findByText(CREATE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'UK_IE' })
    );
  });

  it('should create a global ruleset', async () => {
    const mockCreate = jest.fn();

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreateGlobalRuleset={mockCreate}
        onCancel={jest.fn()}
        rulesetType="global"
      />
    );

    const createButton = await screen.findByText(CREATE_BUTTON);

    act(() => {
      createButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ isEnabled: false })
    );
  });

  it('should show CFTO specific info text for global rulesets scoped to the CFTO catalogue', () => {
    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onCreateGlobalRuleset={jest.fn()}
        onCancel={jest.fn()}
        rulesetType="global"
        catalogue="CFTO"
      />
    );

    expect(
      screen.getByText(
        'You are currently editing all CFTO pages on the M&S website and app'
      )
    ).toBeInTheDocument();
  });

  it('should edit a ruleset', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={mockSave}
        onCancel={jest.fn()}
        categoriesInfo={mockCategoriesInfo}
        rulesetMerchandisingRules={{
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
        }}
        rulesetId={ruleSetId}
        rulesetType="category"
      />
    );

    await user.click(screen.getAllByTitle('Open menu')[0]);

    await user.click(screen.getByRole('button', { name: 'Boost to Top' }));

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ categoryIds: [categoryId1] })
    );
  });

  it('should save a global ruleset', async () => {
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={mockSave}
        onCancel={jest.fn()}
        rulesetMerchandisingRules={{
          pinnedProducts: [{ id: 'abc123' }],
          blockedProducts: [],
          boosts: { numeric: [], alphanumeric: [], product: [] },
          buries: { numeric: [], alphanumeric: [], product: [] },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        }}
        rulesetId={ruleSetId}
        rulesetType="global"
      />
    );

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ ruleSetId })
    );
  });

  describe('category ranking rules', () => {
    it('should preview IE products when an IE category is first selected', async () => {
      const user = userEvent.setup();
      const mockSave = jest.fn();

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="category"
          categoriesInfo={undefined}
          countryCode="UK_IE"
        />
      );

      const modalButton = await screen.findByRole('button', {
        name: 'Edit',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      await user.type(
        screen.getByPlaceholderText(CATEGORY_SEARCH_PLACEHOLDER_TEXT),
        'IE_SubCategory_507{enter}'
      );

      const categoryToSelect = await screen.findByText(
        `${categoryId3} | ${categoryName1} | ${categoryPath1}`
      );

      act(() => {
        categoryToSelect.click();
      });

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );
    });

    it('should default the preview to the first non-IE_ category when categoriesInfo has a mix of categories', () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="category"
          categoriesInfo={[
            { id: categoryId3, name: categoryName1, plpUrl: categoryPath1 },
            { id: categoryId1, name: categoryName1, plpUrl: categoryPath1 },
          ]}
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryId: categoryId1,
          countryCode: 'UK',
        })
      );
    });

    it('should fall back to the first category when every category in categoriesInfo is IE_', () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="category"
          categoriesInfo={[
            { id: categoryId3, name: categoryName1, plpUrl: categoryPath1 },
          ]}
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryId: categoryId3,
          countryCode: 'IE',
        })
      );
    });
  });

  describe('keyword search', () => {
    it('should remove a search term', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={['foo']}
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const fooKeyword = await screen.findByLabelText('Remove keyword: foo');

      act(() => {
        fooKeyword.click();
      });
      const numberOfKeywords =
        await screen.findByLabelText('number of keywords');

      expect(numberOfKeywords).toHaveTextContent('0');
    });

    it('should add a search term', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={['foo']}
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const keywordInput = await screen.findByLabelText('Add keyword to list');

      await user.type(keywordInput, 'bar{Enter}');
      const numberOfKeywords =
        await screen.findByLabelText('number of keywords');

      expect(numberOfKeywords).toHaveTextContent('2');
      expect(await screen.findByLabelText('Remove keyword: bar')).toBeVisible();
    });

    it('should add multiple search terms via bulk paste', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={[]}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const keywordInput = await screen.findByLabelText('Add keyword to list');

      await user.type(keywordInput, 'bar, baz{Enter}');
      const numberOfKeywords =
        await screen.findByLabelText('number of keywords');

      expect(numberOfKeywords).toHaveTextContent('2');
      expect(await screen.findByLabelText('Remove keyword: bar')).toBeVisible();
    });

    it('should add bulk search terms to existing keywords without overwriting preview', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={['foo']}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const keywordInput = await screen.findByLabelText('Add keyword to list');

      await user.type(keywordInput, 'bar, baz{Enter}');
      const numberOfKeywords =
        await screen.findByLabelText('number of keywords');

      expect(numberOfKeywords).toHaveTextContent('3');
      expect(await screen.findByLabelText('Remove keyword: bar')).toBeVisible();
    });

    it('should save a keyword ruleset', async () => {
      const mockSave = jest.fn();
      const mockSearchTerms = ['foo', 'bar'];

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={mockSearchTerms}
        />
      );

      const saveButton = await screen.findByText(SAVE_BUTTON);

      act(() => {
        saveButton.click();
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerms: mockSearchTerms })
      );
    });

    it('should create a keyword ruleset', async () => {
      const mockCreate = jest.fn();
      const user = userEvent.setup();

      const expectedData = {
        isEnabled: true,
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          pinnedProducts: [],
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        searchTerms: ['new keyword'],
        countryCode: 'UK_IE',
      };

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCreateKeywordSearchRuleset={mockCreate}
          onCancel={jest.fn()}
          rulesetType="search"
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );

      const createButton = await screen.findByText(CREATE_BUTTON);

      act(() => {
        createButton.click();
      });

      expect(mockCreate).toHaveBeenCalledWith(expectedData);
    });

    it('should show error and not add ruleset to the list if attempting to add a duplicate keyword in any casing', async () => {
      const mockCreate = jest.fn();
      const user = userEvent.setup();

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onCreateKeywordSearchRuleset={mockCreate}
          onCancel={jest.fn()}
          rulesetType="search"
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );

      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'nEw kEyWOrd{enter}'
      );

      expect(
        screen.getByText('Keyword new keyword has already been added')
      ).toBeVisible();

      expect(
        screen.queryAllByRole('button', { name: 'Remove keyword: new keyword' })
      ).toHaveLength(1);
    });

    it('should show preview', async () => {
      const user = userEvent.setup({ delay: null });

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="search"
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(
        screen.getByText('View rule changes made on the website below')
      ).toBeInTheDocument();
    });

    it('should track preview click', async () => {
      const user = userEvent.setup({ delay: null });

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="search"
        />
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(analyticsSpy).toHaveBeenCalledWith({
        event: 'Preview search rule - new keyword',
      });
    });

    it('should open and close UK or IE view dropdown', async () => {
      const mockSave = jest.fn();
      const mockSearchTerms = ['foo', 'bar'];

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={mockSearchTerms}
          countryCode="UK_IE"
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );

      const selectUK = screen.getByRole('button', {
        name: /Select country view for visual editor/i,
      });

      act(() => {
        selectUK.click();
      });

      expect(
        screen.getByRole('menuitemradio', { name: 'IE flag IE view' })
      ).toBeVisible();

      act(() => {
        selectUK.click();
      });

      expect(
        screen.queryByRole('button', { name: 'IE flag &nbsp; IE view' })
      ).not.toBeInTheDocument();
    });

    it('should allow for previewing UK and IE products', async () => {
      const mockSave = jest.fn();
      const mockSearchTerms = ['foo', 'bar'];

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={mockSearchTerms}
          countryCode="UK_IE"
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );

      const selectDropdown = screen.getByRole('button', {
        name: /Select country view for visual editor/i,
      });

      act(() => {
        selectDropdown.click();
      });

      const selectIE = screen.getByRole('menuitemradio', {
        name: 'IE flag IE view',
      });
      act(() => {
        selectIE.click();
      });

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );

      const selectUK = screen.getByRole('menuitemradio', {
        name: 'UK flag UK view',
      });

      act(() => {
        selectUK.click();
      });

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );
    });

    it('should change preview country to IE if previewing UK and influence changed to IE only', async () => {
      const mockSave = jest.fn();
      const mockSearchTerms = ['foo', 'bar'];

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={mockSearchTerms}
          countryCode="UK"
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );

      const selectMarket = screen.getByRole('button', {
        name: /^Select country/i,
      });

      act(() => {
        selectMarket.click();
      });

      const selectIE = screen.getByRole('menuitemradio', {
        name: 'IE market only',
      });

      act(() => {
        selectIE.click();
      });

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );
    });

    it('should change preview country to UK if previewing IE and influence changed to UK only', async () => {
      const mockSave = jest.fn();
      const mockSearchTerms = ['foo', 'bar'];

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            pinnedProducts: [{ id: 'abc123' }],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          }}
          rulesetId={ruleSetId}
          rulesetType="search"
          searchTerms={mockSearchTerms}
          countryCode="IE"
        />
      );

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );

      const selectMarket = screen.getByRole('button', {
        name: /^Select country/i,
      });

      act(() => {
        selectMarket.click();
      });

      const selectIE = screen.getByRole('menuitemradio', {
        name: 'UK market only',
      });
      act(() => {
        selectIE.click();
      });

      expect(usePreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );
    });
  });

  it('should cancel changes', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();
    const mockCancel = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={mockSave}
        onCancel={mockCancel}
        categoriesInfo={mockCategoriesInfo507}
        rulesetMerchandisingRules={{
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
        }}
        rulesetId={ruleSetId}
        rulesetType="category"
      />
    );

    await user.click(screen.getAllByTitle('Open menu')[0]);

    await user.click(screen.getByRole('button', { name: 'Boost to Top' }));

    const cancelButton = await screen.findByText(CANCEL_BUTTON);

    act(() => {
      cancelButton.click();
    });

    const confirmCancelButton = await screen.findByText(CONFIRM_BUTTON);

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockCancel).toHaveBeenCalled();
  });

  it('should not save changes with no category selected', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={mockSave}
        onCancel={jest.fn()}
        rulesetType="category"
      />
    );

    await selectCategory(screen, user);

    const clearButton = screen.getByLabelText(
      `Remove category from modal: ${categoryId1}`
    );

    act(() => {
      clearButton.click();
    });

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  describe('Search', () => {
    it('should search for products when the user enters a query, and clear products when the user clears the query', async () => {
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          categoriesInfo={mockCategoriesInfo507}
          rulesetMerchandisingRules={{
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
          }}
          rulesetId={ruleSetId}
          rulesetType="category"
        />
      );

      await user.type(
        screen.getByPlaceholderText(PRODUCT_SEARCH_PLACEHOLDER_TEXT),
        '123'
      );

      await waitFor(() => {
        expect(screen.getByLabelText('number of results')).toHaveTextContent(
          '3 results'
        );
      });

      await user.clear(
        screen.getByPlaceholderText(PRODUCT_SEARCH_PLACEHOLDER_TEXT)
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('status', { name: '3 results' })
        ).not.toBeInTheDocument();
      });
    });

    it('should handle position change when product is selected from product search', async () => {
      const user = userEvent.setup();
      const productSearchTitle = 'productSearchTitle';
      const expectedPreview = {
        categoryId: 'cat_123',
        countryCode: 'UK',
        facetConfig: [],
        merchandisingRules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          excludes: { alphanumeric: [] },
          includes: { alphanumeric: [] },
          pinnedProducts: [{ id: 'product-id-2' }],
        },
        searchTerm: undefined,
      };

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      jest.mocked(usePreview).mockReturnValue({
        ...mockCategoryReturnValue,
        data: {
          ...mockCategoryReturnValue.data,
          pagination: {
            totalItems: 145,
          },
          products: [
            {
              id: 'product-id-1',
              productId: 'product-id-1',
              title: productSearchTitle,
              imageUrl: ['example1.jpg'],
              brand: product1Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product1Price,
              url: '',
            },
          ],
          ruleSet: {
            ...mockCategoryReturnValue.data.ruleSet,
            rules: {
              ...mockCategoryReturnValue.data.ruleSet.rules,
              pinnedProducts: [{ ...mockProduct, id: 'product2' }],
            },
          },
        },
      });

      jest.mocked(useCategoryProductSearch).mockReturnValue({
        searchForProduct: jest.fn(() => {
          return Promise.resolve({
            products: [
              {
                id: 'product-id-2',
                productId: 'product-id-2',
                title: productSearchTitle,
                imageUrl: ['example2.jpg'],
                brand: product1Brand,
                metadata: { isPinned: false },
                isInStock: true,
                price: product1Price,
                url: '',
              },
            ],
            pagination: {
              totalItems: 1,
            },
          });
        }),
        error: '',
        isLoading: false,
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          categoriesInfo={mockCategoriesInfo}
          rulesetMerchandisingRules={{
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
          }}
          rulesetId={ruleSetId}
          rulesetType="category"
        />
      );

      expect(screen.getByTestId('Position 1')).toBeVisible();
      expect(screen.queryByTestId('Position 2')).not.toBeInTheDocument();

      const searchProduct = screen.getByPlaceholderText('Search for product');

      await user.type(searchProduct, 'productSearchTitle');

      await waitFor(() => {
        expect(
          screen
            .getByTestId('Product Search Container')
            .querySelector('button[title="Open menu"]')
        ).toBeVisible();
      });

      const menuButton = screen
        .getByTestId('Product Search Container')
        .querySelector('button[title="Open menu"]');

      if (menuButton) {
        await user.click(menuButton);
      }

      const pinToPositionButton = await waitFor(() =>
        screen.findByText('Pin in position')
      );

      await user.click(pinToPositionButton);

      const input = await screen.findByPlaceholderText('i.e. 3');

      await user.type(input, '1');

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await user.click(confirmButton);

      expect(usePreview).toHaveBeenCalledWith(expectedPreview);
    });
  });

  describe('Preview', () => {
    it('should show and close preview', async () => {
      const user = userEvent.setup({ delay: null });

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="category"
        />
      );

      await selectCategory(screen, user);

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(
        screen.getByText('View rule changes made on the website below')
      ).toBeInTheDocument();

      const closeButton = screen.getByLabelText('close modal');

      act(() => {
        closeButton.click();
      });

      expect(
        screen.queryByText('View rule changes made on the website below')
      ).not.toBeInTheDocument();
    });

    it('Should not show preview on global rulesets', () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetType="global"
        />
      );
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });
  });

  it('opens changes tab', async () => {
    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetMerchandisingRules={mockMerchandisingRules}
        rulesetType="category"
      />
    );

    const tab2 = screen.getByRole('button', { name: /Changes/ });

    await waitFor(() => {
      tab2.click();
    });

    expect(
      screen.getByRole('heading', { level: 2, name: 'Pinned Products (1)' })
    ).toBeVisible();
  });

  it('should track tab clicks', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <Ruleset
        {...defaultProps}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        rulesetMerchandisingRules={mockMerchandisingRules}
        rulesetType="category"
      />
    );

    const tab1 = screen.getByRole('button', { name: 'Changes 1' });
    const tab2 = screen.getByRole('button', { name: 'Product' });
    const tab3 = screen.getByRole('button', { name: 'Attribute' });

    await user.click(tab1);

    expect(analyticsSpy).toHaveBeenCalledWith({
      event: 'category rules - Changes tab clicked',
    });
    await user.click(tab2);
    expect(analyticsSpy).toHaveBeenCalledWith({
      event: 'category rules - Product tab clicked',
    });

    await user.click(tab3);
    expect(analyticsSpy).toHaveBeenCalledWith({
      event: 'category rules - Attribute tab clicked',
    });
  });

  describe('Attribute rules', () => {
    const mockRules: MerchandisingRules = {
      pinnedProducts: [],
      boosts: boostMock,
      buries: buriesMock,
      blockedProducts: [],
      includes: {},
      excludes: {
        alphanumeric: [
          {
            fields: [
              {
                field: 'example',
                values: ['One', 'Two'],
              },
            ],
          },
        ],
      },
    };

    const emptyAttributes: MerchandisingBoostsBuries = {
      numeric: [],
      alphanumeric: [],
      product: [],
    };

    const selectAlphanumericAttribute = async (
      screen: Screen,
      withBury: boolean,
      withInclude?: boolean
    ) => {
      const tab2 = await screen.findByText('Attribute');

      act(() => {
        tab2.click();
      });

      const newAttributeButton = screen.getByRole('button', {
        name: 'Create new attribute rule',
      });

      act(() => {
        newAttributeButton.click();
      });

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Numeric attributes' })
        ).toBeVisible()
      );

      const nextStepButton = screen.getByRole('button', {
        name: 'Product description attributes',
      });

      act(() => {
        nextStepButton.click();
      });

      if (withBury) {
        const dropdownButton = screen.getByRole('button', {
          name: /Select to include, exclude, boost or bury/i,
        });

        act(() => {
          dropdownButton.click();
        });

        const dropdownWrapper = dropdownButton.parentElement!;
        const buryButton = within(dropdownWrapper).getByRole('menuitemradio', {
          name: 'Bury',
        });

        act(() => {
          buryButton.click();
        });
      }

      if (withInclude) {
        const dropdownButton = screen.getByRole('button', {
          name: /Select to include, exclude, boost or bury/i,
        });

        act(() => {
          dropdownButton.click();
        });

        const dropdownWrapper = dropdownButton.parentElement!;
        const includeButton = within(dropdownWrapper).getByRole(
          'menuitemradio',
          {
            name: 'Include only',
          }
        );

        act(() => {
          includeButton.click();
        });
      }

      const colourButton = screen.getByRole('button', {
        name: 'Colour',
      });

      act(() => {
        colourButton.click();
      });

      const colourRedCheckbox = screen.getByRole('checkbox', {
        name: 'Red',
      });
      const colourBlueCheckbox = screen.getByRole('checkbox', {
        name: 'Blue',
      });

      act(() => {
        colourBlueCheckbox.click();
        colourRedCheckbox.click();
      });
    };

    it('adds a numeric attribute', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            ...mockRules,
            boosts: emptyAttributes,
            buries: emptyAttributes,
          }}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const tab2 = await screen.findByText('Attribute');

      act(() => {
        tab2.click();
      });

      const newAttributeButton = screen.getByRole('button', {
        name: 'Create new attribute rule',
      });

      act(() => {
        newAttributeButton.click();
      });

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Numeric attributes' })
        ).toBeVisible()
      );

      const nextStepButton = screen.getByRole('button', {
        name: 'Numeric attributes',
      });

      act(() => {
        nextStepButton.click();
      });

      const sizeButton = screen.getAllByLabelText('Price');

      act(() => {
        sizeButton[1].click();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      await waitFor(
        () =>
          expect(
            screen.getByLabelText('number of attribute rules')
          ).toHaveTextContent('2 attribute rules'),
        { timeout: 3000 }
      );
    });

    it('adds an alphanumeric attribute', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            ...mockRules,
            boosts: emptyAttributes,
            buries: emptyAttributes,
          }}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      await selectAlphanumericAttribute(screen, false);

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      await waitFor(
        () =>
          expect(
            screen.getByLabelText('number of attribute rules')
          ).toHaveTextContent('2 attribute rules'),
        { timeout: 3000 }
      );
    });

    it('adds a buried alphanumeric attribute', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            ...mockRules,
            boosts: emptyAttributes,
            buries: emptyAttributes,
          }}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      await selectAlphanumericAttribute(screen, true);

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      await waitFor(
        () =>
          expect(
            screen.getByLabelText('number of attribute rules')
          ).toHaveTextContent('2 attribute rules'),
        { timeout: 3000 }
      );
    });

    it('adds an included alphanumeric attribute', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            ...mockRules,
            boosts: emptyAttributes,
            buries: emptyAttributes,
          }}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      await selectAlphanumericAttribute(screen, false, true);

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      await waitFor(
        () =>
          expect(
            screen.getByLabelText('number of attribute rules')
          ).toHaveTextContent('2 attribute rules'),
        { timeout: 3000 }
      );
    });

    it('deletes attributes', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const tab2 = await screen.findByText('Attribute');

      act(() => {
        tab2.click();
      });

      expect(screen.getByText('Nike')).toBeVisible();
      expect(screen.getByText('minPrice')).toBeVisible();

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[0].click();
      });
      act(() => {
        deleteButton[4].click();
      });
      act(() => {
        deleteButton[2].click();
      });

      expect(screen.queryByText('Nike')).not.toBeInTheDocument();
      expect(screen.queryByText('minPrice')).not.toBeInTheDocument();
      expect(screen.queryByText('size')).not.toBeInTheDocument();
    });
  });

  describe('Scheduling', () => {
    const mockRules: MerchandisingRules = {
      pinnedProducts: [],
      boosts: boostMock,
      buries: buriesMock,
      blockedProducts: [],
      includes: {},
      excludes: {},
    };

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should set a start and end date', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        const startDate = screen.getByRole('button', { name: '14 March 2022' });
        act(() => {
          startDate.click();
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('time')).toHaveTextContent('Mar 14 2022 00:00');
      });

      await waitFor(() => {
        const endDate = screen.getByRole('button', { name: '16 March 2022' });
        act(() => {
          endDate.click();
        });
      });

      const saveButton = screen.getByRole('button', {
        name: 'Close schedule editor',
      });
      act(() => {
        saveButton.click();
      });
    });
  });

  describe('Bulk actions', () => {
    const mockRules: MerchandisingRules = {
      pinnedProducts: [],
      boosts: boostMock,
      buries: buriesMock,
      blockedProducts: [],
      includes: {},
      excludes: {
        alphanumeric: [
          {
            fields: [
              {
                field: 'example',
                values: ['One', 'Two'],
              },
            ],
          },
        ],
      },
    };

    it('should show checkboxes on products', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      expect(await screen.findByLabelText('Select productTitle')).toBeVisible();
    });

    it('should select and deselect products', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const checkbox = await screen.findByLabelText('Select productTitle');

      act(() => {
        checkbox.click();
      });

      expect(await screen.findByLabelText('Select productTitle')).toBeChecked();

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productTitle')
      ).not.toBeChecked();
    });

    it('should select products from search', async () => {
      const user = userEvent.setup();
      jest.mocked(useCategoryProductSearch).mockReturnValue({
        searchForProduct: jest.fn(() => {
          return Promise.resolve({
            products: [
              {
                id: 'product-id-2',
                productId: 'product-id-2',
                title: 'productSearchTitle',
                imageUrl: ['example2.jpg'],
                brand: product1Brand,
                metadata: { isPinned: false },
                isInStock: true,
                price: product1Price,
                url: '',
              },
            ],
            pagination: {
              totalItems: 1,
            },
          });
        }),
        error: '',
        isLoading: false,
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const searchProduct = screen.getByPlaceholderText('Search for product');

      await user.type(searchProduct, 'productSearchTitle');

      const checkbox = await screen.findByLabelText(
        'Select productSearchTitle'
      );

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productSearchTitle')
      ).toBeChecked();

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productSearchTitle')
      ).not.toBeChecked();
    });

    it('should deselect products from the bulk actions menu', async () => {
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const checkbox = await screen.findByLabelText('Select productTitle');

      act(() => {
        checkbox.click();
      });

      expect(await screen.findByLabelText('Select productTitle')).toBeChecked();

      const deselectButton = await screen.findByRole('button', {
        name: 'Deselect',
      });

      act(() => {
        deselectButton.click();
      });

      expect(
        await screen.findByLabelText('Select productTitle')
      ).not.toBeChecked();
    });

    it('should boost products from the bulk actions menu', async () => {
      const mockedRules: MerchandisingRules = {
        pinnedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        blockedProducts: [],
        includes: {},
        excludes: {},
      };
      const expectedPreviewRules = {
        categoryId: 'SubCategory_507',
        countryCode: 'UK',
        facetConfig: [],
        merchandisingRules: {
          pinnedProducts: [],
          boosts: {
            alphanumeric: [],
            numeric: [],
            product: [{ id: 'product2', weight: 100 }],
          },
          buries: { alphanumeric: [], numeric: [], product: [] },
          blockedProducts: [],
          includes: {},
          excludes: {},
        },
      };
      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={mockedRules}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const checkbox = await screen.findByLabelText('Select productTitle2');

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productTitle2')
      ).toBeChecked();

      const bulkActionsButton = await screen.findByRole('button', {
        name: 'Bulk actions',
      });

      act(() => {
        bulkActionsButton.click();
      });

      const boostToTop = screen.getByRole('button', { name: 'Boost to Top' });

      act(() => {
        boostToTop.click();
      });

      await waitFor(async () => {
        expect(
          await screen.findByRole('heading', { name: 'Apply new bulk action' })
        ).toBeVisible();
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Apply action',
      });

      act(() => {
        confirmButton.click();
      });

      await waitFor(async () => {
        expect(usePreview).toHaveBeenLastCalledWith(expectedPreviewRules);
      });
    });

    it('should select products from changes tab', async () => {
      jest.mocked(useCategoryProductSearch).mockReturnValue({
        searchForProduct: jest.fn(() => {
          return Promise.resolve({
            products: [
              {
                id: '6780',
                productId: '6780',
                title: 'productSearchTitle',
                imageUrl: ['example2.jpg'],
                brand: product1Brand,
                metadata: { isPinned: false },
                isInStock: true,
                price: product1Price,
                url: '',
              },
            ],
            pagination: {
              totalItems: 1,
            },
          });
        }),
        error: '',
        isLoading: false,
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          rulesetMerchandisingRules={{
            ...mockRules,
            pinnedProducts: [{ id: '6780' }],
          }}
          categoriesInfo={mockCategoriesInfo507}
          rulesetType="category"
        />
      );

      const tab2 = await screen.findByText('Changes');

      await waitFor(() => {
        tab2.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Pinned Products (1)' })
        ).toBeVisible();
      });

      const checkbox = await screen.findByLabelText(
        'Select productSearchTitle'
      );

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productSearchTitle')
      ).toBeChecked();

      act(() => {
        checkbox.click();
      });

      expect(
        await screen.findByLabelText('Select productSearchTitle')
      ).not.toBeChecked();
    });
  });

  describe('diff modal', () => {
    const originalRuleset = {
      isEnabled: true,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { numeric: [], alphanumeric: [], product: [] },
        buries: { numeric: [], alphanumeric: [], product: [] },
        includes: { alphanumeric: [] },
        excludes: { alphanumeric: [] },
      },
    };

    it('should show diff modal before saving', async () => {
      const mockSave = jest.fn();

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          originalRuleset={originalRuleset}
          categoriesInfo={mockCategoriesInfo}
          rulesetMerchandisingRules={originalRuleset.rules}
          rulesetId={ruleSetId}
          rulesetType="category"
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      const user = userEvent.setup();
      const saveButton = await screen.findByText(SAVE_BUTTON);
      await user.click(saveButton);

      expect(
        await screen.findByRole('heading', { name: 'Review changes' })
      ).toBeInTheDocument();
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should call onSave after confirming in diff modal', async () => {
      const user = userEvent.setup();
      const mockSave = jest.fn();

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          originalRuleset={originalRuleset}
          categoriesInfo={mockCategoriesInfo}
          rulesetMerchandisingRules={originalRuleset.rules}
          rulesetId={ruleSetId}
          rulesetType="category"
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      const saveButton = await screen.findByText(SAVE_BUTTON);

      await user.click(saveButton);

      await user.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ ruleSetId })
      );
    });

    it('should not call onSave when cancelling the diff modal', async () => {
      const user = userEvent.setup();
      const mockSave = jest.fn();

      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      renderWithProviders(
        <Ruleset
          {...defaultProps}
          onSave={mockSave}
          onCancel={jest.fn()}
          originalRuleset={originalRuleset}
          categoriesInfo={mockCategoriesInfo}
          rulesetMerchandisingRules={originalRuleset.rules}
          rulesetId={ruleSetId}
          rulesetType="category"
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      const saveButton = await screen.findByText(SAVE_BUTTON);

      await user.click(saveButton);

      const modalHeading = await screen.findByRole('heading', {
        name: 'Review changes',
      });

      const dialog = modalHeading.closest('[role="dialog"]');
      expect(dialog).not.toBeNull();

      await user.click(
        within(dialog as HTMLElement).getByRole('button', { name: 'Cancel' })
      );

      expect(mockSave).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByText('Review changes')).not.toBeInTheDocument();
      });
    });
  });
});
