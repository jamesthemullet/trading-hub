import type {
  GetProductDiagnosticsData,
  MerchandisingCountryCode,
  ProductOfflineIssue,
} from '@/libs/api/generated/open-api';
import type {
  OperationalStatusVariant,
  ProductStatusVariant,
} from '@/libs/components/status-badge/status-badge';

import type { RecentSearch } from './recent-searches-storage';
import {
  getStoredSearches,
  MAX_RECENT_SEARCHES,
  saveSearches,
} from './recent-searches-storage';
import type {
  DetailItem,
  Product,
  Section,
  SectionStatus,
} from './use-product-details';
import { getProductDetails, ProductError } from './use-product-details';

type IssueWithMessage = ProductOfflineIssue & {
  type: 'warning' | 'error';
  copyMessage: string;
};

export type SectionWithLabel<T> = {
  content: T;
  issues: IssueWithMessage[];
  status: SectionStatus;
  statusLabel: string;
};

export type ProductDisplay = {
  isIndexed: boolean;
  product: Product | null;
  displayId: string;
  mainStatusLabel: string;
  mainStatusVariant: ProductStatusVariant | OperationalStatusVariant;
  sections: {
    productAssembly: SectionWithLabel<DetailItem[]>;
    availability: SectionWithLabel<string | null>;
    saleability: SectionWithLabel<string | null>;
    associatedRules: SectionWithLabel<string | null>;
  };
};

type State = {
  query: string;
  market: MerchandisingCountryCode;
  productDisplay: ProductDisplay | null;
  isLoading: boolean;
  error: string;
  recentSearches: RecentSearch[];
  shouldShowRecentSearches: boolean;
};

export type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_MARKET'; payload: MerchandisingCountryCode }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: GetProductDiagnosticsData;
      submittedQuery: string;
    }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: RecentSearch }
  | { type: 'OPEN_RECENT_SEARCHES' }
  | { type: 'CLOSE_RECENT_SEARCHES' };

export { type RecentSearch };

export const initialState: State = {
  query: '',
  market: 'UK',
  productDisplay: null,
  isLoading: false,
  error: '',
  recentSearches: [],
  shouldShowRecentSearches: false,
};

export const createInitialState = (): State => ({
  ...initialState,
  recentSearches: getStoredSearches(),
});

const getStatusLabel = (status: SectionStatus): string => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'issue-detected':
      return 'Issue detected';
    case 'blocked':
      return 'Blocked by an issue';
    case 'push-available':
      return 'Push available';
    case 'waiting':
      return 'Waiting for push';
  }
};

const getCopyMessage = (reason: string, displayId: string): string => {
  if (reason === ProductError.NotIndexed) {
    return `I'm requesting for an Emergency Push for '${displayId}' as soon as possible.`;
  }
  if (reason === ProductError.OutOfStock) {
    return `The product status for '${displayId}' is out of stock. Please confirm stock levels.`;
  }
  return `The product data for '${displayId}' is not set up properly. Please send more information.`;
};

const buildSection = <T>(
  section: Section<T>,
  displayId: string
): SectionWithLabel<T> => ({
  content: section.content,
  status: section.status,
  statusLabel: getStatusLabel(section.status),
  issues: section.issues.map((issue) => ({
    ...issue,
    copyMessage: getCopyMessage(issue.reason, displayId),
  })),
});

const getMainStatus = (
  issueCount: number,
  isPushAvailable: boolean
): {
  mainStatusLabel: string;
  mainStatusVariant: ProductStatusVariant | OperationalStatusVariant;
} => {
  if (isPushAvailable) {
    return {
      mainStatusLabel: 'Emergency push available',
      mainStatusVariant: 'emergency',
    };
  }
  if (issueCount > 0) {
    return {
      mainStatusLabel: `${issueCount} issue${issueCount !== 1 ? 's' : ''} detected`,
      mainStatusVariant: 'error',
    };
  }
  return {
    mainStatusLabel: 'Product is operational',
    mainStatusVariant: 'product-operational',
  };
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_MARKET':
      return { ...state, market: action.payload, productDisplay: null };
    case 'FETCH_START':
      return { ...state, productDisplay: null, isLoading: true, error: '' };
    case 'FETCH_SUCCESS': {
      const { isIndexed, product, sections } = getProductDetails(
        action.payload
      );
      const { mainStatusLabel, mainStatusVariant } = getMainStatus(
        action.payload.issues.length,
        sections.productAssembly.status === 'push-available'
      );
      const rawId = product?.productId ?? action.submittedQuery;
      const displayId = rawId.includes('P') ? rawId : `P${rawId}`;

      return {
        ...state,
        isLoading: false,
        error: '',
        productDisplay: {
          isIndexed,
          product,
          displayId,
          mainStatusLabel,
          mainStatusVariant,
          sections: {
            productAssembly: buildSection(sections.productAssembly, displayId),
            availability: buildSection(sections.availability, displayId),
            saleability: buildSection(sections.saleability, displayId),
            associatedRules: buildSection(sections.associatedRules, displayId),
          },
        },
      };
    }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_RECENT_SEARCH': {
      const filtered = state.recentSearches.filter(
        (search) => search.displayId !== action.payload.displayId
      );
      const next = [action.payload, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveSearches(next);
      return { ...state, recentSearches: next };
    }
    case 'OPEN_RECENT_SEARCHES':
      return { ...state, shouldShowRecentSearches: true };
    case 'CLOSE_RECENT_SEARCHES':
      return { ...state, shouldShowRecentSearches: false };
  }
};
