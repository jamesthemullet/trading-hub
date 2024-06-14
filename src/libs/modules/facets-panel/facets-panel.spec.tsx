import { act, Screen, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { useGetCategories } from '@/libs/hooks';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanel } from './facets-panel';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

const logSpy = jest.spyOn(console, 'log');
logSpy.mockImplementation(jest.fn());

const CATEGORY_SEARCH_PLACEHOLDER_TEXT = 'Search...';
const categoryId1 = 'cat_123';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
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
const mockFacet = {
  displayValue: 'color',
  id: 'color-id',
  indexPropertyName: 'color',
  lastChanged: { date: '2021-01-01T08:34:15Z', user: 'Test User' },
  merged: [],
  status: 'included',
};

const mockDefaultOrderData = [
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Include only' },
];

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

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const setSearchSpy = jest.fn();
const onFacetDataChangeSpy = jest.fn();

describe('Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    logSpy.mockClear();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should render column headings', () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={[]}
        onFacetDataChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancelSpy).toHaveBeenCalled();
  });

  it('should preview changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Preview' }));

    // TODO: Implement preview functionality
    expect(logSpy).toHaveBeenCalled();
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetsDataRowOrderChange={onFacetsDataRowOrderChangeSpy}
        displayRowOrderControls={true}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(onFacetsDataRowOrderChangeSpy).toHaveBeenCalledWith(0, 1);
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetsDataRowOrderChange={onFacetsDataRowOrderChangeSpy}
        displayRowOrderControls={true}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move size row up' }));

    expect(onFacetsDataRowOrderChangeSpy).toHaveBeenCalledWith(1, -1);
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaveSpy).toHaveBeenCalled();
  });

  it('should select a category on user input, and clear category when "remove selected category" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
      />
    );

    await selectCategory(screen, user);

    expect(screen.getByText('cat_123')).toBeVisible();

    const clearButton = screen.getByLabelText('Remove selected category');

    act(() => {
      clearButton.click();
    });

    expect(screen.queryByText('cat_123')).not.toBeInTheDocument();
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        defaultOrderData={mockDefaultOrderData}
        onFacetDataChange={onFacetDataChangeSpy}
      />
    );

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);

    expect(screen.getAllByTestId('facets-table-row')[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(onFacetDataChangeSpy).toHaveBeenCalledWith(
        0,
        'excluded',
        mockFacet
      );
    });
  });

  it('should filter on the facet list', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        setSearch={setSearchSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        defaultCategory={{ identifier: categoryId1, name: categoryName1 }}
        onFacetDataChange={jest.fn()}
      />
    );

    const search = screen.getByPlaceholderText('Search...');

    await act(() => userEvent.type(search, 'color'));

    await waitFor(() => expect(setSearchSpy).toHaveBeenCalledWith('color'));
  });

  it('should display category select if name is passed', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        categoryName={categoryName1}
        onFacetDataChange={jest.fn()}
      />
    );

    expect(screen.queryByPlaceholderText('Search...')).toBe(null);
    expect(screen.getByText(categoryName1)).toBeInTheDocument();
  });

  it('should edit a display value', async () => {
    const onSaveSpy = jest.fn();
    const onCancelSpy = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={onFacetDataChangeSpy}
      />
    );

    const editButton = screen.getByLabelText('Edit display name for color');

    await user.click(editButton);

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit color input field');
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('color');
      userEvent.clear(editColorInput);
      await userEvent.type(editColorInput, 'colour');
    });

    const saveButton = screen.getByLabelText('Save color change');

    await user.click(saveButton);

    expect(onFacetDataChangeSpy).toHaveBeenCalledWith(0, 'colour', mockFacet);
  });

  describe('Add Facet Modal', () => {
    const openModal = async () => {
      renderWithProviders(
        <FacetsPanel
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          title="Facet Rule Editor"
          facetsData={globalFacetsListMock.facets}
          onFacetDataChange={jest.fn()}
        />
      );

      const addFacetButton = screen.getByText('Add facet');

      act(() => {
        addFacetButton.click();
      });
    };

    it('should open the modal', async () => {
      await openModal();

      expect(
        screen.getByRole('heading', { level: 3, name: 'Add facet' })
      ).toBeVisible();
    });

    it('should close the modal on click of the close button', async () => {
      const user = userEvent.setup({ delay: null });
      await openModal();

      expect(
        screen.getByRole('heading', { level: 3, name: 'Add facet' })
      ).toBeVisible();

      const closeButton = screen.getByRole('button', { name: 'Close Modal' });

      act(() => {
        user.click(closeButton);
      });

      waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 3, name: 'Add facet' })
        ).not.toBeVisible();
      });
    });
  });

  describe('Edit Facet Values Modal', () => {
    const openModal = async () => {
      renderWithProviders(
        <FacetsPanel
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          title="Facet Rule Editor"
          facetsData={globalFacetsListMock.facets}
          onFacetDataChange={jest.fn()}
        />
      );

      const editFacetValuesButton = screen.getAllByText('Edit values')[0];

      act(() => {
        editFacetValuesButton.click();
      });
    };

    it('should open the modal', async () => {
      await openModal();

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Facet value settings of: color',
        })
      ).toBeVisible();
    });

    it('should close the modal on click of the close button', async () => {
      const user = userEvent.setup({ delay: null });
      await openModal();

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Facet value settings of: color',
        })
      ).toBeVisible();

      const closeButton = screen.getByRole('button', { name: 'Close Modal' });

      act(() => {
        user.click(closeButton);
      });

      waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          })
        ).not.toBeVisible();
      });
    });
  });
});
