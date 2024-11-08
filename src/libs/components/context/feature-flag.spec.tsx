import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  useIrelandFeatureFlag,
} from './feature-flag';

describe('useIrelandFeatureFlag', () => {
  it('should return the default feature flags', () => {
    const { result } = renderHook(() => useIrelandFeatureFlag(), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(false);
  });
});
