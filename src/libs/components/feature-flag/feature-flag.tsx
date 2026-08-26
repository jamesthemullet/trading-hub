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
  hasOptimisticLocking: boolean;
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
  hasOptimisticLocking: false,
};

export const FeatureFlagContext =
  createContext<FeatureFlags>(defaultFeatureFlags);

export const useAuthorizationFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [authorizationEnabled, setAuthorizationEnabled] = useState(false);

  useEffect(() => {
    setAuthorizationEnabled(featureFlags.hasAuthorization);
  }, [featureFlags.hasAuthorization]);

  return authorizationEnabled;
};

export const useAuthorizationRoleOverride = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [authorizationRoleOverride, setAuthorizationRoleOverride] = useState(
    featureFlags.authorizationRoleOverride
  );

  useEffect(() => {
    setAuthorizationRoleOverride(featureFlags.authorizationRoleOverride);
  }, [featureFlags.authorizationRoleOverride]);

  return authorizationRoleOverride;
};

export const useProfilePageFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [profilePageEnabled, setProfilePageEnabled] = useState(false);

  useEffect(() => {
    setProfilePageEnabled(featureFlags.hasProfilePage);
  }, [featureFlags.hasProfilePage]);

  return profilePageEnabled;
};

export const useFavouriteRulesetsFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [favouriteRulesetsEnabled, setFavouriteRulesetsEnabled] =
    useState(false);

  useEffect(() => {
    setFavouriteRulesetsEnabled(featureFlags.hasFavouriteRulesets);
  }, [featureFlags.hasFavouriteRulesets]);

  return favouriteRulesetsEnabled;
};

export const useOptimisticLockingFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [isOptimisticLockingEnabled, setIsOptimisticLockingEnabled] = useState(
    featureFlags.hasOptimisticLocking
  );

  useEffect(() => {
    setIsOptimisticLockingEnabled(featureFlags.hasOptimisticLocking);
  }, [featureFlags.hasOptimisticLocking]);

  return isOptimisticLockingEnabled;
};
