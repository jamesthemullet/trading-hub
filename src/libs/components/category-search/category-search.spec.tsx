import { act, screen, render } from '@testing-library/react';

import { CategorySearch } from './category-search';

const mockProps = {
  categoryResults: {
    categories: [],
    pagination: {},
  },
  searchValue: '',
  selectedCategory: undefined,
  onClearSelection: jest.fn(),
  onSubmit: jest.fn(),
  onSearchChange: jest.fn(),
  onSelectCategory: jest.fn(),
};

const mockCategory = {
  identifier: 'SubCategory_507',
  name: 'Thermals',
  path: 'l/lingerie/thermals',
};

describe('CategorySearch', () => {
  it('should render correctly', () => {
    render(<CategorySearch {...mockProps} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should show and select search results', async () => {
    const mockCategoryResults = {
      categories: [mockCategory],
      pagination: {
        totalItems: 1,
      },
    };

    render(
      <CategorySearch
        {...mockProps}
        searchValue="SubCategory_507"
        categoryResults={mockCategoryResults}
      />
    );

    const resultsButton = await screen.findByText(
      `${mockCategory.identifier} | ${mockCategory.name} | ${mockCategory.path}`
    );

    act(() => {
      resultsButton.click();
    });

    expect(mockProps.onSelectCategory).toBeCalledWith(mockCategory);
  });

  it('should show selected category', () => {
    render(<CategorySearch {...mockProps} selectedCategory={mockCategory} />);

    expect(screen.getByText(mockCategory.identifier)).toBeInTheDocument();
  });

  it('should clear a selected category', async () => {
    render(<CategorySearch {...mockProps} selectedCategory={mockCategory} />);

    const clearButton = await screen.findByLabelText(
      'Remove selected category'
    );

    act(() => {
      clearButton.click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalled();
  });
});
