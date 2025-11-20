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
  id: 'facet-1',
  indexPropertyName: 'facet-1',
  displayValue: 'facet-1',
  lastChanged: { date: '', user: '' },
};

describe('useGlobalFacetAttributesEditModal', () => {
  const mockDispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
    jest.fn();
  const mockSetIsAwaitingUpdate = jest.fn();

  const baseState: GlobalAttributesPageState = {
    boostedRows: [],
    nonBoostedExcludedRows: [],
    excludedRows: [],
    merged: [],
    errorStates: {},
    currentMerge: { isOpen: false, displayValue: '', mergedValues: [] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

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
      payload: { allSelected: false },
    });

    raf.mockRestore();
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

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

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
    raf.mockRestore();
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

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

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

    raf.mockRestore();
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

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

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

    raf.mockRestore();
  });
});
