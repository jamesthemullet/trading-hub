import { createContext } from 'react';

export type FeatureFlags = {
  hasIreland: boolean;
  hasMultipleCategories: boolean;
};

export const FeatureFlagContext = createContext<FeatureFlags>({
  hasIreland: false,
  hasMultipleCategories: false,
});
