import type {
  BetaMerchandisingProductDiagnosticsListData,
  MerchandisingCountryCode,
} from '@/libs/api/generated/open-api';
import type {
  OperationalStatusVariant,
  ProductStatusVariant,
} from '@/libs/components/status-badge/status-badge';

import type {
  DetailItem,
  Product,
  Section,
  SectionStatus,
} from './use-product-details';
import { getProductDetails } from './use-product-details';

export type SectionWithLabel<T> = Section<T> & { statusLabel: string };

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
};

export type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_MARKET'; payload: MerchandisingCountryCode }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: BetaMerchandisingProductDiagnosticsListData;
      submittedQuery: string;
    }
  | { type: 'FETCH_ERROR'; payload: string };

export const initialState: State = {
  query: '',
  market: 'UK',
  productDisplay: null,
  isLoading: false,
  error: '',
};

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
            productAssembly: {
              ...sections.productAssembly,
              statusLabel: getStatusLabel(sections.productAssembly.status),
            },
            availability: {
              ...sections.availability,
              statusLabel: getStatusLabel(sections.availability.status),
            },
            saleability: {
              ...sections.saleability,
              statusLabel: getStatusLabel(sections.saleability.status),
            },
            associatedRules: {
              ...sections.associatedRules,
              statusLabel: getStatusLabel(sections.associatedRules.status),
            },
          },
        },
      };
    }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
  }
};
