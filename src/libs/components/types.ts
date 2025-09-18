import type {
  HttpResponse,
  MerchandisingAlphanumericBoostBury,
  MerchandisingAlphanumericBoostBuryField,
  MerchandisingAttributeType,
  MerchandisingCountryCode,
  MerchandisingErrorResponse,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingPagination,
  MerchandisingReturnedNotFound,
} from '../api';
import type { FacetDisplayType } from '../modules/facets/facets';

export type RulesetAttribute = {
  attribute: {
    fields?: Array<MerchandisingAlphanumericBoostBuryField>;
    weight?: number;
    field?: string;
  };
  change: 'add' | 'remove' | 'modify';
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  type: MerchandisingAttributeType;
  index?: number;
};

type Change = 'add' | 'modify' | 'remove';

type ProductPayload = {
  operation: 'pin' | 'boost' | 'bury' | 'block' | 'include' | 'exclude' | 'all';
  change: Change;
  ids: string[];
  position?: number;
};

type MerchandisingNumericAttributePayload = {
  operation: 'boost' | 'bury';
  change: Change;
  index: number;
  data: MerchandisingNumericBoostBury;
};

type MerchandisingAlphanumericBoostBuryAttributePayload = {
  operation: 'boost' | 'bury';
  change: Change;
  index: number;
  data: MerchandisingAlphanumericBoostBury;
};

export type NumericAttributeEdit = {
  field: MerchandisingNumericBoostBury;
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'numericBoostBury';
};
export type MerchandisingAlphanumericBoostBuryAttributeEdit = {
  fields: MerchandisingAlphanumericBoostBuryField[];
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'alphanumericBoostBury';
};
export type MerchandisingAlphanumericIncludeExcludeAttributeEdit = {
  fields: MerchandisingAlphanumericBoostBuryField[];
  index: number;
  operation: 'include' | 'exclude';
  type: 'alphanumericIncludeExclude';
};
export type AttributeEdit =
  | NumericAttributeEdit
  | MerchandisingAlphanumericBoostBuryAttributeEdit
  | MerchandisingAlphanumericIncludeExcludeAttributeEdit;

type MerchandisingAlphanumericIncludeExcludeAttributePayload = {
  operation: 'include' | 'exclude';
  change: Change;
  index: number;
  data: MerchandisingIncludeExclude;
};

type DateValue = Date | null;

type DateTime = {
  dateTime: Array<DateValue>;
};

export type RuleSetActions =
  | {
      type: 'product';
      payload: ProductPayload;
    }
  | { type: 'numericAttribute'; payload: MerchandisingNumericAttributePayload }
  | {
      type: 'alphanumericBoostBuryAttribute';
      payload: MerchandisingAlphanumericBoostBuryAttributePayload;
    }
  | {
      type: 'alphanumericIncludeExcludeAttribute';
      payload: MerchandisingAlphanumericIncludeExcludeAttributePayload;
    }
  | {
      type: 'dateTime';
      payload: DateTime;
    }
  | {
      type: 'changeCountry';
      payload: MerchandisingCountryCode;
    }
  | {
      type: 'facetChangeDisplayType';
      payload: {
        oldType: FacetDisplayType;
        newType: FacetDisplayType;
        id: string;
      };
    }
  | {
      type: 'facetChangePosition';
      payload: {
        id: string;
        position: number;
      };
    }
  | {
      type: 'facetUpdateValues';
      payload: {
        id: string;
        boosted: string[];
        excludedValues: string[];
      };
    };

export type Row = {
  id: string;
  identifier: string;
  isEnabled: boolean;
  lastChanged: {
    /** @format date-time */
    date: string;
    user: string;
  };
  url: string;
  categoryPlpUrl?: string | undefined;
  startDate?: string;
  endDate?: string;
  countryCode?: string;
};

export type GetRowsFn = (
  currentPage: number,
  currentPageSize: number,
  query: string,
  countryCode?: MerchandisingCountryCode
) => Promise<void>;
export type DeleteRowFn = (row: { id: string }) => Promise<void>;
export type CreateRowFn = (
  path: string,
  newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new'
) => Promise<void>;
export type DuplicateRowFn = (id: string) => Promise<void>;
export type ToggleRowFn = (row: { id: string }) => Promise<void>;

export type RuleSetMapping<A, T, N> = {
  getEmptyRuleSet?: () => N;
  queryAllRuleSets: (query: {
    countryCode?: MerchandisingCountryCode;
    q?: string;
    rows: number;
    start: number;
  }) => Promise<HttpResponse<A, void | MerchandisingErrorResponse>>;
  deleteRuleSetById: (
    id: string
  ) => Promise<
    HttpResponse<
      T,
      void | MerchandisingErrorResponse | MerchandisingReturnedNotFound
    >
  >;
  queryRuleSetById: (
    id: string
  ) => Promise<
    HttpResponse<
      T,
      void | MerchandisingErrorResponse | MerchandisingReturnedNotFound
    >
  >;
  updateRuleSetById: (
    id: string,
    data: N
  ) => Promise<HttpResponse<T, void | MerchandisingErrorResponse>>;
  newRuleSet: (
    data: N
  ) => Promise<HttpResponse<T, void | MerchandisingErrorResponse>>;
  ruleSetToRow: (
    ruleSet: T,
    context: { searchQuery?: string; featureFlags?: object }
  ) => Row;
  allToArray: (data: A) => T[];
  returnedToRuleSet: (data: T) => N;
};

export type RowsApi = {
  createNewRow: CreateRowFn;
  getRows: GetRowsFn;
  deleteRow: DeleteRowFn;
  duplicateRow: DuplicateRowFn;
  toggleRow: ToggleRowFn;
  error: string;
  isLoading: boolean;
  rowsState: {
    rows: Row[];
    pagination: MerchandisingPagination;
  };
};
