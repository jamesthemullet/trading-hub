import { createContext, useContext, useEffect, useState } from 'react';

type CatRoleOverride = 'No Override' | '' | 'Cat.R' | 'Cat.W';
type SearchRoleOverride = 'No Override' | '' | 'Search.R' | 'Search.W';
type GlobalRoleOverride = 'No Override' | '' | 'Glob.R' | 'Glob.W';

type AuthorizationRoleOverride = {
  catOverride: CatRoleOverride;
  searchOverride: SearchRoleOverride;
  globalOverride: GlobalRoleOverride;
};

export type StickyBarVariant = 'variant-a' | 'variant-b';

export type FeatureFlags = {
  hasAuthorization: boolean;
  authorizationRoleOverride: AuthorizationRoleOverride;
  hasStickyBar: boolean;
  stickyBarVariant: StickyBarVariant;
  hasUndoButton: boolean;
  hasProfilePage: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasAuthorization: false,
  authorizationRoleOverride: {
    catOverride: 'No Override',
    searchOverride: 'No Override',
    globalOverride: 'No Override',
  },
  hasStickyBar: false,
  stickyBarVariant: 'variant-a',
  hasUndoButton: false,
  hasProfilePage: false,
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

export const useStickyBarFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [stickyBarEnabled, setStickyBarEnabled] = useState(false);
  const [stickyBarVariant, setStickyBarVariant] = useState<StickyBarVariant>(
    featureFlags.stickyBarVariant
  );

  useEffect(() => {
    setStickyBarEnabled(featureFlags.hasStickyBar);
  }, [featureFlags.hasStickyBar]);

  useEffect(() => {
    setStickyBarVariant(featureFlags.stickyBarVariant);
  }, [featureFlags.stickyBarVariant]);

  return { stickyBarEnabled, stickyBarVariant };
};

export const useUndoButtonFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [undoButtonEnabled, setUndoButtonEnabled] = useState(false);

  useEffect(() => {
    setUndoButtonEnabled(featureFlags.hasUndoButton);
  }, [featureFlags.hasUndoButton]);

  return undoButtonEnabled;
};

export const useProfilePageFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [profilePageEnabled, setProfilePageEnabled] = useState(false);

  useEffect(() => {
    setProfilePageEnabled(featureFlags.hasProfilePage);
  }, [featureFlags.hasProfilePage]);

  return profilePageEnabled;
};
