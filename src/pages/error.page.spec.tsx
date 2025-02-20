import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

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
    render(<ErrorPage />);

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

    render(<ErrorPage />);

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

    render(<ErrorPage />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
  });

  it('should redirect to the home page when the button is clicked', () => {
    render(<ErrorPage />);

    const button = screen.getByRole('button', {
      name: 'Go Back to Sign In',
    });

    button.click();

    expect(push).toHaveBeenCalledWith('/');
  });
});
