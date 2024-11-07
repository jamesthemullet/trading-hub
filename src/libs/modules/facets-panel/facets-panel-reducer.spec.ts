import { CountryCode } from '@/libs/api';

import { FacetPanelState, facetsPanelReducer } from './facets-panel-reducer';

const mockFacetsPanelState: FacetPanelState = {
  includedFacets: ['1', '2', '3'],
  excludedFacets: [],
  countryCode: 'UK_IE',
};

describe('facetsPanelReducer', () => {
  describe('MOVE_INCLUDED_ROW_UP', () => {
    it('should move includedFacets row up', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
      };
      const action = {
        type: 'MOVE_INCLUDED_ROW_UP' as const,
        payload: {
          id: '3',
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1', '3', '2'],
      });
    });

    it('should not move includedFacets row up if it is already at the top', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_INCLUDED_ROW_UP' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      });
    });
  });

  describe('MOVE_INCLUDED_ROW_DOWN', () => {
    it('should move includedFacets row down', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_INCLUDED_ROW_DOWN' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        includedFacets: ['2', '1', '3'],
      });
    });

    it('should not move includedFacets row down if it is already at the bottom', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_INCLUDED_ROW_DOWN' as const,
        payload: {
          id: '3',
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
      });
    });

    it('should change display type from included to excluded', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['1'],
        excludedFacets: [],
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
      });
    });

    it('should change display type from excluded to algoControl', () => {
      const state: FacetPanelState = {
        ...mockFacetsPanelState,
        includedFacets: ['2', '4'],
        excludedFacets: ['1', '3'],
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
        payload: 'UK' as CountryCode,
      };
      const result = facetsPanelReducer(state, action);
      expect(result).toEqual({
        ...mockFacetsPanelState,
        countryCode: 'UK',
      });
    });
  });
});
