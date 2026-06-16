import { useEffect } from 'react';

import { saveRulesetVisit } from './use-most-viewed-rulesets';
import type { RulesetType } from './use-recently-viewed-rulesets';
import { saveRecentlyViewed } from './use-recently-viewed-rulesets';

export const useTrackRecentlyViewed = ({
  id,
  label,
  url,
  type,
}: {
  id: string | undefined;
  label: string | undefined;
  url: string;
  type: RulesetType;
}): void => {
  useEffect(() => {
    if (!id || !label) return;
    saveRecentlyViewed({ id, label, url, type, viewedAt: Date.now() });
    saveRulesetVisit({ id, label, url, type });
  }, [id, label, url, type]);
};
