import type { CategoryInfo } from '@/types/facets';

type PreviewCountryCode = 'UK' | 'IE';

export type FacetListState = {
  isDraftLoaded: boolean;
  shouldShowPreview: boolean;
  previewValue: string | undefined;
  selectedPreviewCountryCode: PreviewCountryCode;
  selectedCategoriesInfo: CategoryInfo[];
  selectedSearchTerms: string[];
  filter: string;
};

type FacetListAction =
  | { type: 'setDraftLoaded' }
  | { type: 'togglePreview' }
  | { type: 'setPreviewValue'; payload: string | undefined }
  | { type: 'setPreviewCountryCode'; payload: PreviewCountryCode }
  | { type: 'addCategory'; payload: CategoryInfo }
  | { type: 'removeCategory'; payload: string }
  | { type: 'setCategories'; payload: CategoryInfo[] }
  | { type: 'addSearchTerms'; payload: string[] }
  | { type: 'removeSearchTerm'; payload: string }
  | { type: 'setSearchTerms'; payload: string[] }
  | { type: 'setFilter'; payload: string };

export const FacetListReducer = (
  state: FacetListState,
  action: FacetListAction
): FacetListState => {
  switch (action.type) {
    case 'setDraftLoaded':
      return { ...state, isDraftLoaded: true };
    case 'togglePreview':
      return { ...state, shouldShowPreview: !state.shouldShowPreview };
    case 'setPreviewValue':
      return { ...state, previewValue: action.payload };
    case 'setPreviewCountryCode':
      return { ...state, selectedPreviewCountryCode: action.payload };
    case 'addCategory':
      return {
        ...state,
        selectedCategoriesInfo: [
          ...state.selectedCategoriesInfo,
          action.payload,
        ],
      };
    case 'removeCategory':
      return {
        ...state,
        selectedCategoriesInfo: state.selectedCategoriesInfo.filter(
          (c) => c.id !== action.payload
        ),
      };
    case 'setCategories':
      return { ...state, selectedCategoriesInfo: action.payload };
    case 'addSearchTerms':
      return {
        ...state,
        selectedSearchTerms: [...state.selectedSearchTerms, ...action.payload],
      };
    case 'removeSearchTerm':
      return {
        ...state,
        selectedSearchTerms: state.selectedSearchTerms.filter(
          (t) => t !== action.payload
        ),
      };
    case 'setSearchTerms':
      return { ...state, selectedSearchTerms: action.payload };
    case 'setFilter':
      return { ...state, filter: action.payload };
  }
};
