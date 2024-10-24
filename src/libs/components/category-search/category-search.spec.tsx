import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetCategories } from '../../hooks/use-get-categories';
import { CategorySearch } from './category-search';

jest.mock('../../hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

const mockProps = {
  categoryResults: {
    categories: [],
    pagination: {},
  },
  searchValue: '',
  selectedCategories: [],
  onClearSelection: jest.fn(),
  onSubmit: jest.fn(),
  onSearchChange: jest.fn(),
  onSelectCategory: jest.fn(),
};

const mockCategoryId = 'SubCategory_507';

const mockCategory = {
  identifier: mockCategoryId,
  name: 'Thermals',
  path: 'l/lingerie/thermals',
};

const mockGetCategories = {
  categories: [mockCategory],
  pagination: { totalItems: 20 },
};

const INPUT_PLACEHOLDER_TEXT = 'Search...';

describe('CategorySearch', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });
  });

  it('should render correctly', () => {
    render(<CategorySearch {...mockProps} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should search while typing', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<CategorySearch {...mockProps} />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCat'
    );

    await waitFor(() =>
      expect(screen.getByDisplayValue('SubCat')).toBeVisible()
    );
    const resultsButton = await screen.findByText(
      `${mockCategory.identifier} | ${mockCategory.name} | ${mockCategory.path}`
    );
    act(() => {
      resultsButton.click();
    });
  });

  it('should show and select search results', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<CategorySearch {...mockProps} />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507{enter}'
    );

    expect(screen.getByDisplayValue('SubCategory_507')).toBeVisible();

    const resultsButton = await screen.findByText(
      `${mockCategory.identifier} | ${mockCategory.name} | ${mockCategory.path}`
    );

    act(() => {
      resultsButton.click();
    });

    expect(mockProps.onSelectCategory).toHaveBeenCalledWith(
      mockCategory.identifier
    );
  });

  it('should convert undefined search results', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() =>
        Promise.resolve({
          categories: [
            {},
            {
              identifier: 'SubCategory_507',
            },
            {
              identifier: 'SubCategory_507',
              name: 'Thermals',
            },
            {
              path: 'l/lingerie/thermals',
              name: 'Thermals',
            },
          ],
          pagination: { totalItems: 20 },
        })
      ),
      getCategoriesError: '',
    });

    render(<CategorySearch {...mockProps} />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507{enter}'
    );

    expect(screen.getByDisplayValue('SubCategory_507')).toBeVisible();

    const resultsButton = await screen.findByText('SubCategory_507 | Thermals');

    act(() => {
      resultsButton.click();
    });

    expect(mockProps.onSelectCategory).toHaveBeenCalledWith('SubCategory_507');
  });

  it('should show selected category', () => {
    render(
      <CategorySearch {...mockProps} selectedCategories={[mockCategoryId]} />
    );

    expect(screen.getByText(mockCategory.identifier)).toBeInTheDocument();
  });

  it('should clear a selected category', async () => {
    render(
      <CategorySearch
        {...mockProps}
        selectedCategories={[mockCategoryId]}
        canRemoveCategory={true}
      />
    );

    const clearButton = await screen.findByLabelText(
      'Remove selected category'
    );

    act(() => {
      clearButton.click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalled();
  });
});
