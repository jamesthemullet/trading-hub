import { act, render, screen } from '@testing-library/react';

import { Facet } from '@/libs/api';

import { useCategoryPreview } from '../../hooks/use-category-preview';
import { Preview } from './preview';

jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
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

const NEW_RULE_CHANGE = 'with new rule change';
const CURRENT_STATE = 'current state';

describe('Preview', () => {
  beforeEach(() => {
    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryProducts: [
        mockProduct,
        { ...mockProduct, productId: 'product2' },
      ],
      categoryFacets: mockFacets,
      error: '',
      isLoading: false,
      merchandisingRulesWithInfo: mockMerchandisingRules,
      setRules: jest.fn(),
    });
  });

  it('should render correctly', () => {
    render(
      <Preview
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('open and close dropdown', () => {
    render(
      <Preview
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
    render(
      <Preview
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
    render(
      <Preview
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
    render(
      <Preview
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
    render(
      <Preview
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('£5 - £30 (67)')).toBeInTheDocument();
  });

  it('should show a loader when making changes', () => {
    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryProducts: [mockProduct],
      categoryFacets: mockFacets,
      error: '',
      isLoading: true,
      merchandisingRulesWithInfo: mockMerchandisingRules,
      setRules: jest.fn(),
    });

    render(
      <Preview
        merchandisingRules={mockMerchandisingRules}
        categoryId={mockCategoryId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('loader')).toBeInTheDocument();
  });
});
