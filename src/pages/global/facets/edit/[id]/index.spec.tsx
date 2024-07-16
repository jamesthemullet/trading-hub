import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useGetCategories,
  useGlobalFacetsList,
  useGlobalRuleSetDetail,
  useRuleSet,
} from '@/libs/hooks';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

import { renderWithProviders } from '../../../../../test/render-with-providers';
import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUpdateGlobalFacet = jest.fn();
const mockUpdateGlobalRuleSet = jest.fn();

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetCategories: jest.fn(),
  useRuleSet: jest.fn(),
  useGlobalFacetsList: jest.fn(),
  useGlobalRuleSetDetail: jest.fn(),
  useGlobalFacetUpdate: () => {
    return { handleUpdate: mockUpdateGlobalFacet };
  },
  useGlobalRuleSetUpdate: () => {
    return { saveGlobalRuleset: mockUpdateGlobalRuleSet, isSaving: true };
  },
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
const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

describe('Global Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { id: '123' },
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
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: 'foo00',
          },
        ],
        categoryId: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchandisingRules,
        setRuleSets: jest.fn(),
        facets: [],
      })),
      globalRuleSets: [],
      pagination: {
        totalItems: 80,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
    });
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: {
        id: '123',
        isEnabled: true,
        lastChanged: {
          date: '2021-01-01',
          user: 'Test user',
        },
        rules: mockMerchandisingRules,
        facets: [],
      },
      error: '',
      isLoading: false,
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
    expect(screen.queryByRole('button', { name: 'Preview' })).toBeNull();
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

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: '123',
      ruleSet: {
        facets: globalFacetsListMock.facets,
        rules: mockMerchandisingRules,
        isEnabled: true,
      },
    });
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
      expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
        data: {
          boosted: undefined,
          displayValue: 'colour',
          excludedValues: undefined,
          indexPropertyName: 'color',
        },
        facetId: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      });
    });
  });

  it('should update status on dropdown change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />);

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    expect(screen.getAllByTestId('facets-table-row')[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdownHeader);

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(screen.getAllByTestId('facets-table-row')[0]).toHaveStyle(
        'background-color: #FFF3F4'
      );
    });
  });
});
