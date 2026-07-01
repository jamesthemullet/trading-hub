import type { MerchandisingRuleSetFacetConfigWithId } from '@/libs/api';

export const UNDO_HISTORY_LIMIT = 50;

export const appendUndoState = (
  history: MerchandisingRuleSetFacetConfigWithId[],
  state: MerchandisingRuleSetFacetConfigWithId
): MerchandisingRuleSetFacetConfigWithId[] => {
  const nextHistory = [...history, state];

  return nextHistory.length > UNDO_HISTORY_LIMIT
    ? nextHistory.slice(-UNDO_HISTORY_LIMIT)
    : nextHistory;
};
