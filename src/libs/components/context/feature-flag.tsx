import { createContext, useContext, useEffect, useState } from 'react';

export type FeatureFlags = {
  hasAuthorization: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  hasAuthorization: false,
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
