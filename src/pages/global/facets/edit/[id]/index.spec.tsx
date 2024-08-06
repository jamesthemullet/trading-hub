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
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';

import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { renderWithProviders } from '../../../../../test/render-with-providers';
import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUpdateGlobalFacet = jest.fn();
const mockUpdateGlobalRuleSet = jest.fn().mockReturnValue(true);

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
      error: '',
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
        facets: [
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
        ],
      },
      error: '',
      isLoading: false,
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

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

    expect(mockRouter.push).toHaveBeenCalledWith('/global/facets');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: '123',
      ruleSet: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          },
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
          },
        ],
        rules: mockMerchandisingRules,
        isEnabled: true,
      },
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/global/facets/');
  });

  it('should render skeleton when loading', () => {
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: true,
      facets: [],
      error: '',
    });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should filter on the facet list', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    const search = screen.getByPlaceholderText('Search...');

    await act(() => userEvent.type(search, 'color'));

    await waitFor(() => {
      expect(screen.getAllByText('color')[0]).toBeVisible();
      expect(screen.getAllByText('color')[1]).toBeVisible();
      expect(screen.queryAllByText('size').length).toBe(0);
    });
  });

  it('should edit a display value', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    mockUpdateGlobalFacet.mockReturnValueOnce({
      status: 200,
    });

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

  it('should show an error if failing to edit a display value', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    const editButton = screen.getByLabelText('Edit display name for color');

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit color input field');
      await userEvent.type(editColorInput, 'colour edit');
    });

    const saveButton = screen.getByLabelText('Save color change');

    act(() => {
      saveButton.click();
    });

    expect(
      await screen.findByText('Error: failed to update facet')
    ).toBeVisible();
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
        screen.queryByLabelText('Row showing size as excluded')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing size as included')
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const includeOnlyOption = screen.getAllByText('Include only')[6];

      user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('Row showing size as included')
      ).toBeVisible();
      expect(
        screen.queryByLabelText('Row showing size as excluded')
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
});
