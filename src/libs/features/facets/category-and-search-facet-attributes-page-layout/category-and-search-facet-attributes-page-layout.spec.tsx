import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import type { FeatureFlags } from '@/libs/components/feature-flag/feature-flag';
import { FacetType } from '@/libs/constants/rule-types';
import { renderWithProviders } from '@/test/render-with-providers';

import { CategoryAndSearchFacetsPanelPageLayout } from './category-and-search-facet-attributes-page-layout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/constants', () => ({
  getFacetRoute: jest.fn(
    (facetType, action, id) => `/facets/${facetType}/${action}/${id}`
  ),
  getNewFacetRoute: jest.fn((routeType) => `/facets/new/${routeType}`),
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

const setup = (props = {}, featureFlags: Partial<FeatureFlags> = {}) => {
  const defaultProps = {
    attributeValues: attributeValuesMock,
    facet: facetMock,
    displayName: 'Screen Size',
    facetType: FacetType.Category as const,
    ruleSetId,
    searchQuery: '',
    onSearchChange: jest.fn(),
    isLoading: false,
    error: '',
    onSave: jest.fn(),
    isWriteEnabled: true,
  };

  jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);

  return {
    ...renderWithProviders(
      <CategoryAndSearchFacetsPanelPageLayout {...defaultProps} {...props} />,
      undefined,
      { featureFlags }
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
    setup({ facetType: FacetType.Search });

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

  it('navigates to new category facet route when closing draft category ruleset', async () => {
    const user = userEvent.setup({ delay: null });
    const { mockRouter } = setup({
      isDraftRuleset: true,
      facetType: FacetType.Category,
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/facets/new/category');
  });

  it('navigates to new search facet route when closing draft search ruleset', async () => {
    const user = userEvent.setup({ delay: null });
    const { mockRouter } = setup({
      isDraftRuleset: true,
      facetType: FacetType.Search,
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/facets/new/search');
  });

  it('navigates to edit facet route when closing non-draft ruleset', async () => {
    const user = userEvent.setup({ delay: null });
    const { mockRouter } = setup({
      isDraftRuleset: false,
      facetType: FacetType.Category,
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/facets/category/edit/${ruleSetId}`
    );
  });

  describe('undo button', () => {
    it('does not render undo button when flag is off', () => {
      setup();

      expect(
        screen.queryByRole('button', { name: 'Undo' })
      ).not.toBeInTheDocument();
    });

    it('renders a disabled undo button when flag is on and no changes made', () => {
      setup({ facetType: FacetType.Category }, { hasUndoButton: true });

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('does not render undo button for search facet type even when flag is on', () => {
      setup({ facetType: FacetType.Search }, { hasUndoButton: true });

      expect(
        screen.queryByRole('button', { name: 'Undo' })
      ).not.toBeInTheDocument();
    });

    it('renders an enabled undo button after a change is made', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category }, { hasUndoButton: true });

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();

      const dropdown = screen.getAllByLabelText(
        /Select to set as included, excluded or algo control/i
      )[0];
      await user.click(dropdown);

      const excludeOption = within(dropdown.parentElement!).getByRole(
        'menuitemradio',
        { name: 'Exclude only' }
      );
      await user.click(excludeOption);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
    });

    it('reverts the last change and disables the undo button when history is empty', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category }, { hasUndoButton: true });

      const dropdown = screen.getAllByLabelText(
        /Select to set as included, excluded or algo control/i
      )[0];
      await user.click(dropdown);
      const excludeOption = within(dropdown.parentElement!).getByRole(
        'menuitemradio',
        { name: 'Exclude only' }
      );
      await user.click(excludeOption);

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });
  });
});
