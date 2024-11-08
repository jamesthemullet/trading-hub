import { createContext, useContext, useEffect, useState } from 'react';

export type FeatureFlags = {
  hasIreland: boolean;
  hasMultipleCategories: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasIreland: false,
  hasMultipleCategories: false,
};

export const FeatureFlagContext =
  createContext<FeatureFlags>(defaultFeatureFlags);

export const useIrelandFeatureFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [countryCodeEnabled, setCountryCodeEnabled] = useState(false);

  useEffect(() => {
    setCountryCodeEnabled(featureFlags.hasIreland);
  }, [featureFlags.hasIreland]);

  return countryCodeEnabled;
};
