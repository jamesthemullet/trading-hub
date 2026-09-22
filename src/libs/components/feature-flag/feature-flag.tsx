import { createContext, useContext, useEffect, useState } from 'react';

type CatRoleOverride = 'No Override' | '' | 'Cat.R' | 'Cat.W';
type SearchRoleOverride = 'No Override' | '' | 'Search.R' | 'Search.W';
type GlobalRoleOverride = 'No Override' | '' | 'Glob.R' | 'Glob.W';

type AuthorizationRoleOverride = {
  catOverride: CatRoleOverride;
  searchOverride: SearchRoleOverride;
  globalOverride: GlobalRoleOverride;
};

export type FeatureFlags = {
  hasAuthorization: boolean;
  authorizationRoleOverride: AuthorizationRoleOverride;
  hasProfilePage: boolean;
  hasFavouriteRulesets: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasAuthorization: false,
  authorizationRoleOverride: {
    catOverride: 'No Override',
    searchOverride: 'No Override',
    globalOverride: 'No Override',
  },
  hasProfilePage: false,
  hasFavouriteRulesets: false,
};

export const FeatureFlagContext =
  createContext<FeatureFlags>(defaultFeatureFlags);

export const useAuthorizationFlag = (): boolean => {
  const featureFlags = useContext(FeatureFlagContext);
  const [isAuthorizationEnabled, setIsAuthorizationEnabled] = useState(false);

  useEffect(() => {
    setIsAuthorizationEnabled(featureFlags.hasAuthorization);
  }, [featureFlags.hasAuthorization]);

  return isAuthorizationEnabled;
};

export const useAuthorizationRoleOverride = (): AuthorizationRoleOverride => {
  const featureFlags = useContext(FeatureFlagContext);
  const [authorizationRoleOverride, setAuthorizationRoleOverride] = useState(
    featureFlags.authorizationRoleOverride
  );

  useEffect(() => {
    setAuthorizationRoleOverride(featureFlags.authorizationRoleOverride);
  }, [featureFlags.authorizationRoleOverride]);

  return authorizationRoleOverride;
};

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
