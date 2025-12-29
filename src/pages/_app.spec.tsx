import '@testing-library/jest-dom';

import { CookiesProvider, useCookies } from 'react-cookie';
import { render, screen } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import { createMockNextRouter } from '../test/create-mock-next-router';
import App from './_app.page';

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
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
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

  it('should not load OneTrust scripts when oneTrust feature flag is disabled/undefined', () => {
    render(
      <CookiesProvider>
        <App
          Component={() => <div>test component</div>}
          pageProps={{
            session: null,
          }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    const oneTrustScripts = document.querySelectorAll(
      'script[src*="onetrust"], script[data-domain-script]'
    );
    expect(oneTrustScripts).toHaveLength(0);

    const domainScript = document.querySelector(
      'script[data-domain-script="01999609-8173-7554-b57e-cebe580c3242"]'
    );
    expect(domainScript).not.toBeInTheDocument();
  });

  it('should load OneTrust scripts in App component when feature flag is enabled', () => {
    jest
      .mocked(useCookies)
      .mockReturnValue([
        { flagOneTrust: true },
        jest.fn(),
        jest.fn(),
        jest.fn(),
      ]);

    Object.defineProperty(window, 'location', {
      value: { hostname: 'example.com' },
      writable: true,
    });

    render(
      <CookiesProvider>
        <App
          Component={() => <div>test component with onetrust</div>}
          pageProps={{
            session: null,
          }}
          router={createMockNextRouter()}
        />
      </CookiesProvider>
    );

    expect(
      screen.getByText('test component with onetrust')
    ).toBeInTheDocument();

    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
    });
  });
});
