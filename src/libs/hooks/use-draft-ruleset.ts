import { useCallback } from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';

export const DRAFT_RULESET_SESSION_KEY = 'draftRuleset';

type DraftBaseRuleset = {
  timestamp: number;
};
export type DraftSearchRuleset = DraftBaseRuleset & {
  ruleset: MerchandisingRuleSet & {
    searchTerms: string[];
  };
  type: 'search';
};
export type DraftCategoryRuleset = DraftBaseRuleset & {
  ruleset: MerchandisingRuleSet & {
    categoryIds: string[];
  };
  type: 'category';
};

export type DraftRulesetState = DraftSearchRuleset | DraftCategoryRuleset;

export const useDraftRuleset = () => {
  const saveDraft = useCallback(
    ({ ruleset, type }: Omit<DraftRulesetState, 'timestamp'>) => {
      const draftState = {
        ruleset,
        type,
        timestamp: Date.now(),
      };

      try {
        // istanbul ignore else
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            DRAFT_RULESET_SESSION_KEY,
            JSON.stringify(draftState)
          );
        }
      } catch (error) {
        console.error('Failed to save draft ruleset:', error);
      }
    },
    []
  );

  const getDraft = useCallback((): DraftRulesetState | null => {
    try {
      // istanbul ignore else
      if (typeof window !== 'undefined') {
        const draft = sessionStorage.getItem(DRAFT_RULESET_SESSION_KEY);
        return draft ? JSON.parse(draft) : null;
      }
    } catch (error) {
      console.error('Failed to get draft ruleset:', error);
    }
    return null;
  }, []);

  const clearDraft = useCallback(() => {
    try {
      // istanbul ignore else
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(DRAFT_RULESET_SESSION_KEY);
      }
    } catch (error) {
      console.error('Failed to clear draft ruleset:', error);
    }
  }, []);

  const isDraftRuleset = useCallback(
    (ruleSetId?: string): boolean => {
      if (ruleSetId) {
        return false;
      }
      const draft = getDraft();
      return draft !== null;
    },
    [getDraft]
  );

  return {
    saveDraft,
    getDraft,
    clearDraft,
    isDraftRuleset,
  };
};
