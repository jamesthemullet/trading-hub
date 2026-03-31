import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  useAuthorizationFlag,
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
