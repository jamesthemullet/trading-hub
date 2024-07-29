import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useFacetsList,
  useGetCategories,
  useGetFacetAttributeValues,
  useRuleSetPreview,
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
const mockUpdateRuleSet = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetPreview: jest.fn(),
  useGetCategories: jest.fn(),
  useFacetsList: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalFacetUpdate: () => {
    return { handleUpdate: mockUpdateGlobalFacet };
  },
  useCategoryRuleSetUpdate: () => {
    return { updateRuleSet: mockUpdateRuleSet };
  },
}));
jest.mock('@/libs/hooks/use-get-facet-attributes', () => ({
  useGetFacetAttributes: jest.fn(),
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
      .mocked(useRuleSetPreview)
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
    logSpy.mockClear();
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
      .mocked(useRuleSetPreview)
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

    expect(mockRouter.push).toHaveBeenCalledWith('/category/facets');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // TODO: Implement save functionality
    expect(logSpy).toHaveBeenCalled();
  });

  it('should render the skeleton loader', () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => ({
      ...mockUseRuleSetPreviewData,
      isLoading: true,
    }));
    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should change the order of rows', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => ({
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
});
