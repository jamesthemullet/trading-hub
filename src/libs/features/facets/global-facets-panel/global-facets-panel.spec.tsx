import { useReducer } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedCategoryRuleSet } from '@/libs/api';
import { useGetFacetAttributeValues } from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import GlobalFacetsPanel from './global-facets-panel';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
  onRefreshFacetList: jest.fn(),
};

const mockRouter: Partial<NextRouter> = {
  query: { id: 'test-ruleset-id' },
  push: jest.fn(),
  route: '',
  pathname: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalFacetsList: () => {
    return mockUseFacetsList;
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useReducer: jest.fn(),
}));

const categoryId1 = 'cat_123';

const mockRuleData: MerchandisingReturnedCategoryRuleSet = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
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
  excludedFacets: {
    facets: [
      {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
      },
    ],
  },
  categoriesInfo: [{ id: categoryId1 }],
  isEnabled: true,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

const dispatchMock = jest.fn();

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();

const initialIncludedFacetsMock = [
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
];

const facetsPanelLocalStateMock = {
  includedFacets: initialIncludedFacetsMock,
  excludedFacets: [],
};

describe('Global Facet Panel', () => {
  beforeEach(() => {
    jest
      .mocked(useReducer)
      .mockReturnValue([facetsPanelLocalStateMock, dispatchMock]);

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Global Facet Rule Editor',
      })
    ).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(onCancelSpy).toHaveBeenCalled();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaveSpy).toHaveBeenCalled();
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);

    expect(screen.getAllByTestId(/Row showing/)[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        payload: {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          newDisplayType: 'excluded',
        },
        type: 'CHANGE_DISPLAY_TYPE',
      });
    });
  });

  it('should initialise local reducer with correct data', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: {
        includedFacets: mockRuleData.facets?.map((facet) => facet.id),
        excludedFacets: mockRuleData.excludedFacets?.facets?.map(
          (facet) => facet.id
        ),
        countryCode: 'UK_IE',
      },
      type: 'INITIALISE_STATE',
    });
  });

  it('should initialise local reducer with empty included array if not passed', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <GlobalFacetsPanel
        ruleSetIncludedFacets={undefined}
        ruleSetExcludedFacets={undefined}
        isLoading={false}
        writeEnabled
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
      />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: {
        includedFacets: [],
        excludedFacets: [],
        countryCode: 'UK_IE',
      },
      type: 'INITIALISE_STATE',
    });
  });
});
