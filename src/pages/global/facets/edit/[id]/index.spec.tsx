import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetCategories } from '@/libs/hooks';
import { useGlobalFacetsList } from '@/libs/hooks/use-global-facets-list';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

import { renderWithProviders } from '../../../../../test/render-with-providers';
import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetCategories: jest.fn(),
}));

jest.mock('@/libs/hooks/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(),
}));

const logSpy = jest.spyOn(console, 'log');
logSpy.mockImplementation(jest.fn());

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

describe('Global Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: false,
      facets: globalFacetsListMock.facets,
      error: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    logSpy.mockClear();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<Page />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Global Facet Rule Editor',
      })
    ).toBeVisible();
  });

  it('should render column headings', () => {
    renderWithProviders(<Page />);

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/global/facets');
  });

  it('should preview changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getByRole('button', { name: 'Preview' }));

    // TODO: Implement preview functionality
    expect(logSpy).toHaveBeenCalled();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // TODO: Implement save functionality
    expect(logSpy).toHaveBeenCalled();
  });

  it('should render skeleton when loading', () => {
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: true,
      facets: [],
      error: '',
    });

    renderWithProviders(<Page />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should filter on the facet list', async () => {
    renderWithProviders(<Page />);

    const search = screen.getByPlaceholderText('Search...');

    await act(() => userEvent.type(search, 'color'));

    await waitFor(() => {
      expect(screen.getAllByText('color')[0]).toBeVisible();
      expect(screen.getAllByText('color')[1]).toBeVisible();
      expect(screen.queryAllByText('size').length).toBe(0);
    });
  });

  it('should edit a display value', async () => {
    renderWithProviders(<Page />);

    const editButton = screen.getByLabelText('Edit display name for color');

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit color input field');
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('color');
      userEvent.clear(editColorInput);
      await userEvent.type(editColorInput, 'colour');
    });

    const saveButton = screen.getByLabelText('Save color change');

    act(() => {
      saveButton.click();
    });

    await waitFor(() => {
      const newEditButton = screen.getByLabelText(
        'Edit display name for colour'
      );
      expect(newEditButton).toBeVisible();
    });
  });

  describe('Add Facet Modal', () => {
    const openModal = async () => {
      renderWithProviders(<Page />);

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
});
