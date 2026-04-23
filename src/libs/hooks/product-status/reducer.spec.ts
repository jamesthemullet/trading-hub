import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

import { initialState, reducer } from './reducer';

const mockData: BetaMerchandisingProductDiagnosticsListData = {
  products: [
    {
      id: 'p1',
      productId: '60538523',
      title: 'Test Product',
      price: '£10.00',
      imageUrl: [],
      isInStock: true,
      metadata: { isPinned: false },
    },
  ],
  pagination: { totalItems: 1 },
  issues: [],
};

describe('reducer', () => {
  it('should return initial state', () => {
    expect(initialState).toEqual({
      query: '',
      data: null,
      isLoading: false,
      error: '',
    });
  });

  it('should handle SET_QUERY', () => {
    const state = reducer(initialState, {
      type: 'SET_QUERY',
      payload: '60538523',
    });

    expect(state.query).toBe('60538523');
    expect(state.data).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should handle FETCH_START', () => {
    const stateWithData = {
      ...initialState,
      data: mockData,
      error: 'previous error',
    };
    const state = reducer(stateWithData, { type: 'FETCH_START' });

    expect(state.isLoading).toBe(true);
    expect(state.data).toBeNull();
    expect(state.error).toBe('');
  });

  it('should handle FETCH_SUCCESS', () => {
    const loadingState = { ...initialState, isLoading: true };
    const state = reducer(loadingState, {
      type: 'FETCH_SUCCESS',
      payload: mockData,
    });

    expect(state.isLoading).toBe(false);
    expect(state.data).toBe(mockData);
    expect(state.error).toBe('');
  });

  it('should handle FETCH_ERROR', () => {
    const loadingState = { ...initialState, isLoading: true };
    const state = reducer(loadingState, {
      type: 'FETCH_ERROR',
      payload: 'Something went wrong',
    });

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Something went wrong');
    expect(state.data).toBeNull();
  });
});
