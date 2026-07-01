import { RuleType } from '@/libs/constants/rule-types';

import {
  getRulesetType,
  isValidRulesetType,
  VALID_RULESET_TYPES,
} from './ruleset-type';

describe('ruleset-type utils', () => {
  describe('getRulesetType', () => {
    it('should return "category" for CategoryRanking', () => {
      expect(getRulesetType(RuleType.CategoryRanking)).toBe('category');
    });

    it('should return "search" for SearchRanking', () => {
      expect(getRulesetType(RuleType.SearchRanking)).toBe('search');
    });

    it('should return "redirect" for Redirect', () => {
      expect(getRulesetType(RuleType.Redirect)).toBe('redirect');
    });

    it('should return "global" for Global', () => {
      expect(getRulesetType(RuleType.Global)).toBe('global');
    });
  });

  describe('VALID_RULESET_TYPES', () => {
    it('should contain all valid ruleset type strings', () => {
      expect(VALID_RULESET_TYPES).toEqual([
        'category',
        'search',
        'global',
        'redirect',
      ]);
    });
  });

  describe('isValidRulesetType', () => {
    it('should return true for valid ruleset types', () => {
      expect(isValidRulesetType('category')).toBe(true);
      expect(isValidRulesetType('search')).toBe(true);
      expect(isValidRulesetType('global')).toBe(true);
      expect(isValidRulesetType('redirect')).toBe(true);
    });

    it('should return false for invalid ruleset types', () => {
      expect(isValidRulesetType('invalid')).toBe(false);
      expect(isValidRulesetType('')).toBe(false);
      expect(isValidRulesetType(null)).toBe(false);
      expect(isValidRulesetType(undefined)).toBe(false);
    });
  });
});
