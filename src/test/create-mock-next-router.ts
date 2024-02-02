import merge from 'deepmerge';
import type { Router } from 'next/router';

export const createMockNextRouter = (overrides: Partial<Router> = {}): Router =>
  merge<Router>(
    {
      basePath: '',
      pathname: '/',
      route: '/',
      asPath: '/',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(null),
      beforePopState: jest.fn(),
      isLocaleDomain: true,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isReady: true,
      isPreview: true,
      isFallback: false,
    },
    overrides as Router
  );
