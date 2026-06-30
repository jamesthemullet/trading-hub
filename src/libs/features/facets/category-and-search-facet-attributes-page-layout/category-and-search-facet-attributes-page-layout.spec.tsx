import { screen, waitFor, within } from '@testing-library/react';
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

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByTestId('Label for 13 - 14.4')).toBeInTheDocument();
  });

  it('renders the component with search facet type', () => {
    setup({ facetType: FacetType.Search });

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    const onSearchChange = jest.fn();
    setup({ onSearchChange });

    const searchInput = screen.getByRole('searchbox');
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

  it('calls onSave with current state when save button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const { props } = setup({ facetType: FacetType.Category });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(props.onSave).toHaveBeenCalled();
  });

  describe('unsaved changes modal', () => {
    it('shows modal when closing with unsaved changes', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        await screen.findByRole('heading', {
          name: 'Close without saving edits',
        })
      ).toBeInTheDocument();
    });

    it('navigates away when confirming close without saving', async () => {
      const user = userEvent.setup({ delay: null });
      const { mockRouter } = setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        await screen.findByRole('button', { name: 'Close without saving' })
      );

      expect(mockRouter.push).toHaveBeenCalledWith(
        `/facets/category/edit/${ruleSetId}`
      );
    });

    it('dismisses modal when continuing editing', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        await screen.findByRole('button', { name: 'Continue editing' })
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: 'Close without saving edits',
          })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('undo button', () => {
    it('renders a disabled undo button when no changes made', () => {
      setup({ facetType: FacetType.Category });

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('does not render undo button for search facet type', () => {
      setup({ facetType: FacetType.Search });

      expect(
        screen.queryByRole('button', { name: 'Undo' })
      ).not.toBeInTheDocument();
    });

    it('renders an enabled undo button after a change is made', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);

      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
    });

    it('reverts the last change and disables the undo button when history is empty', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('triggers undo via Ctrl+Z keyboard shortcut', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();

      await user.keyboard('{Control>}z{/Control}');

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('triggers undo via Meta+Z keyboard shortcut', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();

      await user.keyboard('{Meta>}z{/Meta}');

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('does not trigger undo keyboard shortcut for search facet type', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Search });

      await user.keyboard('{Control>}z{/Control}');

      expect(
        screen.queryByRole('button', { name: 'Undo' })
      ).not.toBeInTheDocument();
    });

    it('clears undo history after saving', async () => {
      const user = userEvent.setup({ delay: null });
      const { props } = setup({ facetType: FacetType.Category });

      const row = screen.getByTestId('included attribute 0 13 - 14.4');
      const dropdown = within(row).getByLabelText(
        /Select to set as included, excluded or algo control/i
      );
      await user.click(dropdown);
      const excludeOption = within(row).getByRole('menuitemradio', {
        name: 'Exclude only',
      });
      await user.click(excludeOption);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(props.onSave).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    });

    it('keeps only the latest 50 undo states', async () => {
      const user = userEvent.setup({ delay: null });
      setup({ facetType: FacetType.Category });

      for (let i = 0; i < 51; i += 1) {
        const row = screen.getByTestId(
          /(included|excluded|algoControl) attribute \d+ 13 - 14\.4/
        );
        const dropdown = within(row).getByLabelText(
          /Select to set as included, excluded or algo control/i
        );

        await user.click(dropdown);
        await user.click(
          within(row).getByRole('menuitemradio', { name: 'Exclude only' })
        );
      }

      const undoButton = screen.getByRole('button', { name: 'Undo' });
      expect(undoButton).toBeEnabled();

      for (let i = 0; i < 50; i += 1) {
        await user.click(undoButton);
      }

      expect(undoButton).toBeDisabled();
    });
  });
});
