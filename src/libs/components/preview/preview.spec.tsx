import { act, screen } from '@testing-library/react';

import { Facet } from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { usePreview } from '../../hooks/use-preview';
import { Preview } from './preview';

jest.mock('../../hooks/use-preview', () => ({
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

const mockFacets: Facet[] = [
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
  beforeEach(() => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
    });
  });

  it('should render correctly', () => {
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('calls the api with the supplied facet config', () => {
    const mockFacetConfig = [{ id: 'mockId', boosted: ['Red', 'Yellow'] }];
    renderWithProviders(
      <Preview
        facetConfig={mockFacetConfig}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ facetConfig: mockFacetConfig })
    );
  });

  it('calls the api with the supplied search term config', () => {
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        searchTerm="foo"
        onClose={mockOnClose}
      />
    );

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ searchTerm: 'foo' })
    );
  });

  it('open and close dropdown', () => {
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

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
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

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
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

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
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    const viewMoreButton = screen.getByText('View more');

    act(() => {
      viewMoreButton.click();
    });

    expect(screen.getByText('Vest Tops (2)')).toBeInTheDocument();
  });

  it('should show price facet info', () => {
    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('£5 - £30 (67)')).toBeInTheDocument();
  });

  it('should show a loader when making changes', () => {
    jest.mocked(usePreview).mockReturnValue({
      ...mockCategoryReturnValue,
      isLoading: true,
    });

    renderWithProviders(
      <Preview
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('loader')).toBeInTheDocument();
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
        facetConfig={[]}
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
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

    expect(screen.queryByText('Product Type')).toBe(null);
  });
});
