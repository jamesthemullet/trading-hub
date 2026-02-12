import { useState } from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetCategories } from '@/libs/hooks/use-get-categories';
import { renderWithProviders } from '@/test/render-with-providers';

import { CategorySearch } from './category-search';

jest.mock('@/libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

const mockProps = {
  categoryResults: {
    categories: [],
    pagination: {},
  },
  searchValue: '',
  selectedCategories: [],
  selectedCategoriesInfo: [],
  onClearSelection: jest.fn(),
  onSubmit: jest.fn(),
  onSearchChange: jest.fn(),
  onSelectCategory: jest.fn(),
  previewCategory: undefined,
  selectPreviewCategory: jest.fn(),
  writeEnabled: true,
};

const mockCategoryId = 'SubCategory_507';
const mockCategoryId2 = 'SubCategory_429';
const mockCategoryId3 = 'SubCategory_1137';

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
  afterAll(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });
  });

  it('should render correctly', () => {
    renderWithProviders(<CategorySearch {...mockProps} />);

    expect(
      screen.getByText('Add categories to display here')
    ).toBeInTheDocument();
  });

  it('should not be editable in read only mode', () => {
    renderWithProviders(<CategorySearch {...mockProps} writeEnabled={false} />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('should search while typing', async () => {
    const user = userEvent.setup();
    const mockSelectCategory = jest.fn();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(
      <CategorySearch {...mockProps} onSelectCategory={mockSelectCategory} />
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
    expect(mockSelectCategory).toHaveBeenCalledWith({
      identifier: 'SubCategory_507',
      name: 'Thermals',
      path: 'l/lingerie/thermals',
    });
  });

  it('should show and select search results', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(<CategorySearch {...mockProps} />);

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

    expect(mockProps.onSelectCategory).toHaveBeenCalledWith(mockCategory);
  });

  it('should show and remove search results via keyboard', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(<CategorySearch {...mockProps} />);

    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const input = screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT);

    await user.type(input, 'SubCategory_507{enter}');

    expect(screen.getByDisplayValue('SubCategory_507')).toBeVisible();

    const resultsButton = await screen.findByText(
      `${mockCategory.identifier} | ${mockCategory.name} | ${mockCategory.path}`
    );

    expect(resultsButton).toBeVisible();

    input.focus();
    await user.keyboard('{Tab}{Escape}');

    await waitFor(() => {
      expect(resultsButton).not.toBeVisible();
    });
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

    renderWithProviders(<CategorySearch {...mockProps} />);

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
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507{enter}'
    );

    expect(screen.getByDisplayValue('SubCategory_507')).toBeVisible();

    const resultsButton = await screen.findByText('SubCategory_507 | Thermals');

    act(() => {
      resultsButton.click();
    });

    expect(mockProps.onSelectCategory).toHaveBeenCalledWith({
      identifier: 'SubCategory_507',
      name: 'Thermals',
      path: '',
    });
  });

  describe('Category Modal', () => {
    it('should show and close a modal when there are more than one categories', async () => {
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={[
            mockCategoryId,
            mockCategoryId2,
            mockCategoryId3,
          ]}
          previewCategory={mockCategoryId}
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

      const modalHeading = screen.getByRole('heading', {
        name: 'Search Categories',
      });

      expect(modalHeading).toBeVisible();

      const closeButton = await screen.findByRole('button', {
        name: 'Close',
      });

      act(() => {
        closeButton.click();
      });

      await waitFor(() => {
        expect(modalHeading).not.toBeVisible();
      });
    });

    it('should change the selected category', async () => {
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={[
            mockCategoryId,
            mockCategoryId2,
            mockCategoryId3,
          ]}
          selectedCategoriesInfo={[
            {
              id: mockCategoryId,
              name: 'mockCategoryId',
              plpUrl: 'foo/bar',
            },
            {
              id: mockCategoryId2,
              name: 'mockCategoryId2',
              plpUrl: 'foo/bar',
            },
            {
              id: mockCategoryId3,
              name: 'mockCategoryId3',
              plpUrl: 'foo/bar',
            },
          ]}
          previewCategory={mockCategoryId}
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

      const category2 = await within(
        await screen.findByLabelText('Category search modal')
      ).findByRole('button', {
        name: `Additional category ${mockCategoryId2}`,
      });

      act(() => {
        category2.click();
      });

      expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(
        mockCategoryId2
      );
    });

    it('should remove additional categories', async () => {
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={[
            mockCategoryId,
            mockCategoryId2,
            mockCategoryId3,
          ]}
          previewCategory={mockCategoryId}
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

      const category2remove = await screen.findByRole('button', {
        name: `Remove category from modal: ${mockCategoryId2}`,
      });

      act(() => {
        category2remove.click();
      });

      expect(mockProps.onClearSelection).toHaveBeenCalledWith(mockCategoryId2);
    });

    it('should select an additional category as the preview category if the preview category is removed', async () => {
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={[
            mockCategoryId,
            mockCategoryId2,
            mockCategoryId3,
          ]}
          previewCategory={mockCategoryId}
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

      const category1remove = await screen.findAllByRole('button', {
        name: `Remove category from modal: ${mockCategoryId}`,
      });

      act(() => {
        category1remove[0].click();
      });

      expect(mockProps.onClearSelection).toHaveBeenCalledWith(mockCategoryId);
      expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(
        mockCategoryId2
      );
    });

    it('should show error when adding a duplicate keyword', async () => {
      const user = userEvent.setup();
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={[mockCategoryId]}
          selectedCategoriesInfo={[
            {
              id: mockCategoryId,
              name: 'Dresses',
              plpUrl: '/l/dresses',
            },
          ]}
          previewCategory={mockCategoryId}
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

      expect(
        screen.getByText('Ruleset SubCategory_507 has already been added')
      ).toBeVisible();
    });

    it('should clear the preview category from the modal if the preview category is removed and no other categories have been selected', async () => {
      const TestParentComponent = () => {
        const [selectedCategories, setSelectedCategories] = useState([
          mockCategoryId,
          mockCategoryId2,
        ]);
        const [previewCategory, setPreviewCategory] = useState(mockCategoryId);

        return (
          <CategorySearch
            {...mockProps}
            selectedCategories={selectedCategories}
            previewCategory={previewCategory}
            onClearSelection={() => {
              setSelectedCategories([mockCategoryId2]);
              setPreviewCategory(mockCategoryId2);
            }}
          />
        );
      };

      renderWithProviders(<TestParentComponent />);

      const modalButton = await screen.findByRole('button', {
        name: 'Edit',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const category1remove = await screen.findAllByRole('button', {
        name: `Remove category from modal: ${mockCategoryId}`,
      });

      act(() => {
        category1remove[0].click();
      });

      expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(
        mockCategoryId2
      );

      const category2remove = await screen.findAllByRole('button', {
        name: `Remove category from modal: ${mockCategoryId2}`,
      });

      act(() => {
        category2remove[0].click();
      });

      expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Dropdown', () => {
    it('should show a tooltip when hovering over a category', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={['SubCategory_507']}
          selectedCategoriesInfo={[
            {
              id: 'SubCategory_507',
              name: 'Dresses',
              plpUrl: '/l/dresses',
            },
          ]}
          previewCategory={mockCategoryId}
        />
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      const dropdownButton = screen.getByRole('button', {
        name: 'select category',
      });
      expect(within(dropdownButton).getByText('SubCategory_507')).toBeVisible();

      await user.hover(dropdownButton);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeVisible();
      });

      await user.unhover(dropdownButton);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('open the modal when only one category is in the dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={['SubCategory_507']}
          selectedCategoriesInfo={[
            {
              id: 'SubCategory_507',
              name: 'Dresses',
              plpUrl: '/l/dresses',
            },
          ]}
          previewCategory={mockCategoryId}
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'select category',
      });

      await user.click(dropdownButton);

      await waitFor(async () => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });
    });

    it('select different categories from the dropdown', async () => {
      const user = userEvent.setup();
      const mockSelectCategory = jest.fn();
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectPreviewCategory={mockSelectCategory}
          selectedCategories={['SubCategory_507', 'SubCategory_1387']}
          selectedCategoriesInfo={[
            {
              id: 'SubCategory_507',
              name: 'Dresses',
              plpUrl: '/l/dresses',
            },
            {
              id: 'SubCategory_1387',
              name: 'Orchids',
              plpUrl: 'l/flowers-and-plants/plants/orchids',
            },
          ]}
          previewCategory={mockCategoryId}
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'select category',
      });

      await user.click(dropdownButton);

      const otherCategory = screen.getByRole('menuitem', {
        name: 'SubCategory_1387 Orchids',
      });
      await user.click(otherCategory);

      await waitFor(() => {
        expect(mockSelectCategory).toHaveBeenCalledWith('SubCategory_1387');
      });
    });

    it('should close the dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CategorySearch
          {...mockProps}
          selectedCategories={['SubCategory_507', 'SubCategory_1387']}
          selectedCategoriesInfo={[
            {
              id: 'SubCategory_507',
              name: 'Dresses',
              plpUrl: '/l/dresses',
            },
            {
              id: 'SubCategory_1387',
              name: 'Orchids',
              plpUrl: 'l/flowers-and-plants/plants/orchids',
            },
          ]}
          previewCategory={mockCategoryId}
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'select category',
      });

      await user.click(dropdownButton);

      expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
