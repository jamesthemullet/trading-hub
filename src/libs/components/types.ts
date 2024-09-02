import {
  AlphanumericBoostBury,
  AlphanumericBoostBuryField,
  AttributeType,
  IncludeExclude,
  NumericBoostBury,
} from '../api';

export type EditProduct = {
  change: 'add' | 'remove' | 'modify';
  operation: 'boosts' | 'buries' | 'block';
};

export type RulesetAttribute = {
  attribute: {
    fields?: Array<AlphanumericBoostBuryField>;
    weight?: number;
    field?: string;
  };
  change: 'add' | 'remove' | 'modify';
  operation: 'boosts' | 'buries' | 'includes' | 'excludes';
  type: AttributeType;
  index?: number;
};

export type EditAttribute = {
  attribute: AlphanumericBoostBury | NumericBoostBury;
  change: 'add' | 'remove' | 'modify';
  operation: 'boosts' | 'buries';
  type: AttributeType;
  index?: number;
};

export type EditIncludeExcludeAttribute = {
  attribute: IncludeExclude;
  change: 'add' | 'remove' | 'modify';
  operation: 'includes' | 'excludes';
  index?: number;
};
