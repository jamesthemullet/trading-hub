import { createContext, useContext, useEffect, useState } from 'react';

export type FeatureFlags = {
  hasAuthorization: boolean;
  hasBulkActions: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasAuthorization: false,
  hasBulkActions: false,
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

export const useBulkActionsFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false);

  useEffect(() => {
    setBulkActionsEnabled(featureFlags.hasBulkActions);
  }, [featureFlags.hasBulkActions]);

  return bulkActionsEnabled;
};
