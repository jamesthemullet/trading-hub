import { act, screen, Screen, waitFor } from '@testing-library/react';

import { useRouter } from 'next/router';

import Page from './index.page';
import { renderWithProviders } from '../../../../../test/render-with-providers';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { useGetCategories } from '../../../../../libs/hooks';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../../../libs/hooks/use-get-categories', () => ({
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

describe('Global Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
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

  it('should select a category on user input, and clear category when "remove selected category" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await selectCategory(screen, user);

    expect(screen.getByText('cat_123')).toBeVisible();

    const clearButton = screen.getByLabelText('Remove selected category');

    act(() => {
      clearButton.click();
    });

    expect(screen.queryByText('cat_123')).not.toBeInTheDocument();
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

      waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 3, name: 'Add facet' })
        ).toBeVisible();
      });
    });

    it('should close the modal on click of the close button', async () => {
      const user = userEvent.setup({ delay: null });
      await openModal();

      waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 3, name: 'Add facet' })
        ).toBeVisible();
      });

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
