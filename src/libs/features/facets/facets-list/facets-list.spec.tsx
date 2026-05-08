import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import { FacetType } from '@/libs/constants/rule-types';
import {
  useFacetsList,
  useGetCategories,
  useGetFacetAttributeValues,
  useGlobalFacetsList,
} from '@/libs/hooks';
import { useDraftRuleset } from '@/libs/hooks/use-draft-ruleset';
import * as analytics from '@/libs/hooks/utils/analytics';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import type { DndContextProps, DragEndEvent } from '@dnd-kit/core';

import { FacetsList, type FacetsListProps } from './facets-list';

const pushMock = jest.fn();

const mockRouter: Partial<NextRouter> = {
  query: { id: 'test-ruleset-id' },
  push: pushMock,
  route: '',
  pathname: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
};

let latestDragEndHandler: ((event: DragEndEvent) => void) | undefined;

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');

  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: DndContextProps) => {
      latestDragEndHandler = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
    useSensors: (...args: unknown[]) => args,
    useSensor: jest.fn((sensor: unknown, config?: unknown) => ({
      sensor,
      config,
    })),
    PointerSensor: function PointerSensor() {
      return 'PointerSensor';
    },
    KeyboardSensor: function KeyboardSensor() {
      return 'KeyboardSensor';
    },
  };
});

jest.mock('@dnd-kit/sortable', () => {
  const actual = jest.requireActual('@dnd-kit/sortable');

  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sortable-context">{children}</div>
    ),
    verticalListSortingStrategy: jest.fn(),
    sortableKeyboardCoordinates: jest.fn(),
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setActivatorNodeRef: jest.fn(),
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  };
});

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useFacetsList: jest.fn(),
  useGlobalFacetsList: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

jest.mock('@/libs/hooks/utils/analytics', () => {
  return {
    track: jest.fn(),
  };
});

jest.mock('@/libs/hooks/use-draft-ruleset', () => ({
  useDraftRuleset: jest.fn(),
}));

const analyticsSpy = jest.spyOn(analytics, 'track');

const categoryId1 = 'cat_123';
const categoryId2 = 'IE_cat123';
const categoryId3 = 'cat456';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const categoryName3 = 'jeggings';
const categoryPath3 = 'l/jeggings';
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId2,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId3,
      name: categoryName3,
      path: categoryPath3,
    },
  ],
  pagination: { totalItems: 20 },
};

const mockRuleset = {
  isEnabled: true,
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    buries: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  excludedFacets: { facets: [] },
  facets: [],
};

const defaultFacetProps: FacetsListProps = {
  facetType: FacetType.Category,
  isNewRuleset: true,
  onCancel: () => jest.fn(),
  onSave: () => jest.fn(),
  isWriteEnabled: true,
};

