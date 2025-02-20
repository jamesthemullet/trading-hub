import { useReducer } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  CountryCode,
  ReturnedKeywordRuleSet,
  SearchPreviewResponseBeta,
} from '@/libs/api';
import {
  useFacetsList,
  useGetFacetAttributeValues,
  usePreview,
} from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';
import { renderWithProviders } from '@/test/render-with-providers';

import SearchFacetsPanel from './search-facets-panel';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useFacetsList: jest.fn(),
  usePreview: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useReducer: jest.fn(),
}));

const mockSearchTerms = ['red dress'];

const mockRuleData: ReturnedKeywordRuleSet = {
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
  searchTerms: mockSearchTerms,
  isEnabled: true,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

const mockFacet = {
  displayValue: 'color',
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  indexPropertyName: 'color',
  lastChanged: { date: '2021-01-01T08:34:15Z', user: 'Test User' },
  merged: [],
};

const mockData: SearchPreviewResponseBeta = {
  searchTerm: 'foo',
  externalChanges: mockMerchandisingRulesWithInfo,
  facets: [
    {
      id: 'brand',
      order: 0,
      data: [
        {
          name: 'M&S Collection',
          count: 122,
          selected: false,
          disabled: false,
        },
        {
          name: 'Autograph',
          count: 7,
          selected: false,
          disabled: false,
        },
        {
          name: 'GOODMOVE',
          count: 4,
          selected: false,
          disabled: false,
        },
      ],
    },
  ],
  pagination: {
    totalItems: 1,
  },
  ruleSet: {
    facets: [mockFacet],
    rules: mockMerchandisingRulesWithInfo,
  },
  products: [],
};

const mockCategoryReturnValue = {
  data: mockData,
  error: '',
  isLoading: false,
  setFacetConfigRules: jest.fn(),
};

const dispatchMock = jest.fn();

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const refreshDataSpy = jest.fn();

const initialIncludedFacetsMock = [
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
];

const facetsPanelLocalStateMock = {
  includedFacets: initialIncludedFacetsMock,
  excludedFacets: [],
};

const mockProps = {
  ruleSetIncludedFacets: mockRuleData.facets,
  ruleSetExcludedFacets: mockRuleData.excludedFacets,
  ruleSetRules: mockRuleData.rules,
  startDate: mockRuleData.startDate,
  endDate: mockRuleData.endDate,
  isLoading: false,
  countryCode: 'UK_IE' as CountryCode,
  searchTerms: mockSearchTerms,
  onSave: onSaveSpy,
  onCancel: onCancelSpy,
  refreshData: refreshDataSpy,
};

describe('Search Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useFacetsList).mockReturnValue(mockUseFacetsList);

    jest
      .mocked(useReducer)
      .mockReturnValue([facetsPanelLocalStateMock, dispatchMock]);

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(onCancelSpy).toHaveBeenCalled();
  });

  it('should show the facets filter search box', () => {
    renderWithProviders(
      <SearchFacetsPanel {...mockProps} searchTerms={['foo']} />
    );

    expect(screen.getAllByPlaceholderText('Search...')).toHaveLength(1);
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
      type: 'MOVE_INCLUDED_ROW_DOWN',
    });
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'Move brand row up' }));

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
      type: 'MOVE_INCLUDED_ROW_UP',
    });
  });

  it('should block order change when search is present', async () => {
    const user = userEvent.setup({ delay: null });
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(onFacetsDataRowOrderChangeSpy).not.toHaveBeenCalled();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaveSpy).toHaveBeenCalled();
  });

  it('should select a category on user input, and clear category when "remove selected category" button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    const keywordInput = await screen.findByLabelText('Add keyword');
    await user.type(keywordInput, 'blue dress{Enter}');

    expect(
      await screen.findByRole('button', { name: 'Remove keyword: blue dress' })
    ).toBeInTheDocument();

    const clearButton = screen.getByRole('button', {
      name: 'Remove keyword: blue dress',
    });

    act(() => {
      clearButton.click();
    });

    expect(
      screen.queryAllByRole('button', { name: 'Remove keyword: blue dress' })
    ).toHaveLength(0);
  });

  it('should show error and not add ruleset to the list if trying to add a duplicate keyword', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    const keywordInput = await screen.findByLabelText('Add keyword');
    await user.type(keywordInput, 'red dress{Enter}');

    expect(
      screen.getByText('Keyword red dress has already been added')
    ).toBeVisible();

    expect(
      screen.queryAllByRole('button', { name: 'Remove keyword: red dress' })
    ).toHaveLength(1);
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

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

  it('should show the schedule date picker', async () => {
    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

    expect(screen.getByPlaceholderText('Select date range')).toHaveValue('');
  });

  it('should not show Edit Values button if facet is search and the facet is not included', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <SearchFacetsPanel
        {...mockProps}
        ruleSetIncludedFacets={[]}
        ruleSetExcludedFacets={undefined}
      />
    );

    expect(screen.queryByText('Edit values')).not.toBeInTheDocument();
  });

  it('should initialise local reducer with correct data', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(<SearchFacetsPanel {...mockProps} />);

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
      <SearchFacetsPanel {...mockProps} ruleSetIncludedFacets={undefined} />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: {
        includedFacets: [],
        excludedFacets: mockRuleData.excludedFacets?.facets?.map(
          (facet) => facet.id
        ),
        countryCode: 'UK_IE',
      },
      type: 'INITIALISE_STATE',
    });
  });

  it('should show skeleton when loading', async () => {
    renderWithProviders(<SearchFacetsPanel {...mockProps} isLoading={true} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should preview changes to a new search facet', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

    renderWithProviders(
      <SearchFacetsPanel {...mockProps} ruleSetIncludedFacets={undefined} />
    );

    act(() => {
      user.type(screen.getByLabelText('Add keyword'), 'search term{enter}');
    });

    const previewButton = screen.getByRole('button', { name: 'Preview' });

    act(() => {
      previewButton.click();
    });

    const previewText = await screen.findByText(
      'Search across the site to preview the rule influence'
    );

    expect(previewText).toBeInTheDocument();

    expect(usePreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ searchTerm: 'search term' })
    );
  });
});
