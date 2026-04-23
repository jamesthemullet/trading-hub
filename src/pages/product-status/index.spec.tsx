import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from '@/test/render-with-providers';

jest.mock(
  'next/dynamic',
  () => (fn: () => Promise<{ default: React.ComponentType }>) => {
    let Component: React.ComponentType | null = null;
    fn().then((m) => (Component = m.default ?? m));
    const DynamicComponent = (props: object) =>
      Component ? <Component {...props} /> : null;
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  }
);

import ProductStatus from './index.page';

const mockOnlineResponse = {
  products: [
    {
      id: 'p1',
      productId: '60538523',
      title: 'Green Wool Coat',
      price: '£89.00',
      imageUrl: [],
      isInStock: true,
      metadata: { isPinned: false },
    },
  ],
  pagination: { totalItems: 1 },
  issues: [],
};

const mockOfflineResponse = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [
    {
      reason: 'Product is not marked saleable in Product Assembly',
      action: 'Contact Product Domain team',
    },
  ],
};

const server = setupServer();

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

afterAll(() => server.close());

describe('ProductStatus page', () => {
  it('should render the search header', () => {
    renderWithProviders(<ProductStatus />);

    expect(
      screen.getByRole('heading', { name: 'Product status search' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 60538523')).toBeInTheDocument();
  });

  it('should show loading state while fetching', async () => {
    server.use(
      http.get(
        '/api/search/beta/merchandising/product/diagnostics',
        async () => {
          await new Promise((r) => setTimeout(r, 100));
          return HttpResponse.json(mockOnlineResponse);
        }
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should show Online badge when product is found', async () => {
    server.use(
      http.get('/api/search/beta/merchandising/product/diagnostics', () =>
        HttpResponse.json(mockOnlineResponse)
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Green Wool Coat')).toBeInTheDocument();
    });
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show Offline badge and blocking issues when product is not found', async () => {
    server.use(
      http.get('/api/search/beta/merchandising/product/diagnostics', () =>
        HttpResponse.json(mockOfflineResponse)
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
    expect(screen.getByText('Blocking issues')).toBeInTheDocument();
    expect(
      screen.getByText('Product is not marked saleable in Product Assembly')
    ).toBeInTheDocument();
    expect(screen.getByText('Contact Product Domain team')).toBeInTheDocument();
  });

  it('should show an error message when the request fails', async () => {
    server.use(
      http.get('/api/search/beta/merchandising/product/diagnostics', () =>
        HttpResponse.json(
          { message: 'Internal Server Error', status: 500 },
          { status: 500 }
        )
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('should not search when query is empty', async () => {
    const handler = jest.fn(() => HttpResponse.json(mockOnlineResponse));
    server.use(
      http.get('/api/search/beta/merchandising/product/diagnostics', handler)
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '  ');
    await user.keyboard('{Enter}');

    expect(handler).not.toHaveBeenCalled();
  });
});
