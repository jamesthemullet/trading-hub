import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

import type { RecentSearch } from './recent-searches-storage';
import { createInitialState, initialState, reducer } from './reducer';
import { ProductError } from './use-product-details';

beforeEach(() => {
  localStorage.clear();
});

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

const mockNotIndexedData: BetaMerchandisingProductDiagnosticsListData = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [],
};

const fetchSuccess = (
  payload: BetaMerchandisingProductDiagnosticsListData,
  submittedQuery = '60538523'
) =>
  reducer(
    { ...initialState, query: '60538523' },
    { type: 'FETCH_SUCCESS', payload, submittedQuery }
  );

describe('reducer', () => {
  it('should return initial state', () => {
    expect(initialState).toEqual({
      query: '',
      market: 'UK',
      productDisplay: null,
      isLoading: false,
      error: '',
      recentSearches: [],
      showRecentSearches: false,
    });
  });

  it('createInitialState should hydrate recentSearches from localStorage', () => {
    const stored: RecentSearch[] = [
      {
        displayId: 'P60538523',
        title: 'Green Wool Coat',
        imageUrl: null,
        mainStatusLabel: 'Product is operational',
        mainStatusVariant: 'product-operational',
        searchedAt: 1000,
      },
    ];
    localStorage.setItem(
      'product-status-recent-searches',
      JSON.stringify(stored)
    );
    expect(createInitialState().recentSearches).toEqual(stored);
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

  it('should handle SET_MARKET', () => {
    const stateWithDisplay = {
      ...initialState,
      productDisplay: fetchSuccess(mockOnlineData).productDisplay,
    };
    const state = reducer(stateWithDisplay, {
      type: 'SET_MARKET',
      payload: 'IE',
    });
    expect(state.market).toBe('IE');
    expect(state.productDisplay).toBeNull();
  });

  it('should handle FETCH_START', () => {
    const stateWithDisplay = {
      ...initialState,
      productDisplay: fetchSuccess(mockOnlineData).productDisplay,
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
    const state = fetchSuccess(mockOnlineData);

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

  describe('FETCH_SUCCESS — out of stock', () => {
    const mockOutOfStockData: BetaMerchandisingProductDiagnosticsListData = {
      products: [{ ...mockOnlineData.products[0], isInStock: false }],
      pagination: { totalItems: 1 },
      issues: [
        { reason: ProductError.OutOfStock, action: 'Wait for restock.' },
      ],
    };

    const state = fetchSuccess(mockOutOfStockData);

    it('should mark availability as issue-detected and all other sections as blocked', () => {
      expect(state.productDisplay?.mainStatusLabel).toBe('1 issue detected');
      expect(state.productDisplay?.mainStatusVariant).toBe('error');
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.saleability.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.associatedRules.statusLabel).toBe(
        'Blocked by an issue'
      );
    });
  });

  describe('FETCH_SUCCESS — not saleable', () => {
    const mockNotSaleableData: BetaMerchandisingProductDiagnosticsListData = {
      products: [mockOnlineData.products[0]],
      pagination: { totalItems: 1 },
      issues: [
        { reason: ProductError.NotSaleable, action: 'Mark as saleable.' },
      ],
    };

    const state = fetchSuccess(mockNotSaleableData);

    it('should mark saleability as issue-detected and all other sections as blocked', () => {
      expect(state.productDisplay?.mainStatusLabel).toBe('1 issue detected');
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.saleability.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.associatedRules.statusLabel).toBe(
        'Blocked by an issue'
      );
    });
  });

  describe('FETCH_SUCCESS — out of stock and not saleable combined', () => {
    const mockCombinedData: BetaMerchandisingProductDiagnosticsListData = {
      products: [{ ...mockOnlineData.products[0], isInStock: false }],
      pagination: { totalItems: 1 },
      issues: [
        { reason: ProductError.OutOfStock, action: 'Wait for restock.' },
        { reason: ProductError.NotSaleable, action: 'Mark as saleable.' },
      ],
    };

    it('should use plural form, set both affected sections as issue-detected, and block remaining', () => {
      const state = fetchSuccess(mockCombinedData);
      expect(state.productDisplay?.mainStatusLabel).toBe('2 issues detected');
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.saleability.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.associatedRules.statusLabel).toBe(
        'Blocked by an issue'
      );
    });
  });

  describe('FETCH_SUCCESS — not indexed', () => {
    const state = fetchSuccess(mockNotIndexedData);

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

  describe('FETCH_SUCCESS — unknown issues go to productAssembly', () => {
    const mockUnknownIssueData: BetaMerchandisingProductDiagnosticsListData = {
      products: [mockOnlineData.products[0]],
      pagination: { totalItems: 1 },
      issues: [{ reason: 'Some unexpected issue', action: 'Contact support.' }],
    };

    it('should set productAssembly to issue-detected and block all downstream sections', () => {
      const state = fetchSuccess(mockUnknownIssueData);
      expect(state.productDisplay?.mainStatusLabel).toBe('1 issue detected');
      expect(state.productDisplay?.sections.productAssembly.statusLabel).toBe(
        'Issue detected'
      );
      expect(state.productDisplay?.sections.availability.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.saleability.statusLabel).toBe(
        'Blocked by an issue'
      );
      expect(state.productDisplay?.sections.associatedRules.statusLabel).toBe(
        'Blocked by an issue'
      );
    });
  });

  describe('FETCH_SUCCESS — displayId already has P prefix', () => {
    it('should not double the P when productId already starts with P', () => {
      const dataWithPPrefix: BetaMerchandisingProductDiagnosticsListData = {
        products: [{ ...mockOnlineData.products[0], productId: 'P60538523' }],
        pagination: { totalItems: 1 },
        issues: [],
      };
      const state = fetchSuccess(dataWithPPrefix);
      expect(state.productDisplay?.displayId).toBe('P60538523');
    });
  });

  describe('FETCH_SUCCESS — submittedQuery used for displayId', () => {
    it('should use submittedQuery, not state.query, when the user has typed ahead', () => {
      const s = reducer(
        { ...initialState, query: '99999999' },
        {
          type: 'FETCH_SUCCESS',
          payload: mockNotIndexedData,
          submittedQuery: '60538523',
        }
      );
      expect(s.productDisplay?.displayId).toBe('P60538523');
    });
  });

  describe('OPEN_RECENT_SEARCHES / CLOSE_RECENT_SEARCHES', () => {
    it('should set showRecentSearches to true', () => {
      const state = reducer(initialState, { type: 'OPEN_RECENT_SEARCHES' });
      expect(state.showRecentSearches).toBe(true);
    });

    it('should set showRecentSearches back to false', () => {
      const open = reducer(initialState, { type: 'OPEN_RECENT_SEARCHES' });
      const closed = reducer(open, { type: 'CLOSE_RECENT_SEARCHES' });
      expect(closed.showRecentSearches).toBe(false);
    });
  });

  describe('ADD_RECENT_SEARCH', () => {
    const makeSearch = (displayId: string): RecentSearch => ({
      displayId,
      title: `Product ${displayId}`,
      imageUrl: null,
      mainStatusLabel: 'Product is operational',
      mainStatusVariant: 'product-operational',
      searchedAt: 1000,
    });

    it('should prepend a new search to the front', () => {
      const first = makeSearch('P111');
      const second = makeSearch('P222');
      const s1 = reducer(initialState, {
        type: 'ADD_RECENT_SEARCH',
        payload: first,
      });
      const s2 = reducer(s1, { type: 'ADD_RECENT_SEARCH', payload: second });
      expect(s2.recentSearches[0]).toEqual(second);
      expect(s2.recentSearches[1]).toEqual(first);
    });

    it('should move an existing entry to the front instead of duplicating', () => {
      const search = makeSearch('P111');
      const other = makeSearch('P222');
      const s1 = reducer(initialState, {
        type: 'ADD_RECENT_SEARCH',
        payload: other,
      });
      const s2 = reducer(s1, { type: 'ADD_RECENT_SEARCH', payload: search });
      const s3 = reducer(s2, { type: 'ADD_RECENT_SEARCH', payload: other });
      expect(s3.recentSearches).toHaveLength(2);
      expect(s3.recentSearches[0].displayId).toBe('P222');
    });

    it('should trim the list to MAX_RECENT_SEARCHES (20)', () => {
      let state = initialState;
      for (let i = 0; i < 21; i++) {
        state = reducer(state, {
          type: 'ADD_RECENT_SEARCH',
          payload: makeSearch(`P${i}`),
        });
      }
      expect(state.recentSearches).toHaveLength(20);
      expect(state.recentSearches[0].displayId).toBe('P20');
    });

    it('should persist the updated list to localStorage', () => {
      const search = makeSearch('P60538523');
      reducer(initialState, { type: 'ADD_RECENT_SEARCH', payload: search });
      const stored = JSON.parse(
        localStorage.getItem('product-status-recent-searches')!
      ) as RecentSearch[];
      expect(stored[0]).toEqual(search);
    });
  });
});
