import type {
  AlphanumericBoostBury,
  AlphanumericBoostBuryField,
  AttributeType,
  CountryCode,
  ErrorResponse,
  HttpResponse,
  IncludeExclude,
  NumericBoostBury,
  Pagination,
  ReturnedNotFound,
} from '../api';

export type RulesetAttribute = {
  attribute: {
    fields?: Array<AlphanumericBoostBuryField>;
    weight?: number;
    field?: string;
  };
  change: 'add' | 'remove' | 'modify';
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  type: AttributeType;
  index?: number;
};

type Change = 'add' | 'modify' | 'remove';

type ProductPayload = {
  operation: 'pin' | 'boost' | 'bury' | 'block' | 'include' | 'exclude' | 'all';
  change: Change;
  ids: string[];
  position?: number;
};

type NumericAttributePayload = {
  operation: 'boost' | 'bury';
  change: Change;
  index: number;
  data: NumericBoostBury;
};

type AlphanumericBoostBuryAttributePayload = {
  operation: 'boost' | 'bury';
  change: Change;
  index: number;
  data: AlphanumericBoostBury;
};

export type NumericAttributeEdit = {
  field: NumericBoostBury;
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'numericBoostBury';
};
export type AlphanumericBoostBuryAttributeEdit = {
  fields: AlphanumericBoostBuryField[];
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'alphanumericBoostBury';
};
export type AlphanumericIncludeExcludeAttributeEdit = {
  fields: AlphanumericBoostBuryField[];
  index: number;
  operation: 'include' | 'exclude';
  type: 'alphanumericIncludeExclude';
};
export type AttributeEdit =
  | NumericAttributeEdit
  | AlphanumericBoostBuryAttributeEdit
  | AlphanumericIncludeExcludeAttributeEdit;

type AlphanumericIncludeExcludeAttributePayload = {
  operation: 'include' | 'exclude';
  change: Change;
  index: number;
  data: IncludeExclude;
};

type DateValue = Date | null;

type DateTime = {
  dateTime: Array<DateValue>;
};

export type Action =
  | {
      type: 'product';
      payload: ProductPayload;
    }
  | { type: 'numericAttribute'; payload: NumericAttributePayload }
  | {
      type: 'alphanumericBoostBuryAttribute';
      payload: AlphanumericBoostBuryAttributePayload;
    }
  | {
      type: 'alphanumericIncludeExcludeAttribute';
      payload: AlphanumericIncludeExcludeAttributePayload;
    }
  | {
      type: 'dateTime';
      payload: DateTime;
    }
  | {
      type: 'changeCountry';
      payload: CountryCode;
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
  countryCode?: CountryCode
) => Promise<void>;
export type DeleteRowFn = (row: { id: string }) => Promise<void>;
export type CreateRowFn = (
  newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new'
) => Promise<void>;
export type DuplicateRowFn = (id: string) => Promise<void>;
export type ToggleRowFn = (row: { id: string }) => Promise<void>;

export type RuleSetMapping<A, T, N> = {
  getEmptyRuleSet: () => N;
  queryAllRuleSets: (query: {
    countryCode?: CountryCode;
    q?: string;
    rows: number;
    start: number;
  }) => Promise<HttpResponse<A, void | ErrorResponse>>;
  deleteRuleSetById: (
    id: string
  ) => Promise<HttpResponse<T, void | ErrorResponse | ReturnedNotFound>>;
  queryRuleSetById: (
    id: string
  ) => Promise<HttpResponse<T, void | ErrorResponse | ReturnedNotFound>>;
  updateRuleSetById: (
    id: string,
    data: N
  ) => Promise<HttpResponse<T, void | ErrorResponse>>;
  newRuleSet: (data: N) => Promise<HttpResponse<T, void | ErrorResponse>>;
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
    pagination: Pagination;
  };
};
