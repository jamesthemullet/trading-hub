import { act, render, screen } from '@testing-library/react';

import { useCategoryPreview } from '../../hooks/use-category-preview';

import { Preview } from './preview';

jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphaNumeric: [], product: [] },
  buries: { numeric: [], alphaNumeric: [], product: [] },
};
const mockCategoryId = 'SubCat_123';
const mockOnClose = jest.fn();

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

const NEW_RULE_CHANGE = 'with new rule change';
const CURRENT_STATE = 'current state';

describe('Preview', () => {
  beforeEach(() => {
    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryPreview: [mockProduct, { ...mockProduct, id: 'product2' }],
      error: '',
      refetchRuleSetPreview: jest.fn(),
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
});
