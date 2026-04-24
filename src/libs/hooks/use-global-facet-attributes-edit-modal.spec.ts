import type { ActionDispatch } from 'react';
import { act, renderHook } from '@testing-library/react';

import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import type { MerchandisingReturnedGlobalFacet } from '../api';
import { useGlobalFacetAttributesEditModal } from './use-global-facet-attributes-edit-modal';

const mockCheckMergeNameUnique = jest.fn();

jest.mock('@/libs/hooks', () => ({
  useCheckMergeNameUnique: () => ({
    checkMergeNameUnique: mockCheckMergeNameUnique,
  }),
}));

const mockFacet: MerchandisingReturnedGlobalFacet = {
  type: 'root',
  id: 'facet-1',
  indexPropertyName: 'facet-1',
  displayValue: 'facet-1',
  lastChanged: { date: '', user: '' },
};

describe('useGlobalFacetAttributesEditModal', () => {
  const mockDispatch = jest.fn() as jest.MockedFunction<
    ActionDispatch<[action: GlobalAttributesPageReducer]>
  >;
  const mockSetIsAwaitingUpdate = jest.fn();

  const baseState: GlobalAttributesPageState = {
    boostedRows: [],
    nonBoostedExcludedRows: [],
    excludedRows: [],
    merged: [],
    errorStates: {},
    currentMerge: {
      isOpen: false,
      displayValue: '',
      mergedValues: [],
      demergedValues: [],
      currentMergeValues: [],
    },
  };

  let rafSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
  });

  afterEach(() => {
    rafSpy.mockRestore();
  });

  it('handleEditModalError updates local state and dispatches SET_ERROR', () => {
    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: baseState,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    act(() => {
      result.current.handleEditModalError('an error');
    });

    expect(result.current.editModalError).toBe('an error');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: { displayName: 'dn', message: 'an error' },
    });
  });

  it('handleEditModalSave short-circuits when given empty or whitespace-only value', async () => {
    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: baseState,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('   ');
    });

    expect(result.current.editModalError).toBe('You must supply a value');
    expect(mockSetIsAwaitingUpdate).not.toHaveBeenCalled();
    expect(mockCheckMergeNameUnique).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handleEditModalSave short-circuits when value exists in other merge groups', async () => {
    const state: GlobalAttributesPageState = {
      ...baseState,
      merged: [{ displayValue: 'G1', mergedValues: ['exists'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('exists');
    });

    expect(mockSetIsAwaitingUpdate).toHaveBeenCalledWith(true);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: { displayName: 'dn', message: 'exists is not a unique value' },
    });

    expect(mockCheckMergeNameUnique).not.toHaveBeenCalled();
  });

  it('handleEditModalSave surfaces API error from checkMergeNameUnique and resets awaiting state', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({
      isUniqueValue: false,
      error: 'API unavailable',
    });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [
        {
          displayName: 'A',
          attributes: ['A'],
          isMergeGroup: false,
          isChecked: true,
          order: 1,
        },
      ],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('candidate');
    });

    expect(result.current.editModalError).toBe('API unavailable');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: { displayName: 'dn', message: 'API unavailable' },
    });
    expect(mockSetIsAwaitingUpdate).toHaveBeenCalledWith(false);
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREATE_MERGE_GROUP' })
    );
  });

  it('handleEditModalSave handles non-unique response from remote check', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: false });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [
        {
          displayName: 'A',
          attributes: ['A'],
          isMergeGroup: false,
          isChecked: true,
          order: 1,
        },
      ],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('candidate');
    });

    expect(mockSetIsAwaitingUpdate).toHaveBeenCalledWith(true);
    expect(mockCheckMergeNameUnique).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'dn',
        message: 'candidate is not a unique value',
      },
    });
  });

  it('handleEditModalSave dispatches CREATE_MERGE_GROUP when unique and no existing merge', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [
        {
          displayName: 'A',
          attributes: ['A'],
          isMergeGroup: false,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UniqueName');
    });

    expect(mockSetIsAwaitingUpdate).toHaveBeenCalledWith(true);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREATE_MERGE_GROUP' })
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_ALL_ATTRIBUTES',
      payload: { areAllSelected: false },
    });
  });

  it('handleEditModalSave works when only excludedRows selected (isFirstAttributeExcluded)', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      excludedRows: [
        {
          displayName: 'E',
          attributes: ['E'],
          isMergeGroup: false,
          isChecked: true,
        },
      ],
      boostedRows: [],
      nonBoostedExcludedRows: [],
      merged: [],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UniqueE');
    });

    expect(mockSetIsAwaitingUpdate).toHaveBeenCalledWith(true);
    expect(mockCheckMergeNameUnique).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREATE_MERGE_GROUP' })
    );
  });

  it('passes provided countryCode to checkMergeNameUnique when given', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [
        {
          displayName: 'A',
          attributes: ['A'],
          isMergeGroup: false,
          isChecked: true,
          order: 1,
        },
      ],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        countryCode: 'UK',
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UniqueCountry');
    });

    expect(mockCheckMergeNameUnique).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'UK' })
    );
  });

  it('handleEditModalSave works when nonBoostedExcludedRows selected', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [],
      excludedRows: [],
      nonBoostedExcludedRows: [
        {
          displayName: 'NB',
          attributes: ['NB'],
          isMergeGroup: false,
          isChecked: true,
        },
      ],
      merged: [],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UniqueNB');
    });

    expect(mockCheckMergeNameUnique).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREATE_MERGE_GROUP' })
    );
  });

  it('handleEditModalSave dispatches UPDATE_MERGE_GROUP when existing merge group selected', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      boostedRows: [
        {
          displayName: 'MG',
          attributes: ['x', 'y'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [{ displayValue: 'MG', mergedValues: ['x', 'y'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UpdatedName');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_MERGE_GROUP' })
    );
  });

  it('handleEditModalSave dispatches REMOVE_FROM_MERGE_GROUP for demerged values from existing merge group', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      currentMerge: {
        isOpen: true,
        displayValue: 'MG',
        mergedValues: ['x', 'y', 'z'],
        demergedValues: [],
        currentMergeValues: [],
      },
      boostedRows: [
        {
          displayName: 'MG',
          attributes: ['x', 'y', 'z'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [{ displayValue: 'MG', mergedValues: ['x', 'y', 'z'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UpdatedMG', ['y']);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_FROM_MERGE_GROUP',
      payload: {
        valueToRemove: 'y',
        mergeDisplayName: 'MG',
      },
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_MERGE_GROUP' })
    );
  });

  it('filters out demerged values from remaining merged values', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      currentMerge: {
        isOpen: true,
        displayValue: 'MG',
        mergedValues: ['a', 'b', 'c'],
        demergedValues: [],
        currentMergeValues: [],
      },
      boostedRows: [
        {
          displayName: 'MG',
          attributes: ['a', 'b', 'c'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [{ displayValue: 'MG', mergedValues: ['a', 'b', 'c'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('FilteredMG', ['b']);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_MERGE_GROUP',
        payload: expect.objectContaining({
          attributes: ['a', 'c'],
        }),
      })
    );
  });

  it('uses currentMerge displayValue as fallback when original merge group has no displayValue', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      currentMerge: {
        isOpen: true,
        displayValue: 'CurrentMGName',
        mergedValues: ['x', 'y', 'z'],
        demergedValues: [],
        currentMergeValues: [],
      },
      boostedRows: [
        {
          displayName: 'MG',
          attributes: ['x', 'y', 'z'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [{ displayValue: '', mergedValues: ['x', 'y', 'z'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UpdatedMG', ['y']);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_FROM_MERGE_GROUP',
      payload: {
        valueToRemove: 'y',
        mergeDisplayName: 'CurrentMGName',
      },
    });
  });

  it('uses originalMergeGroup displayValue when removing demerged values', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      currentMerge: {
        isOpen: true,
        displayValue: 'OriginalMGName',
        mergedValues: ['x', 'y', 'z'],
        demergedValues: [],
        currentMergeValues: [],
      },
      boostedRows: [
        {
          displayName: 'OriginalMGName',
          attributes: ['x', 'y', 'z'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [
        { displayValue: 'OriginalMGName', mergedValues: ['x', 'y', 'z'] },
      ],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('UpdatedMG', ['x']);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_FROM_MERGE_GROUP',
      payload: {
        valueToRemove: 'x',
        mergeDisplayName: 'OriginalMGName',
      },
    });
  });

  it('does not dispatch REMOVE_FROM_MERGE_GROUP for values not in original merge group', async () => {
    mockCheckMergeNameUnique.mockResolvedValue({ isUniqueValue: true });

    const state: GlobalAttributesPageState = {
      ...baseState,
      currentMerge: {
        isOpen: true,
        displayValue: 'NewMG',
        mergedValues: ['notInOriginal', 'alsoNotInOriginal'],
        demergedValues: [],
        currentMergeValues: [],
      },
      boostedRows: [
        {
          displayName: 'MG',
          attributes: ['notInOriginal', 'alsoNotInOriginal'],
          isMergeGroup: true,
          isChecked: true,
          order: 1,
        },
      ],
      merged: [{ displayValue: 'MG', mergedValues: ['x', 'y', 'z'] }],
    };

    const { result } = renderHook(() =>
      useGlobalFacetAttributesEditModal({
        facet: mockFacet,
        displayName: 'dn',
        dispatch: mockDispatch,
        globalAttributesLocalState: state,
        setIsAwaitingUpdate: mockSetIsAwaitingUpdate,
      })
    );

    await act(async () => {
      await result.current.handleEditModalSave('NewMG', ['notInOriginal']);
    });

    const removeFromMergeGroupCalls = mockDispatch.mock.calls.filter(
      (call) => call[0].type === 'REMOVE_FROM_MERGE_GROUP'
    );
    expect(removeFromMergeGroupCalls).toHaveLength(0);
  });
});
