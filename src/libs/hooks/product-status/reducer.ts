import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';
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

type SectionWithLabel<T> = Section<T> & { statusLabel: string };

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
  productDisplay: ProductDisplay | null;
  isLoading: boolean;
  error: string;
};

export type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: BetaMerchandisingProductDiagnosticsListData;
      submittedQuery: string;
    }
  | { type: 'FETCH_ERROR'; payload: string };

export const initialState: State = {
  query: '',
  productDisplay: null,
  isLoading: false,
  error: '',
};

const getAssemblyStatusLabel = (status: SectionStatus): string => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'issue-detected':
      return 'Issue detected';
    case 'blocked':
      return 'Blocked';
    /* istanbul ignore next */
    case 'waiting':
      return 'Waiting for push';
    case 'push-available':
      return 'Push available';
  }
};

const getSectionStatusLabel = (status: SectionStatus): string => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'issue-detected':
      return 'Issue detected';
    case 'blocked':
      return 'Blocked by an issue';
    /* istanbul ignore next */
    case 'push-available':
      return 'Push available';
    case 'waiting':
      return 'Waiting for push';
  }
};

const getMainStatus = (
  status: SectionStatus,
  issueCount: number
): {
  mainStatusLabel: string;
  mainStatusVariant: ProductStatusVariant | OperationalStatusVariant;
} => {
  switch (status) {
    case 'operational':
      return {
        mainStatusLabel: 'Product is operational',
        mainStatusVariant: 'product-operational',
      };
    case 'issue-detected':
    case 'blocked':
      return {
        mainStatusLabel: `${issueCount} issue${issueCount !== 1 ? 's' : ''} detected`,
        mainStatusVariant: 'error',
      };
    case 'push-available':
      return {
        mainStatusLabel: 'Emergency push available',
        mainStatusVariant: 'emergency',
      };
    /* istanbul ignore next */
    default:
      return {
        mainStatusLabel: '',
        mainStatusVariant: '' as
          | ProductStatusVariant
          | OperationalStatusVariant,
      };
  }
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'FETCH_START':
      return { ...state, productDisplay: null, isLoading: true, error: '' };
    case 'FETCH_SUCCESS': {
      const { isIndexed, product, sections } = getProductDetails(
        action.payload
      );
      const { mainStatusLabel, mainStatusVariant } = getMainStatus(
        sections.productAssembly.status,
        action.payload.issues.length
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
              statusLabel: getAssemblyStatusLabel(
                sections.productAssembly.status
              ),
            },
            availability: {
              ...sections.availability,
              statusLabel: getSectionStatusLabel(sections.availability.status),
            },
            saleability: {
              ...sections.saleability,
              statusLabel: getSectionStatusLabel(sections.saleability.status),
            },
            associatedRules: {
              ...sections.associatedRules,
              statusLabel: getSectionStatusLabel(
                sections.associatedRules.status
              ),
            },
          },
        },
      };
    }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
  }
};
