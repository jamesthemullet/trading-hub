import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { CategoryAndSearchFacetsPanelPageLayout } from './category-and-search-facet-attributes-page-layout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter: Partial<NextRouter> = {
  push: jest.fn(),
  query: {},
  route: '',
  pathname: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
};

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';

const attributeValuesMock: MerchandisingAttributeValuesResponse['values'] = [
  { displayValue: '13 - 14.4' },
  { displayValue: '10 - 12.9' },
  { displayValue: '14.5 - 20' },
  { displayValue: 'Under 10' },
  { displayValue: 'Over 20' },
];

const facetMock: MerchandisingRuleSetFacetConfigWithId = {
  id: '1',
  boosted: ['13 - 14.4', '10 - 12.9'],
  excludedValues: ['Under 10'],
};

const setup = (props = {}) => {
  const defaultProps = {
    attributeValues: attributeValuesMock,
    facet: facetMock,
    displayName: 'Screen Size',
    facetType: 'category' as const,
    ruleSetId,
    searchQuery: '',
    onSearchChange: jest.fn(),
    isLoading: false,
    error: '',
    onSave: jest.fn(),
  };

  jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);

  return {
    ...renderWithProviders(
      <CategoryAndSearchFacetsPanelPageLayout {...defaultProps} {...props} />
    ),
    mockRouter,
    props: { ...defaultProps, ...props },
  };
};

describe('CategoryAndSearchFacetsPanelPageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with category facet type', () => {
    setup();

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByTestId('Label for 13 - 14.4')).toBeInTheDocument();
  });

  it('renders the component with search facet type', () => {
    setup({ facetType: 'search' });

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    const onSearchChange = jest.fn();
    setup({ onSearchChange });

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'test');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('filters attribute values based on search query', () => {
    setup({ searchQuery: '13' });

    expect(screen.getByTestId('Label for 13 - 14.4')).toBeInTheDocument();
    expect(screen.queryByText('Under 10')).not.toBeInTheDocument();
  });
});
