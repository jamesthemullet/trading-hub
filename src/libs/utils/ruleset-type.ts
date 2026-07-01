import { RuleType } from '@/libs/constants/rule-types';

export type RulesetTypeString = 'category' | 'search' | 'redirect' | 'global';

export const VALID_RULESET_TYPES: readonly RulesetTypeString[] = [
  'category',
  'search',
  'global',
  'redirect',
];

export const isValidRulesetType = (
  value: unknown
): value is RulesetTypeString =>
  typeof value === 'string' &&
  VALID_RULESET_TYPES.some((rulesetType) => rulesetType === value);

export const getRulesetType = (ruleType: RuleType): RulesetTypeString => {
  const typeMap: Record<RuleType, RulesetTypeString> = {
    [RuleType.CategoryRanking]: 'category',
    [RuleType.SearchRanking]: 'search',
    [RuleType.Redirect]: 'redirect',
    [RuleType.Global]: 'global',
  };
  return typeMap[ruleType];
};
