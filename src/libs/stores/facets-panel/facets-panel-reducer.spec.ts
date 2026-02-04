import type { MerchandisingCountryCode } from '@/libs/api';

import type { FacetPanelState } from './facets-panel-reducer';
import { facetsPanelReducer } from './facets-panel-reducer';

const mockFacetsPanelState: FacetPanelState = {
  includedFacets: ['1', '2', '3'],
  excludedFacets: [],
  countryCode: 'UK_IE',
  orders: {
    '1': 1,
    '2': 2,
    '3': 3,
  },
};

describe('facetsPanelReducer', () => {
  describe('SET_INCLUDED_ORDER', () => {
    it('should position the selected facet at the requested index', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3', '4'],
        orders: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
        },
      };

      const action = {
        type: 'SET_INCLUDED_ORDER' as const,
        payload: {
          id: '4',
          newIndex: 1,
        },
      };

      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1', '4', '2', '3'],
        orders: {
          '1': 1,
          '4': 2,
          '2': 3,
          '3': 4,
        },
      });
    });

    it('should not update state when the facet is not included', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      };

      const action = {
        type: 'SET_INCLUDED_ORDER' as const,
        payload: {
          id: '999',
          newIndex: 1,
        },
      };

      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      });
    });

    it('should not update state when the facet is dropped back to its original index', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      };

      const action = {
        type: 'SET_INCLUDED_ORDER' as const,
        payload: {
          id: '2',
          newIndex: 1,
        },
      };

      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      });
    });
  });

  describe('CHANGE_DISPLAY_TYPE', () => {
    it('should change display type to included', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: [],
        orders: {},
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'included' as const,
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1'],
        excludedFacets: [],
        orders: {
          '1': 1,
        },
      });
    });

    it('should change display type from included to excluded', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1'],
        excludedFacets: [],
        orders: {
          '1': 1,
        },
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'excluded' as const,
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: [],
        excludedFacets: ['1'],
        orders: {},
      });
    });

    it('should change display type from excluded to algoControl', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['2', '4'],
        excludedFacets: ['1', '3'],
        orders: {
          '2': 1,
          '4': 2,
        },
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '5',
          newDisplayType: 'algoControl' as const,
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['2', '4'],
        excludedFacets: ['1', '3'],
        orders: {
          '2': 1,
          '4': 2,
        },
      });
    });
  });

  describe('changeCountry', () => {
    it('should change country', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
      };
      const action = {
        type: 'changeCountry' as const,
        payload: 'UK' as MerchandisingCountryCode,
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        countryCode: 'UK',
      });
    });
  });
});
