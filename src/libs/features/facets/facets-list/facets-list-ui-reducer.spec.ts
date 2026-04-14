import type { CategoryInfo } from '@/types/facets';

import {
  FacetListReducer,
  type FacetListState,
} from './facets-list-ui-reducer';

describe('FacetList reducer', () => {
  const defaultState: FacetListState = {
    isDraftLoaded: false,
    showPreview: false,
    previewValue: undefined,
    selectedPreviewCountryCode: 'UK',
    selectedCategoriesInfo: [],
    selectedSearchTerms: [],
    filter: '',
  };

  const mockCategory: CategoryInfo = {
    id: 'cat_123',
    name: 'Jeans',
    plpUrl: 'l/jeans',
  };

  describe('draft loaded', () => {
    it('should mark draft as loaded', () => {
      const result = FacetListReducer(defaultState, { type: 'setDraftLoaded' });

      expect(result.isDraftLoaded).toBe(true);
    });
  });

  describe('preview', () => {
    it('should toggle preview on', () => {
      const result = FacetListReducer(defaultState, { type: 'togglePreview' });

      expect(result.showPreview).toBe(true);
    });

    it('should toggle preview off', () => {
      const result = FacetListReducer(
        { ...defaultState, showPreview: true },
        { type: 'togglePreview' }
      );

      expect(result.showPreview).toBe(false);
    });

    it('should set preview value', () => {
      const result = FacetListReducer(defaultState, {
        type: 'setPreviewValue',
        payload: 'cat_123',
      });

      expect(result.previewValue).toBe('cat_123');
    });

    it('should clear preview value', () => {
      const result = FacetListReducer(
        { ...defaultState, previewValue: 'cat_123' },
        { type: 'setPreviewValue', payload: undefined }
      );

      expect(result.previewValue).toBeUndefined();
    });

    it('should set preview country code to IE', () => {
      const result = FacetListReducer(defaultState, {
        type: 'setPreviewCountryCode',
        payload: 'IE',
      });

      expect(result.selectedPreviewCountryCode).toBe('IE');
    });

    it('should set preview country code to UK', () => {
      const result = FacetListReducer(
        { ...defaultState, selectedPreviewCountryCode: 'IE' },
        { type: 'setPreviewCountryCode', payload: 'UK' }
      );

      expect(result.selectedPreviewCountryCode).toBe('UK');
    });
  });

  describe('categories', () => {
    it('should add a category', () => {
      const result = FacetListReducer(defaultState, {
        type: 'addCategory',
        payload: mockCategory,
      });

      expect(result.selectedCategoriesInfo).toHaveLength(1);
      expect(result.selectedCategoriesInfo[0]).toEqual(mockCategory);
    });

    it('should append category to existing list', () => {
      const existingCategory: CategoryInfo = { id: 'cat_456', name: 'Shoes' };
      const result = FacetListReducer(
        { ...defaultState, selectedCategoriesInfo: [existingCategory] },
        { type: 'addCategory', payload: mockCategory }
      );

      expect(result.selectedCategoriesInfo).toHaveLength(2);
      expect(result.selectedCategoriesInfo[1]).toEqual(mockCategory);
    });

    it('should only remove the category with matching id', () => {
      const otherCategory: CategoryInfo = { id: 'cat_456', name: 'Shoes' };
      const result = FacetListReducer(
        {
          ...defaultState,
          selectedCategoriesInfo: [mockCategory, otherCategory],
        },
        { type: 'removeCategory', payload: mockCategory.id }
      );

      expect(result.selectedCategoriesInfo).toHaveLength(1);
      expect(result.selectedCategoriesInfo[0]).toEqual(otherCategory);
    });

    it('should set categories', () => {
      const categories: CategoryInfo[] = [{ id: 'cat_1' }, { id: 'cat_2' }];
      const result = FacetListReducer(
        { ...defaultState, selectedCategoriesInfo: [mockCategory] },
        { type: 'setCategories', payload: categories }
      );

      expect(result.selectedCategoriesInfo).toEqual(categories);
    });
  });

  describe('search terms', () => {
    it('should add a search term', () => {
      const result = FacetListReducer(defaultState, {
        type: 'addSearchTerm',
        payload: 'socks',
      });

      expect(result.selectedSearchTerms).toHaveLength(1);
      expect(result.selectedSearchTerms[0]).toBe('socks');
    });

    it('should append search term to existing list', () => {
      const result = FacetListReducer(
        { ...defaultState, selectedSearchTerms: ['socks'] },
        { type: 'addSearchTerm', payload: 'shoes' }
      );

      expect(result.selectedSearchTerms).toHaveLength(2);
      expect(result.selectedSearchTerms[1]).toBe('shoes');
    });

    it('should remove a search term', () => {
      const result = FacetListReducer(
        { ...defaultState, selectedSearchTerms: ['socks', 'shoes'] },
        { type: 'removeSearchTerm', payload: 'socks' }
      );

      expect(result.selectedSearchTerms).toHaveLength(1);
      expect(result.selectedSearchTerms[0]).toBe('shoes');
    });

    it('should set search terms', () => {
      const terms = ['jeans', 'trousers'];
      const result = FacetListReducer(
        { ...defaultState, selectedSearchTerms: ['socks'] },
        { type: 'setSearchTerms', payload: terms }
      );

      expect(result.selectedSearchTerms).toEqual(terms);
    });
  });

  describe('filter', () => {
    it('should set filter', () => {
      const result = FacetListReducer(defaultState, {
        type: 'setFilter',
        payload: 'color',
      });

      expect(result.filter).toBe('color');
    });

    it('should clear filter', () => {
      const result = FacetListReducer(
        { ...defaultState, filter: 'color' },
        { type: 'setFilter', payload: '' }
      );

      expect(result.filter).toBe('');
    });
  });
});
