import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingFacet } from '@/libs/api';
import { usePreview } from '@/libs/hooks/use-preview';
import { renderWithProviders } from '@/test/render-with-providers';

import type { Props } from './preview';
import { Preview } from './preview';

jest.mock('@/libs/hooks/use-preview', () => ({
  usePreview: jest.fn(),
}));

const mockMerchandisingRules = {
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
};
const mockCategoryId = 'SubCat_123';
const mockOnClose = jest.fn();

const mockProduct = {
  id: 'id',
  productId: 'productId',
  title: 'productTitle',
  imageUrl: ['example.jpg'],
  brand: 'productBrand',
  metadata: { isPinned: false },
  isInStock: true,
  price: 'productPrice',
  url: '',
};

const mockFacets: MerchandisingFacet[] = [
  {
    id: 'Product Type',
    order: 0,
    data: [
      {
        name: 'Tops',
        count: 24,
        disabled: false,
        selected: false,
      },
      {
        name: 'Socks',
        count: 24,
        disabled: false,
        selected: false,
      },
      {
        name: 'Leggings',
        count: 9,
        disabled: false,
        selected: false,
      },
      {
        name: 'Tights',
        count: 6,
        disabled: false,
        selected: false,
      },
      {
        name: 'Vest Tops',
        count: 2,
        disabled: false,
        selected: false,
      },
      {
        name: 'Bodies',
        count: 1,
        disabled: false,
        selected: false,
      },
      {
        name: 'Shorts',
        count: 1,
        disabled: false,
        selected: false,
      },
    ],
  },
  {
    id: 'Brand',
    order: 1,
    data: [
      {
        name: 'M&S Collection',
        count: 66,
        disabled: false,
        selected: false,
      },
    ],
  },
  {
    id: 'Price',
    order: 2,
    data: [
      {
        minimum: 5,
        maximum: 30,
        count: 67,
        selected: false,
      },
    ],
  },
  {
    id: 'Colour',
    order: 3,
    data: [
      {
        name: 'Blue',
        count: 66,
        disabled: false,
        selected: false,
      },
    ],
  },
  {
    id: 'Size',
    order: 4,
    data: [
      {
        name: 'XS',
        count: 66,
        disabled: false,
        selected: false,
      },
    ],
  },
  {
    id: 'Style',
    order: 5,
    data: [
      {
        name: 'Everyday socks',
        count: 66,
        disabled: false,
        selected: false,
      },
    ],
  },
];

const mockCategoryReturnValue = {
  data: {
    category: 'categoryId1',
    externalChanges: mockMerchandisingRules,
    facets: mockFacets,
    pagination: {
      totalItems: 1,
    },
    products: [
      mockProduct,
      {
        ...mockProduct,
        id: 'product2',
        productId: 'productId2',
        metadata: { isPinned: false, isBoosted: true },
      },
    ],
    ruleSet: {
      facets: mockFacets,
      rules: mockMerchandisingRules,
    },
  },
  error: '',
  isLoading: false,
  setFacetConfigRules: jest.fn(),
};

const NEW_RULE_CHANGE = 'with new rule change';
const CURRENT_STATE = 'current state';

