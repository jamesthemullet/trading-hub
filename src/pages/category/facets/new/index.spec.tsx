import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetCategories, useRuleSetCreate } from '@/libs/hooks';
import { globalFacetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import NewFacetRuleset from './index.page';

const categoryId1 = 'cat_123';
const categoryId2 = 'cat_456';
const categoryName1 = 'jeans';
const categoryName2 = 'dresses';
const categoryPath1 = 'l/jeans';
const categoryPath2 = 'l/women/dresses';

const mockUseFacetsList = {
  isLoading: false,
  facets: globalFacetsListMock.facets,
  error: '',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetCreate: jest.fn(),
  useGetCategories: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
}));

const logSpy = jest.spyOn(console, 'log');
logSpy.mockImplementation(jest.fn());

const INPUT_PLACEHOLDER_TEXT = 'Search...';
const NEW_RULE_BUTTON_TEXT = 'Create';

const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId2,
      name: categoryName2,
      path: categoryPath2,
    },
  ],
  pagination: { totalItems: 20 },
};

describe('Category Facet Management New', () => {
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
  });

  it('should render category ruleset facet editor', async () => {
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });
    renderWithProviders(<NewFacetRuleset />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewFacetRuleset />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup();
    const createRuleset = jest.fn().mockResolvedValue({});
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset,
      error: '',
    });
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
    });

    const excludeOnlyOption = screen.getAllByText('Exclude only')[1];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing size as excluded')
      ).toBeVisible();
    });

    const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      submit.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();
    expect(createRuleset).toHaveBeenCalledWith({
      categoryIds: ['cat_123'],
      countryCode: 'UK_IE',
      facets: [
        {
          displayValue: 'color',
          indexPropertyName: 'color',
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          lastChanged: {
            date: '2021-01-01T08:34:15Z',
            user: 'Test User',
          },
          merged: [
            {
              displayValue: 'test merged group',
              mergedValues: ['merged 1', 'merged 2'],
            },
          ],
        },
      ],
      isEnabled: true,
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
          },
        ],
      },
      rules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });

  it('should update status on dropdown change to include only, and re-order by status', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing category as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing category as included')
    ).not.toBeInTheDocument();

    act(() => {
      user.click(screen.getAllByText('Include only')[3]);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing category as included')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing category as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing category as algoControl')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();

    act(() => {
      user.click(screen.getAllByText('Include only')[2]);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
    });

    await user.click(await screen.findByLabelText('Move category row down'));

    await waitFor(async () => {
      expect(
        await screen.findByLabelText('Move category row up')
      ).toBeVisible();
    });

    await user.click(await screen.findByLabelText('Move category row up'));

    await waitFor(async () => {
      expect(
        await screen.findByLabelText('Move category row up')
      ).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('Move category row up')).toBeDisabled();
  });

  it('should update status on dropdown change to exclude only, and re-order by status', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();

    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as excluded')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to algoControl', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Algo control')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to algoControl from excluded', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Exclude only')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as excluded')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Algo control')[8];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to included from excluded', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Exclude only')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as excluded')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[4];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should not update status if the same status is selected', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await user.type(
      screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
      'SubCategory_507'
    );

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );
    act(() => {
      categoryToSelect.click();
    });

    expect(
      screen.getByLabelText('Row showing color as algoControl')
    ).toBeVisible();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Algo control')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByLabelText('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();
  });

  describe('Scheduling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should save scheduling changes to a facet', async () => {
      const user = userEvent.setup({ delay: 0 });
      const createRuleset = jest.fn().mockResolvedValue({});
      jest.mocked(useRuleSetCreate).mockReturnValue({
        createRuleset,
        error: '',
      });
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });
      renderWithProviders(<NewFacetRuleset />);

      expect(screen.getByText('Duration')).toBeVisible();

      act(() => {
        user.type(
          screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
          'SubCategory_507{Enter}'
        );
      });
      act(() => {
        jest.runAllTimers();
      });

      const categoryToSelect = await screen.findByText(
        `${categoryId1} | ${categoryName1} | ${categoryPath1}`
      );
      act(() => {
        categoryToSelect.click();
      });

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      const toggle = screen.getByTitle('Toggle');
      act(() => {
        toggle.click();
      });

      await waitFor(() => {
        const startDate = screen.getAllByText('16')[1];
        act(() => {
          startDate.click();
        });
      });

      await waitFor(() => {
        const endDate = screen.getAllByText('17')[1];
        act(() => {
          endDate.click();
        });
      });

      const saveButton = within(screen.getByRole('dialog')).getByRole(
        'button',
        {
          name: 'Close schedule editor',
        }
      );
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
        '16/04/22 00:00 - 17/04/22 23:59'
      );

      const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
      act(() => {
        submit.click();
      });

      expect(createRuleset).toHaveBeenCalledWith({
        categoryIds: ['cat_123'],
        countryCode: 'UK_IE',
        facets: [],
        excludedFacets: {
          facets: [],
        },
        isEnabled: true,
        endDate: '2022-04-17T23:59:00.000Z',
        startDate: '2022-04-16T00:00:00.000Z',
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          excludes: { alphanumeric: [] },
          includes: { alphanumeric: [] },
          pinnedProducts: [],
        },
      });
    });
  });
});
