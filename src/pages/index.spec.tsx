import { render, screen } from '@testing-library/react';

import { SessionProvider, signIn, signOut } from 'next-auth/react';

import Index, { getServerSideProps } from './index.page';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the index page', () => {
    process.env.NEXT_PUBLIC_AUTO_LOGIN = 'false';
    render(
      <SessionProvider session={null}>
        <Index />
      </SessionProvider>
    );

    const expectedWelcomeIntroText = 'Unauthorised, please';
    const headingElement = screen.getByText(expectedWelcomeIntroText);

    expect(headingElement).toBeVisible();
    expect(headingElement).toHaveTextContent(`${expectedWelcomeIntroText}`);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();

    delete process.env.NEXT_PUBLIC_AUTO_LOGIN;
  });

  it('renders index page with authenticated user', () => {
    render(
      <SessionProvider
        session={{
          user: {
            id: 'userId',
            email: 'kk@mnscorp.net',
          },
          expires: '2024-09-30T14:00:00.000Z',
          accessTokenExpires: 1709735128265,
          roles: ['admin'],
        }}
      >
        <Index />
      </SessionProvider>
    );

    const expectedUserEmailText = 'Hello,';
    const headingElement = screen.getByText(expectedUserEmailText, {
      exact: false,
    });

    expect(headingElement).toBeVisible();
    expect(headingElement).toHaveTextContent('Hello, kk@mnscorp.net');
  });

  it('calls sign in when user clicks sign in button', () => {
    process.env.NEXT_PUBLIC_AUTO_LOGIN = 'false';

    render(
      <SessionProvider session={null}>
        <Index />
      </SessionProvider>
    );

    const signInButtonElement = screen.getByText('Sign in', {
      exact: false,
    });

    expect(signInButtonElement).toBeVisible();

    if (signInButtonElement === null) {
      throw new Error('signInButtonElement is not found');
    }

    signInButtonElement.click();

    expect(signIn).toHaveBeenCalledWith('azure-ad');
    expect(signOut).not.toHaveBeenCalled();
    expect(signIn).toHaveBeenCalledTimes(1);
    delete process.env.NEXT_PUBLIC_AUTO_LOGIN;
  });

  it('calls sign out when user clicks sign out button', () => {
    process.env.NEXT_PUBLIC_AUTO_LOGIN = 'false';

    render(
      <SessionProvider
        session={{
          user: {
            id: 'userId',
            email: 'kk@mnscorp.net',
          },
          accessTokenExpires: 1709735128265,
          expires: '2024-09-30T14:00:00.000Z',
          roles: ['admin'],
        }}
      >
        <Index />
      </SessionProvider>
    );

    const signOutButtonElement = screen.getByText('Sign out', {
      exact: false,
    });

    expect(signOutButtonElement).toBeVisible();

    signOutButtonElement?.click();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();

    delete process.env.NEXT_PUBLIC_AUTO_LOGIN;
  });

  it('loads the home page site stripe in get server side props', async () => {
    const result = await getServerSideProps();
    expect(result).toBeDefined();
  });
});
