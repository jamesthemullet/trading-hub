import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  type FeatureFlags,
  useAuthorizationFlag,
  useOneTrustFlag,
} from './feature-flag';

describe('useAuthorizationFlag', () => {
  it('should return the default feature flags', () => {
    const { result } = renderHook(() => useAuthorizationFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(false);
  });
});

describe('useOneTrustFlag', () => {
  it('should return false when OneTrust feature flag is disabled by default', () => {
    const { result } = renderHook(() => useOneTrustFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(false);
  });

  it('should return true when OneTrust feature flag is enabled', () => {
    const enabledFeatureFlags: FeatureFlags = {
      ...defaultFeatureFlags,
      oneTrust: true,
    };

    const { result } = renderHook(() => useOneTrustFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={enabledFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(true);
  });
});