describe('FacetsList', () => {
  beforeEach(() => {
    jest.mocked(useDraftRuleset).mockReturnValue({
      saveDraft: jest.fn(),
      getDraft: jest.fn(() => null),
      clearDraft: jest.fn(),
      isDraftRuleset: jest.fn(),
    });

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });

    jest.mocked(useFacetsList).mockReturnValue({
      facets: facetsListMock.facets,
      isLoading: false,
      error: '',
    });

    jest.mocked(useGlobalFacetsList).mockReturnValue({
      facets: facetsListMock.facets,
      isLoading: false,
      error: '',
      onRefreshFacetList: jest.fn(),
    });

    jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<FacetsList {...defaultFacetProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should render default empty ruleset message when facetType is global', async () => {
    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: [], isLoading: false, error: '' });

    renderWithProviders(
      <FacetsList {...defaultFacetProps} facetType={FacetType.Global} />
    );

    expect(
      screen.getByText('Please create the ruleset before editing facets.')
    ).toBeVisible();
  });

  it('should add and set a category', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<FacetsList {...defaultFacetProps} />);
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    act(() => {
      screen.getByRole('button', { name: 'Close' }).click();
    });

    expect(
      screen.getByRole('button', { name: 'select category' })
    ).toHaveTextContent(categoryId1);
  });

  it('should clear a set category', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: `Remove category from modal: ${categoryId1}`,
      });

      act(() => {
        button.click();
      });
    });

    expect(screen.getByPlaceholderText('Search...')).toBeVisible();
  });

  it('should not allow setting a duplicate category', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<FacetsList {...defaultFacetProps} />);
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId2} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    await user.type(searchInput, 'jeans');

    const modalCategoryToSelect = await screen.findByText(
      `${categoryId2} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      modalCategoryToSelect.click();
    });

    expect(
      screen.getByText(`Ruleset ${categoryId2} has already been added`)
    ).toBeVisible();
  });

  it('should filter facets', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          isEnabled: true,
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: {
              alphanumeric: [],
              numeric: [],
              product: [],
            },
            buries: {
              alphanumeric: [],
              numeric: [],
              product: [],
            },
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
          excludedFacets: { facets: [] },
          facets: [],
        }}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing brand as algoControl')
    ).toBeVisible();
    expect(screen.getByTestId('Row showing size as algoControl')).toBeVisible();

    const searchInput = screen.getByPlaceholderText('Search');
    await user.type(searchInput, `size{Enter}`);

    const resultCount = await screen.findByText('1 result');
    expect(resultCount).toBeVisible();

    expect(
      screen.queryByTestId('Row showing brand as algoControl')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('Row showing size as algoControl')).toBeVisible();
  });

  it('should change a facet display type', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getAllByText('Exclude only')[0];
    await user.click(alwaysHideOption);

    expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
  });

  it('should not change a facet display type when clicking on the existing value', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getAllByText('Algo control')[1];
    await user.click(alwaysHideOption);

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();
  });

  it('should reorder an included facet', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    latestDragEndHandler = undefined;

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
            {
              id: facetsListMock.facets[1].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    expect(
      screen.getByTestId('drag-handle-' + facetsListMock.facets[0].displayValue)
    ).toBeVisible();

    act(() => {
      latestDragEndHandler?.({
        active: { id: facetsListMock.facets[0].id },
        over: { id: facetsListMock.facets[1].id },
      } as DragEndEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });
  });

  it('should dispatch facetChangePosition on drag end reordering', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    latestDragEndHandler = undefined;

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
            {
              id: facetsListMock.facets[1].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    act(() => {
      latestDragEndHandler?.({
        active: { id: facetsListMock.facets[0].id },
        over: { id: facetsListMock.facets[1].id },
      } as unknown as DragEndEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });
  });

  it('should handle drag handles when listeners are undefined', () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    const sortableMock = jest.requireMock('@dnd-kit/sortable');
    const originalUseSortable = sortableMock.useSortable;

    sortableMock.useSortable = jest.fn(() => ({
      attributes: {},
      listeners: undefined,
      setActivatorNodeRef: jest.fn(),
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }));

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    const dragHandle = screen.getByTestId(
      'drag-handle-' + facetsListMock.facets[0].displayValue
    );
    expect(dragHandle).toBeVisible();

    sortableMock.useSortable = originalUseSortable;
  });

  it('should disable drag handles when there is only one included facet', () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    const dragHandle = screen.getByTestId(
      'drag-handle-' + facetsListMock.facets[0].displayValue
    );
    expect(dragHandle).toBeDisabled();
  });

  it('should show and close the preview modal for categories', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            { id: facetsListMock.facets[0].id },
            { id: facetsListMock.facets[1].id },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(
      screen.getByText('View rule changes made on the website below')
    ).toBeVisible();

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });
    expect(
      screen.queryByText('View rule changes made on the website below')
    ).not.toBeInTheDocument();
  });

  it('should track the opening of the preview modal for categories', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            { id: facetsListMock.facets[0].id },
            { id: facetsListMock.facets[1].id },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(analyticsSpy).toHaveBeenCalledWith({
      event: 'Preview category facets - cat_123',
    });
  });

  it('should show and close the preview modal for search terms', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, facets: undefined }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(
      screen.getByText('View rule changes made on the website below')
    ).toBeVisible();

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });
    expect(
      screen.queryByText('View rule changes made on the website below')
    ).not.toBeInTheDocument();
  });

  it('should set the preview country for search facets to IE', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    expect(screen.getAllByText('IE view')).toHaveLength(1);
    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    const selectIE = screen.getByRole('menuitemradio', {
      name: 'IE flag IE view',
    });
    act(() => {
      selectIE.click();
    });

    expect(screen.getAllByText('IE view')).toHaveLength(2);
  });

  it('should set the preview country for search facets to UK', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    const selectUK = screen.getByRole('menuitemradio', {
      name: 'UK flag UK view',
    });
    act(() => {
      selectUK.click();
    });

    expect(screen.getAllByText('UK view')).toHaveLength(2);
  });

  it('should open and close the preview country dropdown', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    expect(selectPreview).toHaveAttribute('aria-expanded', 'true');

    act(() => {
      selectPreview.click();
    });
    expect(selectPreview).toHaveAttribute('aria-expanded', 'false');
  });

  it('should change the country of influence', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    expect(screen.getAllByText('IE view')).toHaveLength(1);
    const selectMarket = screen.getByRole('button', {
      name: 'Select country',
    });

    act(() => {
      selectMarket.click();
    });

    const selectIE = within(selectMarket.parentElement!).getByRole(
      'menuitemradio',
      {
        name: 'IE market only',
      }
    );
    act(() => {
      selectIE.click();
    });

    expect(screen.getAllByText('IE market only')).toHaveLength(2);
  });

  describe('unsaved changes', () => {
    it('should not show the unsaved changes modal when Cancel is clicked with no changes', async () => {
      const user = userEvent.setup({ delay: null });
      const onCancel = jest.fn();

      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={mockRuleset}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.queryByText('Close without saving edits')
      ).not.toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
    });

    it('should show the unsaved changes modal when Cancel is clicked after changing a facet display type', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={mockRuleset}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
        />
      );

      await user.click(screen.getAllByText('Exclude only')[0]);
      await waitFor(() => {
        expect(
          screen.getByTestId('Row showing color as excluded')
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.getByText('Close without saving edits')
      ).toBeInTheDocument();
    });

    it('should navigate away when Close without saving is clicked in the unsaved changes modal', async () => {
      const user = userEvent.setup({ delay: null });
      const onCancel = jest.fn();

      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={mockRuleset}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getAllByText('Exclude only')[0]);
      await waitFor(() => {
        expect(
          screen.getByTestId('Row showing color as excluded')
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        screen.getByRole('button', { name: 'Close without saving' })
      );

      expect(onCancel).toHaveBeenCalled();
    });

    it('should dismiss the unsaved changes modal and stay on page when Continue editing is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onCancel = jest.fn();

      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={mockRuleset}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getAllByText('Exclude only')[0]);
      await waitFor(() => {
        expect(
          screen.getByTestId('Row showing color as excluded')
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        screen.getByRole('button', { name: 'Continue editing' })
      );

      expect(
        screen.queryByText('Close without saving edits')
      ).not.toBeInTheDocument();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should treat undefined facets as empty when computing hasChanges', async () => {
      const user = userEvent.setup({ delay: null });
      const onCancel = jest.fn();

      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={{
            ...mockRuleset,
            facets: undefined,
            excludedFacets: undefined,
          }}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.queryByText('Close without saving edits')
      ).not.toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('scheduling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should change the duration', async () => {
      renderWithProviders(
        <FacetsList
          {...defaultFacetProps}
          currentRuleset={{
            ...mockRuleset,
            countryCode: 'UK_IE',
            endDate: '2022-04-13T22:59:00.000Z',
            startDate: '2022-04-11T23:00:00.000Z',
          }}
          isNewRuleset={false}
          facetType={FacetType.Search}
          searchTerms={['socks']}
        />
      );
      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
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

      const saveButton = screen.getByRole('button', {
        name: 'Close schedule editor',
      });
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
          '16/04/22 23:00 - 17/04/22 22:59'
        );
      });
    });
  });

  it('should not allow to edit values of an algoControl facet', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await userEvent.click(dropdownHeader);

    const algoControlOption = within(dropdownHeader.parentElement!).getByRole(
      'menuitemradio',
      {
        name: 'Algo control',
      }
    );
    await userEvent.click(algoControlOption);

    const editValuesButtons = screen.queryAllByRole('button', {
      name: 'Edit values',
    });

    expect(editValuesButtons).toHaveLength(0);
  });

  it('should save facets changes', async () => {
    const onSaveSpy = jest.fn();
    const expectedCall = {
      categoryIds: ['cat_123'],
      countryCode: 'UK_IE',
      endDate: undefined,
      excludedFacets: { facets: [] },
      facets: [],
      isEnabled: true,
      rules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
      searchTerms: [],
      startDate: undefined,
    };

    renderWithProviders(
      <FacetsList {...defaultFacetProps} onSave={onSaveSpy} />
    );
    const user = userEvent.setup({ delay: null });
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    act(() => {
      saveButton.click();
    });

    expect(onSaveSpy).toHaveBeenCalledWith(expectedCall);
  });

  it('should route the user to the facet values page', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        facetType={FacetType.Category}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />,
      []
    );

    const editValuesButton = screen.getByRole('link', {
      name: 'Edit values',
    });

    expect(editValuesButton).toHaveAttribute(
      'href',
      '/category/facets/values/edit/b04eaac3-f4ea-4f21-9459-0b4302dc2a84?ruleSetId=test-ruleset-id&displayName=color&countryCode=UK_IE&categories=cat_123'
    );
  });

  it('should handle multiple search terms when routing the user to the facet values page', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        facetType={FacetType.Search}
        isNewRuleset={false}
        searchTerms={['term 1', 'term 2']}
      />
    );

    const editFacetValuesButton = screen.getAllByRole('link', {
      name: 'Edit values',
    })[0];

    expect(editFacetValuesButton).toHaveAttribute(
      'href',
      '/search/facets/values/edit/b04eaac3-f4ea-4f21-9459-0b4302dc2a84?ruleSetId=test-ruleset-id&displayName=color&countryCode=UK_IE&searchTerms=term+1&searchTerms=term+2'
    );
  });

  it('should render view values button with no write access', async () => {
    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isWriteEnabled={false}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        facetType={FacetType.Search}
        isNewRuleset={false}
        searchTerms={['term 1', 'term 2']}
      />
    );

    const viewFacetValuesButton = screen.getAllByRole('link', {
      name: 'View values',
    })[0];

    expect(viewFacetValuesButton).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Edit Values' })
    ).not.toBeInTheDocument();
  });

  it('should correctly set facetChangePosition payload with exact facetId and position from useFacetOrderInput', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
            {
              id: facetsListMock.facets[1].id,
              boosted: [],
              excludedValues: [],
            },
          ],
          excludedFacets: {
            facets: [
              {
                id: facetsListMock.facets[2].id,
              },
            ],
          },
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />,
      []
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    expect(screen.getByTestId('Row showing size as included')).toBeVisible();

    const orderInputs = screen.queryAllByRole('spinbutton');
    expect(orderInputs.length).toBeGreaterThan(0);

    const firstFacetOrderInput = orderInputs[0] as HTMLInputElement;

    await user.clear(firstFacetOrderInput);
    await user.type(firstFacetOrderInput, '3');

    act(() => {
      firstFacetOrderInput.blur();
    });

    await waitFor(() => {
      const updatedInputs = screen.queryAllByRole('spinbutton');
      expect(updatedInputs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should restore draft category IDs when initializing selectedCategoriesInfo for new ruleset', async () => {
    const draftCategoryIds = ['cat_draft_1', 'cat_draft_2'];
    const mockDraft = {
      type: 'category' as const,
      ruleset: {
        ...mockRuleset,
        categoryIds: draftCategoryIds,
      },
      timestamp: Date.now(),
    };

    jest.mocked(useDraftRuleset).mockReturnValue({
      saveDraft: jest.fn(),
      getDraft: jest.fn(() => mockDraft),
      clearDraft: jest.fn(),
      isDraftRuleset: jest.fn(),
    });

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset
        categoriesInfo={undefined}
      />
    );

    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    expect(modalButton).toBeInTheDocument();
    expect(modalButton).toBeEnabled();
  });

  it('should set first category as preview for draft rulesets', async () => {
    const draftCategoryIds = [categoryId1, categoryId2];
    const mockDraft = {
      type: 'category' as const,
      ruleset: {
        ...mockRuleset,
        categoryIds: draftCategoryIds,
      },
      timestamp: Date.now(),
    };

    jest.mocked(useDraftRuleset).mockReturnValue({
      saveDraft: jest.fn(),
      getDraft: jest.fn(() => mockDraft),
      clearDraft: jest.fn(),
      isDraftRuleset: jest.fn(),
    });

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset
        facetType={FacetType.Category}
        categoriesInfo={undefined}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'select category' })
      ).toHaveTextContent(categoryId1);
    });
  });

  it('should restore draft search terms when initializing selectedSearchTerms for new ruleset', async () => {
    const draftSearchTerms = ['socks', 'shoes'];
    const mockDraft = {
      type: 'search' as const,
      ruleset: {
        ...mockRuleset,
        searchTerms: draftSearchTerms,
      },
      timestamp: Date.now(),
    };

    jest.mocked(useDraftRuleset).mockReturnValue({
      saveDraft: jest.fn(),
      getDraft: jest.fn(() => mockDraft),
      clearDraft: jest.fn(),
      isDraftRuleset: jest.fn(),
    });

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        isNewRuleset
        facetType={FacetType.Search}
        searchTerms={undefined}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('socks')).toBeInTheDocument();
    });
  });

  it('should render unavailable boosted facets with ghost styling and "currently not available" text', () => {
    const unavailableFacetId = facetsListMock.facets[0].id;

    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: [], isLoading: false, error: '' });

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [{ id: unavailableFacetId }],
        }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    const row = screen.getByTestId('Row showing color as included');
    expect(row).toBeVisible();
    expect(row).toHaveAttribute('data-unavailable', 'true');
    expect(screen.getByText('— currently not available')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Edit values' })
    ).not.toBeInTheDocument();
  });

  it('should not render a facet row for boosted facets not found in global or context facets', () => {
    const unknownFacetId = 'unknown-facet-id-that-does-not-exist';

    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: [], isLoading: false, error: '' });
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      facets: [],
      isLoading: false,
      error: '',
      onRefreshFacetList: jest.fn(),
    });

    renderWithProviders(
      <FacetsList
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [{ id: unknownFacetId }],
        }}
        isNewRuleset={false}
        facetType={FacetType.Search}
        searchTerms={['socks']}
      />
    );

    expect(
      screen.queryByText('— currently not available')
    ).not.toBeInTheDocument();
  });
});
