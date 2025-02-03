import { renderHook } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
} from '../components/context/feature-flag';
import { useAccess } from './use-access';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Cat.W'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });
  });

  it('should return hasReadAccess=true and hasWriteAccess=true', () => {
    const { result } = renderHook(() => useAccess('Cat'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(true);
  });

  it('should return hasReadAccess=true and hasWriteAccess=false for category', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Cat.R'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Cat'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should return hasReadAccess=true and hasWriteAccess=false for search', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Search.R'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Search'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should return hasReadAccess=true and hasWriteAccess=false for glob', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Glob.R'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Glob'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should work with no session', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      update: async () => null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAccess('Cat'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(false);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should work with no authorization flag enabled', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['read'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Cat'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: false,
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(true);
  });

  it('should override category role', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Cat.W'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Cat'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
            authorizationRoleOverride: {
              catOverride: 'Cat.R',
              searchOverride: '',
              globalOverride: '',
            },
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should override search role', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Search.W'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Search'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
            authorizationRoleOverride: {
              catOverride: '',
              searchOverride: 'Search.R',
              globalOverride: '',
            },
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should override global role', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['Glob.W'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess('Glob'), {
      wrapper: ({ children }) => (
        <FeatureFlagContext.Provider
          value={{
            ...defaultFeatureFlags,
            hasAuthorization: true,
            authorizationRoleOverride: {
              catOverride: '',
              searchOverride: '',
              globalOverride: 'Glob.R',
            },
          }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });
});
