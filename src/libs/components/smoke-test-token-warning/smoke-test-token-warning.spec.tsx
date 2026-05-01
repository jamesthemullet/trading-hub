import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from '@/test/render-with-providers';

import { SmokeTestTokenWarning } from './smoke-test-token-warning';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const mockUseRouter = useRouter as jest.Mock;

const handlers = [
  http.get('/api/healthcheck', () =>
    HttpResponse.json({ status: 'ok', hasSmokeTestToken: true })
  ),
];

const server = setupServer(...handlers);

describe('SmokeTestTokenWarning', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ asPath: '/' });
  });

  beforeAll(() => server.listen());

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should not render when SMOKE_TEST_TOKEN is not set', async () => {
    server.use(
      http.get('/api/healthcheck', () =>
        HttpResponse.json({ status: 'ok', hasSmokeTestToken: false })
      )
    );

    renderWithProviders(<SmokeTestTokenWarning />);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
      ).not.toBeInTheDocument();
    });
  });

  it('should render persistent warning banner when SMOKE_TEST_TOKEN is set', async () => {
    renderWithProviders(<SmokeTestTokenWarning />);

    expect(
      await screen.findByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/This is a CI\/CD testing token/)
    ).toBeInTheDocument();
  });

  it('should show the token removal instructions', async () => {
    renderWithProviders(<SmokeTestTokenWarning />);

    expect(
      await screen.findByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Please remove or comment out/)
    ).toBeInTheDocument();
  });

  it('should have a button to acknowledge the warning', async () => {
    renderWithProviders(<SmokeTestTokenWarning />);

    expect(
      await screen.findByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /I will remove SMOKE_TEST_TOKEN now/,
    });
    expect(button).toBeInTheDocument();
  });

  it('should re-show the banner on navigation after dismissal', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<SmokeTestTokenWarning />);

    expect(
      await screen.findByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /I will remove SMOKE_TEST_TOKEN now/ })
    );

    expect(
      screen.queryByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).not.toBeInTheDocument();

    // Simulate navigation to a new page
    mockUseRouter.mockReturnValue({ asPath: '/category' });
    rerender(<SmokeTestTokenWarning />);

    expect(
      await screen.findByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
    ).toBeInTheDocument();
  });

  it('should handle healthcheck fetch errors gracefully', async () => {
    server.use(
      http.get('/api/healthcheck', () => {
        return HttpResponse.error();
      })
    );

    renderWithProviders(<SmokeTestTokenWarning />);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /SMOKE_TEST_TOKEN DETECTED/ })
      ).not.toBeInTheDocument();
    });
  });
});
