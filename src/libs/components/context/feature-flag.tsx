import { createContext } from 'react';

export const FeatureFlagContext = createContext({
  hasIreland: false,
  hasMultipleCategories: false,
});
