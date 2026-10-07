import type {
  GetCategoryRuleSetsParamsHavingRulesEnum,
  HttpResponse,
  MerchandisingAlphanumericBoostBury,
  MerchandisingAlphanumericBoostBuryField,
  MerchandisingCountryCode,
  MerchandisingErrorResponse,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingPagination,
  MerchandisingReturnedNotFound,
  MerchandisingRuleSet,
} from '../api';
import type { FacetDisplayType } from '../containers/facets/facet-row';

type RulesetAttributeChange = {
  change: 'add' | 'remove' | 'modify';
  index?: number;
};

export type RulesetAttribute = RulesetAttributeChange &
  (
    | {
        attribute: MerchandisingNumericBoostBury;
        operation: 'boost' | 'bury';
        type: 'numeric';
      }
    | {
        attribute: MerchandisingAlphanumericBoostBury;
        operation: 'boost' | 'bury';
        type: 'alphanumeric';
      }
    | {
        attribute: MerchandisingIncludeExclude;
        operation: 'include' | 'exclude';
        type: 'alphanumeric';
      }
  );

type Change = 'add' | 'modify' | 'remove';

type ProductPayload = {
  operation: 'pin' | 'boost' | 'bury' | 'block' | 'include' | 'exclude' | 'all';
  change: Change;
  ids: string[];
  position?: number;
  weight?: number;
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

type NumericAttributeEdit = {
  field: MerchandisingNumericBoostBury;
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'numericBoostBury';
};

type MerchandisingAlphanumericBoostBuryAttributeEdit = {
  fields: MerchandisingAlphanumericBoostBuryField[];
  weight: number;
  index: number;
  operation: 'boost' | 'bury';
  type: 'alphanumericBoostBury';
};

type MerchandisingAlphanumericIncludeExcludeAttributeEdit = {
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
      type: 'loadRuleset';
      payload: MerchandisingRuleSet;
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

export type RuleTypeFilter = GetCategoryRuleSetsParamsHavingRulesEnum;

export type GetRowsFn = (
  currentPage: number,
  currentPageSize: number,
  query: string,
  countryCode?: MerchandisingCountryCode,
  havingRules?: RuleTypeFilter
) => Promise<void>;
export type DeleteRowFn = (row: { id: string }) => Promise<boolean>;
export type DuplicateRowFn = (id: string) => Promise<void>;
export type ToggleRowFn = (row: { id: string }) => Promise<void>;

/**
 * Adapts a rule-set API (category/keyword/global/redirect) to the shared
 * table-panel + rows-state hooks. Each rule-set type plugs in its own
 * concrete types for the 4 generics below - this type itself has no
 * knowledge of what a "ruleset" is, only how the pieces relate.
 *
 * - `RuleSetListResponse` - the paginated response returned by the list
 *   endpoint, e.g. `MerchandisingReturnedGlobalRuleSetsLite`.
 * - `ReturnedRuleSet` - a single ruleset as returned by the detail/create/
 *   update endpoints, e.g. `MerchandisingReturnedGlobalRuleSet`.
 * - `RuleSetPayload` - the request body shape sent to create/update, e.g.
 *   `MerchandisingRuleSet`.
 * - `RuleSetListItem` - the shape of each item inside `RuleSetListResponse`,
 *   consumed by `ruleSetToRow`. Usually identical to `ReturnedRuleSet` (and
 *   defaults to it), but some list endpoints (e.g. global rulesets) return a
 *   slimmer "lite" item than the full detail type, so callers can override
 *   it, e.g. `MerchandisingReturnedGlobalRuleSetLite`.
 */
export type RuleSetMapping<
  RuleSetListResponse,
  ReturnedRuleSet extends RuleSetListItem,
  RuleSetPayload,
  RuleSetListItem = ReturnedRuleSet,
> = {
  getEmptyRuleSet?: () => RuleSetPayload;
  queryAllRuleSets: (query: {
    countryCode?: MerchandisingCountryCode;
    havingRules?: RuleTypeFilter;
    q?: string;
    rows: number;
    start: number;
  }) => Promise<
    HttpResponse<RuleSetListResponse, void | MerchandisingErrorResponse>
  >;
  deleteRuleSetById: (
    id: string
  ) => Promise<
    HttpResponse<
      ReturnedRuleSet,
      void | MerchandisingErrorResponse | MerchandisingReturnedNotFound
    >
  >;
  queryRuleSetById: (
    id: string
  ) => Promise<
    HttpResponse<
      ReturnedRuleSet,
      void | MerchandisingErrorResponse | MerchandisingReturnedNotFound
    >
  >;
  updateRuleSetById: (
    id: string,
    data: RuleSetPayload
  ) => Promise<
    HttpResponse<ReturnedRuleSet, void | MerchandisingErrorResponse>
  >;
  newRuleSet: (
    data: RuleSetPayload
  ) => Promise<
    HttpResponse<ReturnedRuleSet, void | MerchandisingErrorResponse>
  >;
  ruleSetToRow: (
    ruleSet: RuleSetListItem,
    context: { searchQuery?: string; featureFlags?: object }
  ) => Row;
  allToArray: (data: RuleSetListResponse) => RuleSetListItem[];
  returnedToRuleSet: (data: ReturnedRuleSet) => RuleSetPayload;
};

export type RowsApi = {
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

export const isBoostOrBury = (
  operation: RulesetAttribute['operation']
): operation is 'boost' | 'bury' =>
  operation === 'boost' || operation === 'bury';

export const isBoostOrBuryAttribute = (
  attribute: RulesetAttribute
): attribute is Extract<RulesetAttribute, { operation: 'boost' | 'bury' }> =>
  isBoostOrBury(attribute.operation);
