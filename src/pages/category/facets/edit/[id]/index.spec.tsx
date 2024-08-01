import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useFacetsList,
  useGetCategories,
  useGetFacetAttributeValues,
  useRuleSetDetail,
} from '@/libs/hooks';
import {
  attributeValuesMock,
  globalFacetsListMock,
} from '@/pages/api/merchandising/mocks';
import {
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

const mockUpdateGlobalFacet = jest.fn();
const mockUpdateRuleSet = jest.fn().mockReturnValue(true);

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetDetail: jest.fn(),
  useGetCategories: jest.fn(),
  useFacetsList: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalFacetUpdate: () => {
    return { handleUpdate: mockUpdateGlobalFacet };
  },
  useUpdateRuleSet: () => {
    return { updateRuleSet: mockUpdateRuleSet };
  },
}));
jest.mock('@/libs/hooks/use-get-facet-attributes', () => ({
  useGetFacetAttributes: jest.fn(),
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
    jest.mocked(useFacetsList).mockReturnValue({
      isLoading: false,
      facets: globalFacetsListMock.facets,
      error: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockUseRuleSetPreviewData);

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock['values'],
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
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
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockUseRuleSetPreviewData);
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
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
      categoryId: 'SubCategory_428',
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      rules: {
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
        },
        isEnabled: false,
        facets: [
          {
            displayValue: 'color',
            indexPropertyName: 'color',
            status: 'included',
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
          {
            displayValue: 'size',
            indexPropertyName: 'size',
            status: 'excluded',
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
            lastChanged: {
              date: '2021-01-02T08:34:15Z',
              user: 'Test User',
            },
            merged: [],
          },
          {
            displayValue: 'brand',
            indexPropertyName: 'brand',
            status: 'included',
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
            lastChanged: {
              date: '2021-01-03T08:34:15Z',
              user: 'Test User',
            },
            merged: [],
          },
        ],
      },
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets/');
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
      facets: globalFacetsListMock.facets,
      isLoading: false,
    }));
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => {
      screen.getByRole('button', { name: 'Move color row up' });
    }).toThrow('Unable to find an accessible element with the role "button"');

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move color row up' })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Move color row up' }));

    expect(() => {
      screen.getByRole('button', { name: 'Move color row up' });
    }).toThrow('Unable to find an accessible element with the role "button"');
  });

  it('should update status on dropdown change to exclude only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing color as excluded')
      ).not.toBeInTheDocument();
    });

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as excluded')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing color as included')
      ).not.toBeInTheDocument();
    });
  });

  it('should update status on dropdown change to include only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Row showing category as excluded')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing category as included')
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[6];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing category as included')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing category as excluded')
      ).not.toBeInTheDocument();
    });
  });

  it('should not update status if the same status is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    expect(
      screen.getByLabelText('Row showing color as included')
    ).toBeVisible();
    expect(
      screen.queryByLabelText('Row showing color as excluded')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[1];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing color as included')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing color as excluded')
      ).not.toBeInTheDocument();
    });
  });
});
