import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

import { initialState, reducer } from './reducer';

const mockOnlineData: BetaMerchandisingProductDiagnosticsListData = {
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

const mockOfflineData: BetaMerchandisingProductDiagnosticsListData = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [
    {
      reason: 'Failed to get product data',
      action: 'Contact the Product Domain team.',
    },
  ],
};

const mockNotIndexedData: BetaMerchandisingProductDiagnosticsListData = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [],
};

describe('reducer', () => {
  it('should return initial state', () => {
    expect(initialState).toEqual({
      query: '',
      productDisplay: null,
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
    expect(state.productDisplay).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should handle FETCH_START', () => {
    const stateWithDisplay = {
      ...initialState,
      productDisplay: reducer(
        { ...initialState, query: '60538523' },
        {
          type: 'FETCH_SUCCESS',
          payload: mockOnlineData,
          submittedQuery: '60538523',
        }
      ).productDisplay,
      error: 'previous error',
    };
    const state = reducer(stateWithDisplay, { type: 'FETCH_START' });
    expect(state.isLoading).toBe(true);
    expect(state.productDisplay).toBeNull();
    expect(state.error).toBe('');
  });

  it('should handle FETCH_ERROR', () => {
    const state = reducer(
      { ...initialState, isLoading: true },
      { type: 'FETCH_ERROR', payload: 'Something went wrong' }
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Something went wrong');
    expect(state.productDisplay).toBeNull();
  });

  describe('FETCH_SUCCESS — online product', () => {
    const state = reducer(
      { ...initialState, query: '60538523' },
      {
        type: 'FETCH_SUCCESS',
        payload: mockOnlineData,
        submittedQuery: '60538523',
      }
    );

    it('should set isLoading to false and clear error', () => {
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('');
    });

    it('should set mainStatusLabel and statusLabels for operational', () => {
      expect(state.productDisplay?.isIndexed).toBe(true);
      expect(state.productDisplay?.displayId).toBe('P60538523');
      expect(state.productDisplay?.mainStatusLabel).toBe(
        'Product is operational'
      );
      expect(state.productDisplay?.mainStatusVariant).toBe(
        'product-operational'
      );
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Operational'
      );
    });
  });

  describe('FETCH_SUCCESS — offline product with issue', () => {
    const state = reducer(
      { ...initialState, query: '60538523' },
      {
        type: 'FETCH_SUCCESS',
        payload: mockOfflineData,
        submittedQuery: '60538523',
      }
    );

    it('should use submittedQuery, not state.query, when the user has typed ahead', () => {
      const s = reducer(
        { ...initialState, query: '99999999' },
        {
          type: 'FETCH_SUCCESS',
          payload: mockOfflineData,
          submittedQuery: '60538523',
        }
      );
      expect(s.productDisplay?.displayId).toBe('P60538523');
    });

    it('should set singular issue count label', () => {
      expect(state.productDisplay?.isIndexed).toBe(false);
      expect(state.productDisplay?.mainStatusLabel).toBe('1 issue detected');
      expect(state.productDisplay?.mainStatusVariant).toBe('error');
    });

    it('should use plural form when issueCount is not 1', () => {
      const twoIssuesData: BetaMerchandisingProductDiagnosticsListData = {
        products: [],
        pagination: { totalItems: 0 },
        issues: [
          { reason: 'Failed to get product data', action: 'Fix it' },
          { reason: 'Another issue', action: 'Fix that too' },
        ],
      };
      const s = reducer(
        { ...initialState, query: '60538523' },
        {
          type: 'FETCH_SUCCESS',
          payload: twoIssuesData,
          submittedQuery: '60538523',
        }
      );
      expect(s.productDisplay?.mainStatusLabel).toBe('2 issues detected');
    });

    it('should set statusLabels for issue-detected and blocked sections', () => {
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Blocked by an issue'
      );
    });
  });

  describe('FETCH_SUCCESS — out of stock (blocked productAssembly)', () => {
    const mockOutOfStockData: BetaMerchandisingProductDiagnosticsListData = {
      products: [
        {
          id: 'p1',
          productId: '60538523',
          title: 'Test Product',
          price: '£10.00',
          imageUrl: [],
          isInStock: false,
          metadata: { isPinned: false },
        },
      ],
      pagination: { totalItems: 1 },
      issues: [
        {
          reason: 'Product is out of stock',
          action: 'Wait for the product to be restocked.',
        },
      ],
    };

    it('should derive issue count label and set blocked/issue-detected statusLabels', () => {
      const state = reducer(
        { ...initialState, query: '60538523' },
        {
          type: 'FETCH_SUCCESS',
          payload: mockOutOfStockData,
          submittedQuery: '60538523',
        }
      );
      expect(state.productDisplay?.mainStatusLabel).toBe('1 issue detected');
      expect(state.productDisplay?.mainStatusVariant).toBe('error');
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Blocked'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Issue detected'
      );
    });
  });

  describe('FETCH_SUCCESS — not indexed', () => {
    const state = reducer(
      { ...initialState, query: '60538523' },
      {
        type: 'FETCH_SUCCESS',
        payload: mockNotIndexedData,
        submittedQuery: '60538523',
      }
    );

    it('should set push-available mainStatus and statusLabels', () => {
      expect(state.productDisplay?.mainStatusLabel).toBe(
        'Emergency push available'
      );
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Push available'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Waiting for push'
      );
    });
  });

  describe('FETCH_SUCCESS — displayId already has P prefix', () => {
    it('should not double the P when productId already starts with P', () => {
      const dataWithPPrefix: BetaMerchandisingProductDiagnosticsListData = {
        products: [
          {
            id: 'p1',
            productId: 'P60538523',
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
      const state = reducer(
        { ...initialState, query: '60538523' },
        {
          type: 'FETCH_SUCCESS',
          payload: dataWithPPrefix,
          submittedQuery: '60538523',
        }
      );
      expect(state.productDisplay?.displayId).toBe('P60538523');
    });
  });
});
