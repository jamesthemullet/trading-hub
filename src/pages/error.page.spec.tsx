import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { renderWithProviders } from '@/test/render-with-providers';

import ErrorPage from './error.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const push = jest.fn();

describe('Error Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        error: '',
        source: '',
      },
      push,
    });
  });

  it('should render correctly', () => {
    renderWithProviders(<ErrorPage />);

    expect(
      screen.getByText('An unknown error occurred. Please try again later.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go Back to Sign In' })
    ).toBeInTheDocument();
  });

  it('should render default error message if no url query is provided', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
    });

    renderWithProviders(<ErrorPage />);

    expect(
      screen.getByText('An unknown error occurred. Please try again later.')
    ).toBeInTheDocument();
  });

  it('should render the matching error message for a recognized error', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        error: 'OAuthCallback',
      },
    });

    renderWithProviders(<ErrorPage />);

    expect(
      screen.getByText('An error occurred. Please try again later.')
    ).toBeInTheDocument();
  });

  it('should render the default message for an array-valued error query', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        error: ['OAuthCallback'],
      },
    });

    renderWithProviders(<ErrorPage />);

    expect(
      screen.getByText('An unknown error occurred. Please try again later.')
    ).toBeInTheDocument();
  });

  it('should render the source as Authentication if the source is auth', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        source: 'auth',
      },
    });

    renderWithProviders(<ErrorPage />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
  });

  it('should redirect to the home page when the button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ErrorPage />);

    const button = screen.getByRole('button', {
      name: 'Go Back to Sign In',
    });

    await user.click(button);

    expect(push).toHaveBeenCalledWith('/');
  });
});
