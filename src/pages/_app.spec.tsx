import '@testing-library/jest-dom';

import type { ImgHTMLAttributes } from 'react';
import { createElement } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { render, screen } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import { createMockNextRouter } from '../test/create-mock-next-router';
import App from './_app.page';

jest.mock(
  '@/libs/components/smoke-test-token-warning/smoke-test-token-warning',
  () => ({
    SmokeTestTokenWarning: () => <div>SmokeTestTokenWarning</div>,
  })
);

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn().mockReturnValue('/category/rulesets'),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    return createElement('img', { alt: '', ...props });
  },
}));

jest.mock('react-cookie', () => {
  const originalModule = jest.requireActual('react-cookie');
  return {
    ...originalModule,
    useCookies: jest.fn(),
  };
});

const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { id: '', userName: 'Test User' },
  roles: [],
  accessToken: '',
  refreshToken: '',
  accessTokenExpires: 2237303552,
};

describe('App', () => {
  beforeEach(() => {
    jest.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    jest
      .mocked(useCookies)
      .mockReturnValue([{}, jest.fn(), jest.fn(), jest.fn()]);
  });

  it('renders with children', () => {
    render(
      <CookiesProvider>
        <App
          Component={() => <div>hello</div>}
          pageProps={{
            session: null,
          }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders SmokeTestTokenWarning in development', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    try {
      render(
        <CookiesProvider>
          <App
            Component={() => <div>hello</div>}
            pageProps={{ session: null }}
            router={createMockNextRouter()}
          />
        </CookiesProvider>
      );

      expect(screen.getByText('SmokeTestTokenWarning')).toBeInTheDocument();
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
      });
    }
  });

  it('does not render SmokeTestTokenWarning outside development', () => {
    render(
      <CookiesProvider>
        <App
          Component={() => <div>hello</div>}
          pageProps={{ session: null }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    expect(screen.queryByText('SmokeTestTokenWarning')).not.toBeInTheDocument();
  });

  it('sets stickyBarVariant to variant-b when cookie is variant-b', () => {
    jest
      .mocked(useCookies)
      .mockReturnValue([
        { flagStickyBarVariant: 'variant-b' },
        jest.fn(),
        jest.fn(),
        jest.fn(),
      ]);

    render(
      <CookiesProvider>
        <App
          Component={() => <div>hello</div>}
          pageProps={{ session: null }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders a skip to main content link', () => {
    render(
      <CookiesProvider>
        <App
          Component={() => <div>hello</div>}
          pageProps={{ session: null }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });
});
