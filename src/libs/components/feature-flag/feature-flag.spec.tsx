import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  useAuthorizationFlag,
  useProfilePageFlag,
  useStickyBarFlag,
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

describe('useStickyBarFlag', () => {
  it('should return defaults when flag is off', () => {
    const { result } = renderHook(() => useStickyBarFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current.stickyBarEnabled).toBe(false);
    expect(result.current.stickyBarVariant).toBe('variant-a');
  });

  it('should return enabled state and variant when flag is on', () => {
    const { result } = renderHook(() => useStickyBarFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasStickyBar: true,
            stickyBarVariant: 'variant-b',
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current.stickyBarEnabled).toBe(true);
    expect(result.current.stickyBarVariant).toBe('variant-b');
  });
});

describe('useProfilePageFlag', () => {
  it('should return false by default', () => {
    const { result } = renderHook(() => useProfilePageFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(false);
  });

  it('should return true when flag is enabled', () => {
    const { result } = renderHook(() => useProfilePageFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider
          value={{ ...defaultFeatureFlags, hasProfilePage: true }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(true);
  });
});
