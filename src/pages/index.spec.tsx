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

  it('renders index page', () => {
    render(
      <SessionProvider session={null}>
        <Index />
      </SessionProvider>
    );

    const expectedWelcomeIntroText = 'Unauthorised,';
    const headingElement = screen.queryByText(expectedWelcomeIntroText);

    expect(headingElement).toBeVisible();
    expect(headingElement).toHaveTextContent(
      `${expectedWelcomeIntroText} Sign in`
    );
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
        }}
      >
        <Index />
      </SessionProvider>
    );

    const expectedUserEmailText = 'Hello,';
    const headingElement = screen.queryByText(expectedUserEmailText, {
      exact: false,
    });

    expect(headingElement).toBeVisible();
    expect(headingElement).toHaveTextContent('Hello, kk@mnscorp.net');
  });

  it('calls sign in when user clicks sign in button', () => {
    render(
      <SessionProvider session={null}>
        <Index />
      </SessionProvider>
    );

    const signInButtonElement = screen.queryByText('Sign in', {
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
  });

  it('calls sign out when user clicks sign out button', () => {
    render(
      <SessionProvider
        session={{
          user: {
            id: 'userId',
            email: 'kk@mnscorp.net',
          },
          accessTokenExpires: 1709735128265,
          expires: '2024-09-30T14:00:00.000Z',
        }}
      >
        <Index />
      </SessionProvider>
    );

    const signOutButtonElement = screen.queryByText('Sign out', {
      exact: false,
    });

    expect(signOutButtonElement).toBeVisible();

    signOutButtonElement?.click();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('loads the home page site stripe in get server side props', async () => {
    const result = await getServerSideProps();
    expect(result).toBeDefined();
  });
});