describe('Preview', () => {
  const mockProps: Props = {
    onClose: mockOnClose,
    categoryId: mockCategoryId,
    countryCode: 'UK',
    facetConfig: [],
    merchandisingRules: mockMerchandisingRules,
    previewTitle: 'Preview Title',
  };

  beforeEach(() => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
    });
  });

  it('should render correctly', () => {
    renderWithProviders(<Preview {...mockProps} />);

    expect(
      screen.getByRole('heading', { name: 'Preview' })
    ).toBeInTheDocument();
  });

  it('should use fallback image on error', () => {
    renderWithProviders(<Preview {...mockProps} />);

    const image = screen.getAllByTestId('productImage')[0];

    fireEvent.error(image);

    expect(image).toHaveAttribute(
      'src',
      'https://dummyimage.com/307x400/cccccc/ffffff?text=missing+image'
    );
  });

  it('should show the number of products', () => {
    renderWithProviders(<Preview {...mockProps} />);

    expect(screen.getByText('1 to 1 of 1 items')).toBeInTheDocument();
  });

  it('should show up to 140 products', () => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
      data: {
        ...mockCategoryReturnValue.data,
        pagination: {
          totalItems: 150,
        },
      },
    });
    renderWithProviders(<Preview {...mockProps} />);

    expect(screen.getByText('1 to 140 of 150 items')).toBeInTheDocument();
  });

  it('should show out of stock products', () => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
      data: {
        ...mockCategoryReturnValue.data,
        products: [{ ...mockProduct, isInStock: false }],
      },
    });
    renderWithProviders(<Preview {...mockProps} />);

    expect(screen.getByText('Out of stock')).toBeVisible();
  });

  it('calls the api with the supplied facet config', () => {
    const mockFacetConfig = [{ id: 'mockId', boosted: ['Red', 'Yellow'] }];
    renderWithProviders(
      <Preview {...mockProps} facetConfig={mockFacetConfig} />
    );

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ facetConfig: mockFacetConfig })
    );
  });

  it('calls the api with the supplied search term config', () => {
    renderWithProviders(
      <Preview {...mockProps} categoryId={undefined} searchTerm="foo" />
    );

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ searchTerm: 'foo' })
    );
  });

  it('open and close dropdown', () => {
    renderWithProviders(<Preview {...mockProps} />);

    const toggleButton = screen.getAllByText(NEW_RULE_CHANGE)[0];

    act(() => {
      toggleButton.click();
    });

    act(() => {
      toggleButton.click();
    });

    expect(screen.getAllByText(NEW_RULE_CHANGE)[0]).toBeInTheDocument();
  });

  it('should show current state', () => {
    renderWithProviders(<Preview {...mockProps} />);

    const toggleButton = screen.getAllByText(NEW_RULE_CHANGE)[0];

    act(() => {
      toggleButton.click();
    });

    const currentStateButton = screen.getByText(CURRENT_STATE);

    act(() => {
      currentStateButton.click();
    });

    expect(screen.getAllByText(CURRENT_STATE)[0]).toBeVisible();
    expect(screen.getAllByText(CURRENT_STATE)[1]).toBeInTheDocument();
  });

  it('should select current state', () => {
    renderWithProviders(<Preview {...mockProps} />);

    const toggleButton = screen.getAllByText(NEW_RULE_CHANGE)[0];

    act(() => {
      toggleButton.click();
    });

    const currentRuleButton = screen.getAllByText(NEW_RULE_CHANGE)[1];

    act(() => {
      currentRuleButton.click();
    });

    expect(screen.getAllByText(NEW_RULE_CHANGE)[0]).toBeVisible();
    expect(screen.getAllByText(NEW_RULE_CHANGE)[1]).toBeInTheDocument();
  });

  it('should show more facets', () => {
    renderWithProviders(<Preview {...mockProps} />);

    expect(
      screen.queryByRole('button', { name: 'Style' })
    ).not.toBeInTheDocument();
    const viewMoreButton = screen.getByRole('button', {
      name: 'filterSwitch All Filters',
    });

    act(() => {
      viewMoreButton.click();
    });

    expect(screen.getByRole('button', { name: 'Style' })).toBeInTheDocument();
  });

  it('should open and close facet values', async () => {
    renderWithProviders(<Preview {...mockProps} />);

    const facetButton = screen.getByRole('button', {
      name: 'Product Type',
    });

    act(() => {
      facetButton.click();
    });

    expect(screen.getByText('Tops')).toBeVisible();

    act(() => {
      facetButton.click();
    });

    expect(screen.queryByText('Tops')).not.toBeInTheDocument();
  });

  it('should show price facet info', () => {
    renderWithProviders(<Preview {...mockProps} />);

    const priceButton = screen.getByRole('button', {
      name: 'Price',
    });

    act(() => {
      priceButton.click();
    });

    expect(screen.getByText('£5')).toBeInTheDocument();
    expect(screen.getByText('£30')).toBeInTheDocument();
  });

  it('should localise price facet info', () => {
    renderWithProviders(<Preview {...mockProps} countryCode="IE" />);

    const priceButton = screen.getByRole('button', {
      name: 'Price',
    });

    act(() => {
      priceButton.click();
    });

    expect(screen.getByText('€5')).toBeInTheDocument();
    expect(screen.getByText('€30')).toBeInTheDocument();
  });

  it('should filter facet values', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Preview {...mockProps} />);

    const facetButton = screen.getByRole('button', {
      name: 'Product Type',
    });

    act(() => {
      facetButton.click();
    });

    expect(screen.getByText('Tops')).toBeVisible();
    expect(screen.getByText('Socks')).toBeVisible();

    const searchProduct = screen.getByPlaceholderText('Search');

    await user.type(searchProduct, 'tops');

    await waitFor(() => {
      expect(screen.getByText('Tops')).toBeVisible();
    });
    expect(screen.queryByText('Socks')).not.toBeInTheDocument();
  });

  it('should show a loader when making changes', () => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
      isLoading: true,
    });

    renderWithProviders(<Preview {...mockProps} />);

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('should not show excluded facets', () => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
      data: {
        ...mockCategoryReturnValue.data,
        facets: [
          {
            id: 'Brand',
            order: 0,
            data: [
              {
                name: 'M&S Collection',
                count: 66,
                disabled: false,
                selected: false,
              },
            ],
          },
          {
            id: 'Price',
            order: 1,
            data: [
              {
                minimum: 5,
                maximum: 30,
                count: 67,
                selected: false,
              },
            ],
          },
        ],
      },
    });

    renderWithProviders(
      <Preview
        {...mockProps}
        excludedFacets={{
          facets: [
            {
              id: 'Product Type',
            },
          ],
        }}
      />
    );

    expect(usePreview).toHaveBeenCalledWith({
      excludedFacets: {
        facets: [
          {
            id: 'Product Type',
          },
        ],
      },
      categoryId: 'SubCat_123',
      countryCode: 'UK',
      facetConfig: [],
      merchandisingRules: {
        blockedProducts: [],
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
        excludes: {
          alphanumeric: [],
        },
        includes: {
          alphanumeric: [],
        },
        pinnedProducts: [],
      },
    });

    expect(screen.queryByText('Product Type')).not.toBeInTheDocument();
  });
});
