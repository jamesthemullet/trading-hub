import { createContext, useContext, useEffect, useState } from 'react';

export type CatRoleOverride = 'No Override' | '' | 'Cat.R' | 'Cat.W';
export type SearchRoleOverride = 'No Override' | '' | 'Search.R' | 'Search.W';
export type GlobalRoleOverride = 'No Override' | '' | 'Glob.R' | 'Glob.W';

export type AuthorizationRoleOverride = {
  catOverride: CatRoleOverride;
  searchOverride: SearchRoleOverride;
  globalOverride: GlobalRoleOverride;
};

export type FeatureFlags = {
  hasAuthorization: boolean;
  authorizationRoleOverride: AuthorizationRoleOverride;
  oneTrust: boolean;
  showNewFacetValuesPage: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasAuthorization: false,
  authorizationRoleOverride: {
    catOverride: 'No Override',
    searchOverride: 'No Override',
    globalOverride: 'No Override',
  },
  oneTrust: false,
  showNewFacetValuesPage: false,
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

export const useOneTrustFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [oneTrustEnabled, setOneTrustEnabled] = useState(false);

  useEffect(() => {
    setOneTrustEnabled(featureFlags.oneTrust);
  }, [featureFlags.oneTrust]);

  return oneTrustEnabled;
};

export const useShowNewFacetValuesPage = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [showNewFacetValuesPage, setShowNewFacetValuesPage] = useState(false);

  useEffect(() => {
    setShowNewFacetValuesPage(featureFlags.showNewFacetValuesPage);
  }, [featureFlags.showNewFacetValuesPage]);

  return showNewFacetValuesPage;
};
