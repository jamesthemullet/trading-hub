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
      reason: 'Failed to get product data',
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
    expect(screen.getByText('Product is operational')).toBeInTheDocument();
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
      expect(screen.getByText('1 issue detected')).toBeInTheDocument();
    });
    expect(screen.getByText('Failed to get product data')).toBeInTheDocument();
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
    expect(
      screen.queryByText('Product is operational')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('1 issue detected')).not.toBeInTheDocument();
  });

  it('should show UK Market label when results are displayed', async () => {
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
      expect(screen.getByText('UK Market')).toBeInTheDocument();
    });
  });

  it('should show IE Market label and call the IE catalogue after switching market', async () => {
    const capturedUrls: string[] = [];
    server.use(
      http.get(
        '/api/search/beta/merchandising/product/diagnostics',
        ({ request }) => {
          capturedUrls.push(request.url);
          return HttpResponse.json(mockOnlineResponse);
        }
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('UK Market')).toBeInTheDocument();

    await user.click(
      screen.getByTestId('button to open country selector dropdown')
    );
    await user.click(screen.getByText('IE market only'));

    await user.click(screen.getByPlaceholderText('e.g. 60538523'));
    await user.keyboard('{Enter}');
    expect(await screen.findByText('IE Market')).toBeInTheDocument();

    const lastUrl = capturedUrls[capturedUrls.length - 1];
    expect(new URL(lastUrl).searchParams.get('catalogue')).toBe('MANDSIE');
  });

  it('should refetch when changing market after a successful search', async () => {
    const capturedUrls: string[] = [];
    server.use(
      http.get(
        '/api/search/beta/merchandising/product/diagnostics',
        ({ request }) => {
          capturedUrls.push(request.url);
          return HttpResponse.json(mockOnlineResponse);
        }
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('UK Market')).toBeInTheDocument();

    await user.click(
      screen.getByTestId('button to open country selector dropdown')
    );
    await user.click(screen.getByText('IE market only'));

    expect(await screen.findByText('IE Market')).toBeInTheDocument();
    expect(capturedUrls.length).toBeGreaterThanOrEqual(2);
    expect(
      new URL(capturedUrls[capturedUrls.length - 1]).searchParams.get(
        'catalogue'
      )
    ).toBe('MANDSIE');
  });

  it('should not refetch when changing market after search if the query is cleared', async () => {
    const capturedUrls: string[] = [];
    server.use(
      http.get(
        '/api/search/beta/merchandising/product/diagnostics',
        ({ request }) => {
          capturedUrls.push(request.url);
          return HttpResponse.json(mockOnlineResponse);
        }
      )
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatus />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '60538523');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('UK Market')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('e.g. 60538523'));

    await user.click(
      screen.getByTestId('button to open country selector dropdown')
    );
    await user.click(screen.getByText('IE market only'));

    expect(capturedUrls).toHaveLength(1);
    expect(screen.queryByText('Green Wool Coat')).not.toBeInTheDocument();
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
