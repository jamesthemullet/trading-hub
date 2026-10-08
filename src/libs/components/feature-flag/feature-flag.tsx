import { createContext, useContext, useEffect, useState } from 'react';

export type FeatureFlags = {
  hasProfilePage: boolean;
  hasFavouriteRulesets: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasProfilePage: false,
  hasFavouriteRulesets: false,
};

export const FeatureFlagContext =
  createContext<FeatureFlags>(defaultFeatureFlags);

export const useProfilePageFlag = (): boolean => {
  const featureFlags = useContext(FeatureFlagContext);
  const [isProfilePageEnabled, setIsProfilePageEnabled] = useState(false);

  useEffect(() => {
    setIsProfilePageEnabled(featureFlags.hasProfilePage);
  }, [featureFlags.hasProfilePage]);

  return isProfilePageEnabled;
};

export const useFavouriteRulesetsFlag = (): boolean => {
  const featureFlags = useContext(FeatureFlagContext);
  const [isFavouriteRulesetsEnabled, setIsFavouriteRulesetsEnabled] =
    useState(false);

  useEffect(() => {
    setIsFavouriteRulesetsEnabled(featureFlags.hasFavouriteRulesets);
  }, [featureFlags.hasFavouriteRulesets]);

  return isFavouriteRulesetsEnabled;
};
