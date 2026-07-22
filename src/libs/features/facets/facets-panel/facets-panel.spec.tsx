import type { ReactNode } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import type { UseGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';
import type { FacetRowDisplayValue } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import type { DragEndEvent } from '@dnd-kit/core';

import { FacetsPanel } from './facets-panel';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  usePreview: jest.fn(),
  useGlobalFacetUpdate: jest.fn(),
}));

let latestDragEndHandler: ((event: DragEndEvent) => void) | undefined;

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');

  type DndContextProps = {
    children: ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
  };

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
    SortableContext: ({ children }: { children: ReactNode }) => (
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

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();

const mockFacetsState: FacetRowDisplayValue[] = [
  {
    displayType: 'included',
    displayValue: 'color',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
    indexPropertyName: 'color',
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
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'included',
    displayValue: 'brand',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    indexPropertyName: 'brand',
    lastChanged: {
      date: '2021-01-03T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'size',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    indexPropertyName: 'size',
    lastChanged: {
      date: '2021-01-02T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'price',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
    indexPropertyName: 'price',
    lastChanged: {
      date: '2021-01-05T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'excluded',
    displayValue: 'category',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    indexPropertyName: 'category',
    lastChanged: {
      date: '2021-01-04T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: true,
    },
  },
];

const mockIncludedFacetIds = [
  facetsListMock.facets[0].id,
  facetsListMock.facets[2].id,
  facetsListMock.facets[3].id,
];
const mockExcludedFacetIds = [facetsListMock.facets[1].id];

const mockUpdateGlobalFacet = jest.fn().mockResolvedValue({});
const updateGlobalFacet: UseGlobalFacetUpdate = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

const defaultProps = {
  isWriteEnabled: true,
  title: 'Facet Rule Editor',
  countryCode: 'UK_IE' as const,
  selectedPreviewCountryCode: 'UK' as const,
  onSave: onSaveSpy,
  onCancel: onCancelSpy,
  onFacetDataChange: jest.fn(),
  facetsData: mockFacetsState.map(({ displayType, meta, ...rest }) => {
    void displayType;
    void meta;
    return rest;
  }),
  initialIncludedFacetIds: mockIncludedFacetIds,
  initialExcludedFacetIds: mockExcludedFacetIds,
  initialOrders: {
    'b04eaac3-f4ea-4f21-9459-0b4302dc2a84': 1,
    'b04eaac3-f4ea-4f21-9459-0b4302dc2a86': 2,
  },
  orders: {
    'b04eaac3-f4ea-4f21-9459-0b4302dc2a84': 1,
    'b04eaac3-f4ea-4f21-9459-0b4302dc2a86': 2,
  },
};

describe('Facet Panel', () => {
  beforeEach(() => {
    latestDragEndHandler = undefined;
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);
    jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should not render preview button or add new facets button', async () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add new facet' })
    ).not.toBeInTheDocument();
  });

  it('should render column headings', () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(screen.getByText('Ranking')).toBeVisible();
    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should reorder included facets with drag-and-drop', () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    const colorIncludedRowBefore = screen.getByTestId(
      'Row showing color as included'
    );
    const brandIncludedRowBefore = screen.getByTestId(
      'Row showing brand as included'
    );
    expect(
      colorIncludedRowBefore.compareDocumentPosition(brandIncludedRowBefore)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    act(() => {
      latestDragEndHandler?.({
        active: { id: mockFacetsState[0].id },
        over: { id: mockFacetsState[1].id },
      } as DragEndEvent);
    });

    const brandIncludedRowAfter = screen.getByTestId(
      'Row showing brand as included'
    );
    const colorIncludedRowAfter = screen.getByTestId(
      'Row showing color as included'
    );
    expect(
      brandIncludedRowAfter.compareDocumentPosition(colorIncludedRowAfter)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should reorder rows when manual order input is submitted', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<FacetsPanel {...defaultProps} />);

    Element.prototype.scrollIntoView = jest.fn();

    const orderInput = screen.getByDisplayValue('1');

    await user.clear(orderInput);
    await user.type(orderInput, '2');
    await user.keyboard('{Enter}');

    const brandIncludedRowAfter = screen.getByTestId(
      'Row showing brand as included'
    );
    const colorIncludedRowAfter = screen.getByTestId(
      'Row showing color as included'
    );
    expect(
      brandIncludedRowAfter.compareDocumentPosition(colorIncludedRowAfter)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<FacetsPanel {...defaultProps} countryCode="UK" />);

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing color as excluded')
      ).toBeInTheDocument();
    });
  });

  it('should not allow renaming a row to an existing value', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<FacetsPanel {...defaultProps} countryCode="UK" />);

    const editButton = await screen.findByLabelText(
      `Edit display name for color`
    );

    act(() => {
      editButton.click();
    });

    const inputField = await screen.findByLabelText(`Edit color input field`);

    expect(inputField).toHaveValue('color');

    await user.clear(inputField);
    await user.type(inputField, 'brand');
    await user.keyboard('{enter}');

    const errorMessage = screen.getByText(`brand is not a unique value`);
    expect(errorMessage).toBeVisible();

    const cancelButton = screen.getByLabelText(`Cancel color change`);
    act(() => {
      cancelButton.click();
    });
    expect(errorMessage).not.toBeVisible();
  });

  it('should show duplicate error when keeping the same value and duplicates exist', async () => {
    const user = userEvent.setup({ delay: null });

    const facetsDataWithDuplicateColor = defaultProps.facetsData.map(
      (facet, index) =>
        index === 1
          ? {
              ...facet,
              displayValue: 'color',
            }
          : facet
    );

    renderWithProviders(
      <FacetsPanel
        {...defaultProps}
        countryCode="UK"
        facetsData={facetsDataWithDuplicateColor}
      />
    );

    const editButtons = await screen.findAllByLabelText(
      'Edit display name for color'
    );
    await user.click(editButtons[0]);

    const inputFields = await screen.findAllByLabelText(
      'Edit color input field'
    );
    await user.clear(inputFields[0]);
    await user.type(inputFields[0], 'color');

    expect(screen.getByText('color is not a unique value')).toBeVisible();
  });

  describe('sticky bar pin button', () => {
    it('shows pin button', () => {
      renderWithProviders(<FacetsPanel {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Pin top bar' })
      ).toBeInTheDocument();
    });

    it('toggles pin state when pin button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FacetsPanel {...defaultProps} />);

      const pinButton = screen.getByRole('button', { name: 'Pin top bar' });
      expect(pinButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(pinButton);

      expect(
        screen.getByRole('button', { name: 'Unpin top bar' })
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
