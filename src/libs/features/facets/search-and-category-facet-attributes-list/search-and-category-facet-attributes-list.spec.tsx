import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import type { DragEndEvent } from '@dnd-kit/core';
import lodash from 'lodash';

import { SearchAndCategoryFacetAttributesList } from './search-and-category-facet-attributes-list';

let latestDragEndHandler: ((event: DragEndEvent) => void) | undefined;

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');

  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
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

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

const setup = (props = {}) => {
  const defaultProps = {
    boostedValues: [
      { displayValue: 'Cotton', order: 1 },
      { displayValue: 'Silk', order: 2 },
      { displayValue: 'Satin', order: 3 },
      { displayValue: 'Wool', order: 4 },
    ],
    algoControlValues: [
      { displayValue: 'Polyester' },
      { displayValue: 'Linen' },
    ],
    excludedValues: [
      { displayValue: 'Duck Down' },
      { displayValue: 'Feather' },
    ],
    dispatch: jest.fn(),
    searchQuery: '',
    writeEnabled: true,
  };

  return renderWithProviders(
    <SearchAndCategoryFacetAttributesList {...defaultProps} {...props} />
  );
};

describe('SearchAndCategoryFacetAttributesList', () => {
  beforeEach(() => {
    latestDragEndHandler = undefined;
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all value rows', () => {
    setup();
    expect(screen.getByTestId('included attribute 0 Cotton')).toBeVisible();
    expect(screen.getByTestId('included attribute 1 Silk')).toBeVisible();
    expect(
      screen.getByTestId('algoControl attribute 0 Polyester')
    ).toBeVisible();
    expect(screen.getByTestId('excluded attribute 0 Duck Down')).toBeVisible();
  });

  it('filters values by searchQuery', async () => {
    setup({ searchQuery: 'Silk' });
    expect(screen.getByTestId('included attribute 0 Silk')).toBeVisible();
    expect(
      screen.queryByTestId('included attribute 0 Cotton')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('algoControl attribute 0 Polyester')
    ).not.toBeInTheDocument();
  });

  it('renders drag handles only for included rows', () => {
    setup();

    expect(screen.getByTestId('drag-handle-Cotton')).toBeVisible();
    expect(screen.getByTestId('drag-handle-Wool')).toBeVisible();
    expect(
      screen.queryByTestId('drag-handle-Polyester')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('drag-handle-Duck Down')
    ).not.toBeInTheDocument();
  });

  it('disables drag handles when fewer than two boosted rows are visible', () => {
    setup({
      boostedValues: [{ displayValue: 'Cotton', order: 1 }],
    });

    const dragHandle = screen.getByTestId('drag-handle-Cotton');

    expect(dragHandle).toHaveAttribute('aria-disabled', 'true');
    expect(dragHandle).toBeDisabled();
  });

  it('dispatches SET_BOOSTED_ORDER when dragging included facets', () => {
    const dispatch = jest.fn();
    setup({ dispatch });

    act(() => {
      latestDragEndHandler?.({
        active: { id: 'Cotton' },
        over: { id: 'Silk' },
      } as DragEndEvent);
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_BOOSTED_ORDER',
      payload: {
        id: 'Cotton',
        newIndex: 1,
      },
    });
  });

  it('does not dispatch when search query is active during drag', () => {
    const dispatch = jest.fn();
    setup({ dispatch, searchQuery: 'cot' });

    act(() => {
      latestDragEndHandler?.({
        active: { id: 'Cotton' },
        over: { id: 'Silk' },
      } as DragEndEvent);
    });

    expect(dispatch).not.toHaveBeenCalledWith({
      type: 'SET_BOOSTED_ORDER',
      payload: expect.anything(),
    });
  });

  it('does not dispatch when dragged facet ID is not in boosted order', () => {
    const dispatch = jest.fn();
    setup({ dispatch });

    act(() => {
      latestDragEndHandler?.({
        active: { id: 'Unknown' },
        over: { id: 'Silk' },
      } as DragEndEvent);
    });

    expect(dispatch).not.toHaveBeenCalledWith({
      type: 'SET_BOOSTED_ORDER',
      payload: expect.anything(),
    });
  });

  it('dispatches CHANGE_DISPLAY_TYPE when dropdown changes', async () => {
    const dispatch = jest.fn();
    setup({ dispatch });

    const dropdown = screen.getAllByLabelText(
      'Select to set as included, excluded or algo control'
    )[0];
    await userEvent.click(dropdown);

    const excludedOption = screen.getByRole('option', { name: 'Exclude only' });
    await userEvent.click(excludedOption);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'CHANGE_DISPLAY_TYPE',
      payload: {
        id: 'Cotton',
        newDisplayType: 'excluded',
      },
    });
  });

  it('renders empty state when no values are provided', () => {
    setup({
      boostedValues: [],
      algoControlValues: [],
      excludedValues: [],
    });

    expect(screen.queryByTestId(/included attribute/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/algoControl attribute/)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(/excluded attribute/)).not.toBeInTheDocument();
  });

  it('renders sortable context with empty boosted rows', () => {
    setup({ boostedValues: [] });

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    expect(screen.queryByTestId(/included attribute/)).not.toBeInTheDocument();
  });

  it('shows no results when search query matches nothing', () => {
    setup({ searchQuery: 'nonexistent' });

    expect(screen.queryByTestId(/included attribute/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/algoControl attribute/)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(/excluded attribute/)).not.toBeInTheDocument();
  });

  it('handles undefined value lists when filtering', () => {
    setup({ algoControlValues: undefined as unknown as [] });

    expect(
      screen.queryByTestId(/algoControl attribute/)
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('included attribute 0 Cotton')).toBeVisible();
  });

  describe('Re-order by number', () => {
    it('should dispatch SET_BOOSTED_ORDER if new value within the range of boosted items', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Wool');
      expect(input).toHaveValue(4);
      await user.clear(input);
      await user.type(input, '1');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: { id: 'Wool', newIndex: 0 },
        });
      });
    });

    it('should not dispatch SET_BOOSTED_ORDER if new value is less than 1', async () => {
      const user = userEvent.setup({ delay: null });
      const dispatch = jest.fn();
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Wool');
      expect(input).toHaveValue(4);
      await user.clear(input);
      await user.type(input, '0');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(dispatch).not.toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: expect.any(Object),
        });
        expect(input).toHaveValue(4);
      });
    });

    it('should keep the existing order if the user deletes, then clicks outside without inputting a new order', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Satin');
      expect(input).toHaveValue(3);
      await user.clear(input);
      expect(input).toHaveValue(null);
      act(() => {
        input.blur();
      });

      await waitFor(() => {
        expect(input).toHaveValue(3);
      });
    });

    it('should keep the existing order if the user deletes, then clicks enter without inputting a new order', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Silk');
      expect(input).toHaveValue(2);
      await user.clear(input);
      expect(input).toHaveValue(null);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(input).toHaveValue(2);
      });
    });
  });
});
