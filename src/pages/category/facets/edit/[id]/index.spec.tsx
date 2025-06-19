import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useGetCategories,
  useGetFacetAttributeValues,
  useRuleSetDetail,
} from '@/libs/hooks';
import { useGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import {
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

const mockUpdateGlobalFacet = jest.fn();
const mockUpdateRuleSet = jest.fn().mockReturnValue(true);
const updateRuleSet = {
  updateCategoryRuleSet: mockUpdateRuleSet,
  error: '',
};
const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetDetail: jest.fn(),
  useGetCategories: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
  useUpdateRuleSet: () => {
    return updateRuleSet;
  },
}));

jest.mock('@/libs/hooks/use-get-facet-attributes', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attributes'),
  useGetFacetAttributes: jest.fn(),
}));

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

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

describe('Category Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockUseRuleSetPreviewData);

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useGlobalFacetUpdate).mockReturnValue({
      handleGlobalFacetUpdate: mockUpdateGlobalFacet,
      error: '',
    });
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUnique: true,
      }),
      error: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<Page id={ruleSetId} />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should render column headings', () => {
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: ['SubCategory_428'],
      countryCode: 'UK_IE',
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
      rules: {
        pinnedProducts: [{ id: 'a1' }],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },

      isEnabled: false,
      facets: [
        {
          boosted: ['test include'],
          excludedValues: ['test exclude'],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
        },
      ],
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets/');
  });

  it('should save changes to a facet ruleset with a different country', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    const countryDropdown = screen.getByRole('button', {
      name: 'select market',
    });

    await user.click(countryDropdown);
    const irelandOption = screen.getByLabelText('select IE market only');
    await user.click(irelandOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: ['SubCategory_428'],
      countryCode: 'IE',
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
      rules: {
        pinnedProducts: [{ id: 'a1' }],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      isEnabled: false,
      facets: [
        {
          boosted: ['test include'],
          excludedValues: ['test exclude'],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
        },
      ],
    });
  });

  it('should render the skeleton loader', () => {
    jest.mocked(useRuleSetDetail).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      isLoading: true,
    }));
    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should change the order of rows', async () => {
    jest.mocked(useRuleSetDetail).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      facets: facetsListMock.facets,
      isLoading: false,
    }));
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Move color row up')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Move color row up')).toBeDisabled();

    await user.click(await screen.findByLabelText('Move color row down'));

    await waitFor(async () => {
      expect(await screen.findByLabelText('Move color row up')).toBeVisible();
    });

    await user.click(await screen.findByLabelText('Move color row up'));

    await waitFor(() => {
      expect(screen.getByLabelText('Move color row up')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Move color row up')).toBeDisabled();
  });

  it('should update status on dropdown change to exclude only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as included')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to include only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing category as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing category as included')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[6];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing category as included')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing category as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing category as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to algoControl', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Algo control')[0];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing category as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing category as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing category as included')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to algoControl from excluded', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing price as excluded')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing price as algoControl')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing price as included')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Algo control')[5];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing price as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing price as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing price as included')
    ).not.toBeInTheDocument();
  });

  it('should not update status if the same status is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const includeOnlyOption = screen.getAllByText('Include only')[1];

    act(() => {
      user.click(includeOnlyOption);
    });

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();
  });

  it('should save changes to category facet values', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: ['SubCategory_428'],
      countryCode: 'UK_IE',
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      rules: {
        pinnedProducts: [{ id: 'a1' }],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      isEnabled: false,
      facets: [
        {
          boosted: ['test include'],
          excludedValues: ['test exclude'],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        },
        {
          boosted: [],
          excludedValues: [],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
        },
      ],
    });
  });

  it('should update facet values', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getAllByRole('button', { name: 'Edit values' })[0]);
    expect(screen.getAllByText('More Silk')[0]).toBeVisible();

    await user.click(screen.getByLabelText('include More Silk'));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save changes to attributes' })
      ).toBeEnabled();
    });

    act(() => {
      screen
        .getByRole('button', { name: 'Save changes to attributes' })
        .click();
    });

    await waitFor(() => {
      expect(screen.queryByText('More Silk')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByRole('button', { name: 'Save' }).click();
    });

    await waitFor(() => {
      expect(mockUpdateRuleSet).toHaveBeenCalledWith({
        categoryIds: ['SubCategory_428'],
        countryCode: 'UK_IE',
        excludedFacets: {
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
            },
          ],
        },
        ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',

        rules: {
          pinnedProducts: [{ id: 'a1' }],
          blockedProducts: [],
          boosts: {
            numeric: [],
            alphanumeric: [],
            product: [],
          },
          buries: {
            numeric: [],
            alphanumeric: [],
            product: [],
          },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        isEnabled: false,
        facets: [
          {
            boosted: ['test include', 'More Silk'],
            excludedValues: ['test exclude'],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          },
          {
            boosted: [],
            excludedValues: [],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
          },
          {
            boosted: [],
            excludedValues: [],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
        ],
      });
    });
  }, 10000);

  describe('Scheduling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should set a scheduled date', async () => {
      const mockScheduleRuleset = {
        ...mockUseRuleSetPreviewData,
        ruleSetDetail: {
          ...mockUseRuleSetPreviewData.ruleSetDetail,
          endDate: '2022-04-13T22:59:00.000Z',
          startDate: '2022-04-11T23:00:00.000Z',
        },
      };

      jest
        .mocked(useRuleSetDetail)
        .mockImplementation(() => mockScheduleRuleset);

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
        '11/04/22 23:00 - 13/04/22 22:59'
      );

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

      const saveButton = within(
        screen.getByLabelText('Datepicker modal')
      ).getByRole('button', { name: 'Close schedule editor' });
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
        '16/04/22 23:00 - 17/04/22 22:59'
      );

      act(() => {
        screen.getByRole('button', { name: /^Save$/ }).click();
      });

      expect(mockUpdateRuleSet).toHaveBeenCalledWith({
        categoryIds: ['SubCategory_428'],
        countryCode: 'UK_IE',
        excludedFacets: {
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
            },
          ],
        },
        ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
        endDate: '2022-04-17T22:59:00.000Z',
        startDate: '2022-04-16T23:00:00.000Z',
        rules: {
          pinnedProducts: [{ id: 'a1' }],
          blockedProducts: [],
          boosts: {
            numeric: [],
            alphanumeric: [],
            product: [],
          },
          buries: {
            numeric: [],
            alphanumeric: [],
            product: [],
          },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        isEnabled: false,
        facets: [
          {
            boosted: ['test include'],
            excludedValues: ['test exclude'],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          },
          {
            boosted: [],
            excludedValues: [],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
          },
          {
            boosted: [],
            excludedValues: [],
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
        ],
      });
    });
  });

  describe('category operations', () => {
    it('should show empty list when category is removed', async () => {
      jest.mocked(useRuleSetDetail).mockReturnValue({
        ...mockUseRuleSetPreviewData,
        ruleSetDetail: {
          ...mockUseRuleSetPreviewData.ruleSetDetail,
          categoriesInfo: [
            {
              id: 'SubCategory_428',
            },
          ],
        },
      });

      renderWithProviders(<Page id={ruleSetId} />);
      const modalButton = await screen.findByRole('button', {
        name: 'Edit',
      });

      await act(async () => {
        modalButton.click();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close' })
        ).toBeInTheDocument();
      });

      const clearButton = await screen.findByLabelText(
        'Remove category from modal: SubCategory_428'
      );

      await act(async () => {
        clearButton.click();
      });

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });

  describe('Display Error Messaging', () => {
    it('should display error message when fetching ruleset fails', async () => {
      mockUseRuleSetPreviewData.error = 'Error fetching ruleset';

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.getByText(
          'Error whilst retrieving ruleset: Error fetching ruleset'
        )
      ).toBeVisible();
    });

    it('should display error message when updating ruleset fails', async () => {
      updateRuleSet.error = 'Failed to update';

      renderWithProviders(<Page id={ruleSetId} />);

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('Error whilst updating ruleset: Failed to update')
      ).toBeVisible();
    });

    it('should display error message when fetching facet list fails', async () => {
      mockUseFacetsList.error = 'Error fetching facet list';

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.getByText(
          'Error retrieving facet list: Error fetching facet list'
        )
      ).toBeVisible();
    });
  });
});
