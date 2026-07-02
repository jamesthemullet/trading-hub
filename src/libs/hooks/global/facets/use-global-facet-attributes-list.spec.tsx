import type { ActionDispatch } from 'react';
import { act, renderHook } from '@testing-library/react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import type { DragEndEvent } from '@dnd-kit/core';

import { useGlobalFacetAttributesList } from './use-global-facet-attributes-list';

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');

  return {
    ...actual,
    useSensor: jest
      .fn()
      .mockImplementation((_sensor, options) => ({ sensor: _sensor, options })),
    useSensors: jest.fn().mockImplementation((...sensors) => sensors),
    PointerSensor: jest.fn(),
    KeyboardSensor: jest.fn(),
  };
});

jest.mock('@/libs/containers/facets/sortable-row/sortable-row', () => ({
  SortableRow: ({
    children,
  }: {
    children: (args: Record<string, unknown>) => unknown;
  }) =>
    children({
      setNodeRef: jest.fn(),
      setActivatorNodeRef: jest.fn(),
      style: {},
      attributes: {},
      listeners: {},
    }),
}));

type HookParams = Parameters<typeof useGlobalFacetAttributesList>[0];

const mockFacet: MerchandisingReturnedGlobalFacet = {
  type: 'root',
  id: 'facet-id',
  displayValue: 'Facet',
  indexPropertyName: 'facetIndex',
  lastChanged: { date: '', user: '' },
};

const createBaseState = (): GlobalAttributesPageState => ({
  boostedRows: [
    {
      displayName: 'Alpha Item',
      attributes: ['alpha'],
      isMergeGroup: false,
      isChecked: false,
      order: 1,
    },
    {
      displayName: 'Beta Item',
      attributes: ['beta'],
      isMergeGroup: false,
      isChecked: false,
      order: 2,
    },
  ],
  nonBoostedExcludedRows: [
    {
      displayName: 'Gamma Default',
      attributes: ['gamma'],
      isMergeGroup: false,
      isChecked: false,
      order: 1,
    },
  ],
  excludedRows: [
    {
      displayName: 'Delta Excluded',
      attributes: ['delta'],
      isMergeGroup: false,
      isChecked: false,
      order: 1,
    },
  ],
  merged: [],
  errorStates: {},
  currentMerge: {
    isOpen: false,
    displayValue: '',
    mergedValues: [],
    demergedValues: [],
    currentMergeValues: [],
  },
});

const createInitialOrders = (state: GlobalAttributesPageState) =>
  state.boostedRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.displayName] = row.order;
    return acc;
  }, {});

const createHookParams = (overrides: Partial<HookParams> = {}): HookParams => {
  const state = overrides.globalAttributesLocalState ?? createBaseState();
  const dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
    overrides.dispatch ?? jest.fn();
  const setIsAwaitingUpdate = overrides.setIsAwaitingUpdate ?? jest.fn();

  return {
    attributeValues: [] as MerchandisingAttributeValuesResponse['values'],
    searchQuery: '',
    countryCode: 'GB' as MerchandisingCountryCode,
    editingValues: [],
    setEditingValues: overrides.setEditingValues ?? jest.fn(),
    globalAttributesLocalState: state,
    isWriteEnabled: true,
    setIsAwaitingUpdate,
    facet: mockFacet,
    dispatch,
    totalSelectedItems: 0,
    handleOrderChangeCallback: jest.fn(),
    initialOrders: overrides.initialOrders ?? createInitialOrders(state),
    ...overrides,
  };
};

describe('useGlobalFacetAttributesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters boosted ids based on the provided search query', () => {
    const params = createHookParams({ searchQuery: 'alpha' });
    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    expect(result.current.boostedVisibleIds).toEqual(['Alpha Item']);
  });

  it('disables dragging when only one boosted row matches the filter', () => {
    const params = createHookParams({ searchQuery: 'alpha' });
    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    const boostedRows = result.current.boostedValuesRows ?? [];

    expect(boostedRows).toHaveLength(1);
    expect(boostedRows[0].props).toMatchObject({ disabled: true });
  });

  it('does not dispatch when drag end lacks a drop target', () => {
    const dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
      jest.fn();

    const params = createHookParams({ dispatch });

    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    act(() => {
      result.current.handleBoostedDragEnd({
        active: { id: 'Alpha Item' },
        over: null,
      } as unknown as DragEndEvent);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when active and over map to identical indices', () => {
    const dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
      jest.fn();
    const setIsAwaitingUpdate = jest.fn();

    const params = createHookParams({ dispatch, setIsAwaitingUpdate });

    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    act(() => {
      result.current.handleBoostedDragEnd({
        active: { id: 'Alpha Item' },
        over: { id: 'Alpha Item' },
      } as unknown as DragEndEvent);
    });

    expect(setIsAwaitingUpdate).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when active id is not part of boosted rows', () => {
    const dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
      jest.fn();
    const setIsAwaitingUpdate = jest.fn();

    const params = createHookParams({ dispatch, setIsAwaitingUpdate });

    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    act(() => {
      result.current.handleBoostedDragEnd({
        active: { id: 'Missing Item' },
        over: { id: 'Alpha Item' },
      } as unknown as DragEndEvent);
    });

    expect(setIsAwaitingUpdate).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches SET_BOOSTED_ORDER when a search filter is active and >=2 boosted rows are visible', () => {
    const dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
      jest.fn();
    // 'Item' matches both 'Alpha Item' and 'Beta Item' — 2 visible rows, drag enabled
    const params = createHookParams({ dispatch, searchQuery: 'Item' });

    const { result } = renderHook(() => useGlobalFacetAttributesList(params));

    act(() => {
      result.current.handleBoostedDragEnd({
        active: { id: 'Alpha Item' },
        over: { id: 'Beta Item' },
      } as unknown as DragEndEvent);
    });

    // Alpha Item is at index 0 in boostedOrder; Beta Item is at index 1
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_BOOSTED_ORDER',
      payload: { id: 'Alpha Item', newIndex: 1 },
    });
  });
});
