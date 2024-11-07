import {
  AlphanumericBoostBury,
  AlphanumericBoostBuryField,
  AttributeType,
  CountryCode,
  IncludeExclude,
  NumericBoostBury,
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

type Change = 'add' | 'remove' | 'modify';

type ProductPayload = {
  operation: 'pin' | 'boost' | 'bury' | 'block' | 'include' | 'exclude';
  change: Change;
  id: string;
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
