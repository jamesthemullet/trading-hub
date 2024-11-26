import { useState } from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { useGetCategories } from '../../hooks/use-get-categories';
import { FeatureFlagContext } from '../context/feature-flag';
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
  previewCategory: undefined,
  selectPreviewCategory: jest.fn(),
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

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should search while typing', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(<CategorySearch {...mockProps} />);

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

    renderWithProviders(<CategorySearch {...mockProps} />);

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

  it('should show and remove search results via keyboard', async () => {
    const user = userEvent.setup();
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    renderWithProviders(<CategorySearch {...mockProps} />);

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
    renderWithProviders(
      <CategorySearch {...mockProps} selectedCategories={[mockCategoryId]} />
    );

    expect(screen.getByText(mockCategory.identifier)).toBeInTheDocument();
  });

  it('should clear a selected category', async () => {
    renderWithProviders(
      <CategorySearch {...mockProps} selectedCategories={[mockCategoryId]} />
    );

    const clearButton = await screen.findByLabelText(
      'Remove selected category'
    );

    act(() => {
      clearButton.click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalled();
  });

  it('should show and remove multiple categories', async () => {
    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasMultipleCategories: true, hasIreland: false }}
      >
        <CategorySearch
          {...mockProps}
          selectedCategories={[mockCategoryId, mockCategoryId2]}
          previewCategory={mockCategoryId}
        />
      </FeatureFlagContext.Provider>
    );

    const dressCategory = await screen.findByRole('button', {
      name: mockCategoryId2,
    });

    act(() => {
      dressCategory.click();
    });

    expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(
      mockCategoryId2
    );

    const removeDressCategory = await screen.findByRole('button', {
      name: `Remove category: ${mockCategoryId2}`,
    });

    act(() => {
      removeDressCategory.click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalledWith(mockCategoryId2);
  });

  it('should select an additional category as the preview category if the preview category is removed', async () => {
    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasMultipleCategories: true, hasIreland: false }}
      >
        <CategorySearch
          {...mockProps}
          selectedCategories={[mockCategoryId, mockCategoryId2]}
          previewCategory={mockCategoryId}
        />
      </FeatureFlagContext.Provider>
    );

    const category1remove = await screen.findAllByRole('button', {
      name: `Remove category: ${mockCategoryId}`,
    });

    act(() => {
      category1remove[0].click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalledWith(mockCategoryId);
    expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(
      mockCategoryId2
    );
  });

  it('should clear the preview category if the preview category is removed and no other categories have been selected', async () => {
    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasMultipleCategories: true, hasIreland: false }}
      >
        <CategorySearch
          {...mockProps}
          selectedCategories={[mockCategoryId]}
          previewCategory={mockCategoryId}
        />
      </FeatureFlagContext.Provider>
    );

    const category1remove = await screen.findAllByRole('button', {
      name: `Remove category: ${mockCategoryId}`,
    });

    act(() => {
      category1remove[0].click();
    });

    expect(mockProps.onClearSelection).toHaveBeenCalledWith(mockCategoryId);
    expect(mockProps.selectPreviewCategory).toHaveBeenCalledWith(undefined);
  });

  describe('Category Modal', () => {
    it('should show and close a modal when there are more than one categories', async () => {
      renderWithProviders(
        <FeatureFlagContext.Provider
          value={{ hasMultipleCategories: true, hasIreland: false }}
        >
          <CategorySearch
            {...mockProps}
            selectedCategories={[
              mockCategoryId,
              mockCategoryId2,
              mockCategoryId3,
            ]}
            previewCategory={mockCategoryId}
          />
        </FeatureFlagContext.Provider>
      );

      const modalButton = await screen.findByRole('button', {
        name: 'View all',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close modal' })
        ).toBeVisible();
      });

      const modalHeading = screen.getByRole('heading', {
        name: 'Category',
      });

      expect(modalHeading).toBeVisible();

      const closeButton = await screen.findByRole('button', {
        name: 'Close modal',
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
        <FeatureFlagContext.Provider
          value={{ hasMultipleCategories: true, hasIreland: false }}
        >
          <CategorySearch
            {...mockProps}
            selectedCategories={[
              mockCategoryId,
              mockCategoryId2,
              mockCategoryId3,
            ]}
            previewCategory={mockCategoryId}
          />
        </FeatureFlagContext.Provider>
      );

      const modalButton = await screen.findByRole('button', {
        name: 'View all',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close modal' })
        ).toBeVisible();
      });

      const category2 = await within(
        await screen.findByLabelText('Category search modal')
      ).findByRole('button', {
        name: mockCategoryId2,
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
        <FeatureFlagContext.Provider
          value={{ hasMultipleCategories: true, hasIreland: false }}
        >
          <CategorySearch
            {...mockProps}
            selectedCategories={[
              mockCategoryId,
              mockCategoryId2,
              mockCategoryId3,
            ]}
            previewCategory={mockCategoryId}
          />
        </FeatureFlagContext.Provider>
      );

      const modalButton = await screen.findByRole('button', {
        name: 'View all',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close modal' })
        ).toBeVisible();
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
        <FeatureFlagContext.Provider
          value={{ hasMultipleCategories: true, hasIreland: false }}
        >
          <CategorySearch
            {...mockProps}
            selectedCategories={[
              mockCategoryId,
              mockCategoryId2,
              mockCategoryId3,
            ]}
            previewCategory={mockCategoryId}
          />
        </FeatureFlagContext.Provider>
      );

      const modalButton = await screen.findByRole('button', {
        name: 'View all',
      });

      act(() => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close modal' })
        ).toBeVisible();
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
  });

  it('should clear the preview category from the modal if the preview category is removed and no other categories have been selected', async () => {
    const TestParentComponent = () => {
      const [selectedCategories, setSelectedCategories] = useState([
        mockCategoryId,
        mockCategoryId2,
      ]);
      const [previewCategory, setPreviewCategory] = useState(mockCategoryId);

      return (
        <FeatureFlagContext.Provider
          value={{ hasMultipleCategories: true, hasIreland: false }}
        >
          <CategorySearch
            {...mockProps}
            selectedCategories={selectedCategories}
            previewCategory={previewCategory}
            onClearSelection={() => {
              setSelectedCategories([mockCategoryId2]);
              setPreviewCategory(mockCategoryId2);
            }}
          />
        </FeatureFlagContext.Provider>
      );
    };

    renderWithProviders(<TestParentComponent />);

    const modalButton = await screen.findByRole('button', {
      name: 'View all',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeVisible();
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
