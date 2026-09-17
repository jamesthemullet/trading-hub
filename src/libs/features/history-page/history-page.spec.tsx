import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { Button } from '@/libs/components/button/button';
import { RuleType } from '@/libs/constants/rule-types';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import { createMockNextRouter } from '@/test/create-mock-next-router';
import { renderWithProviders } from '@/test/render-with-providers';

import { HistoryPage } from './history-page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/use-access', () => ({
  useAccess: jest.fn(() => ({
    hasReadAccess: true,
    requiredReadRole: 'read-role',
  })),
}));

jest.mock('@/libs/hooks/utils/update-query-params', () => ({
  updateQueryParams: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(() => ({ facets: [] })),
}));

const mockHistoryList = jest.fn();
const mockTablePagination = jest.fn();

jest.mock('@/libs/features/history-list/history-list', () => ({
  HistoryList: (props: unknown) => {
    mockHistoryList(props);
    return <div data-testid="history-list" />;
  },
}));

jest.mock('@/libs/components', () => ({
  AccessDeny: () => <div>Access denied</div>,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Button onClick={onClick} type="button">
      {children}
    </Button>
  ),
  ErrorMessage: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Heading: () => <div>Heading</div>,
  TablePagination: ({
    pagination,
    handlePageChange,
  }: {
    pagination: { totalItems?: number };
    handlePageChange: (page: number, pageSize: number) => void;
  }) => {
    mockTablePagination({ pagination, handlePageChange });
    return (
      // eslint-disable-next-line no-restricted-syntax
      <button onClick={() => handlePageChange(3, 50)} type="button">
        Change page
      </button>
    );
  },
}));

describe('HistoryPage', () => {
  const router = createMockNextRouter({
    query: {
      identifier: 'SUB-CAT-1',
      currentPage: '1',
      currentPageSize: '20',
    },
    pathname: '/category/history/[id]',
    push: jest.fn(),
    back: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router);
  });

  it('should pass pagination totalItems to HistoryList', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 42 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: {
                  date: '2024-01-01T00:00:00Z',
                  user: 'user-1',
                },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { totalItems: 42 },
      })
    );
  });

  it('should fall back to change count when pagination totalItems is missing', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: {},
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-02T00:00:00Z', user: 'user-2' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { totalItems: 2 },
      })
    );
  });

  it('should render nothing when there are no changes', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{ changes: [], pagination: { totalItems: 0 } }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).not.toHaveBeenCalled();
  });

  it('should update query params on pagination change', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 1 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: {
                  date: '2024-01-01T00:00:00Z',
                  user: 'user-1',
                },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    const { handlePageChange } = mockHistoryList.mock.calls[0][0] as {
      handlePageChange: (page: number, pageSize: number) => void;
    };
    handlePageChange(3, 50);

    expect(updateQueryParams).toHaveBeenCalledWith(router, {
      currentPage: 3,
      currentPageSize: 50,
      searchQuery: '',
    });
  });

  it('should pass initialTab from router.query.tab to HistoryList', () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        pathname: router.pathname,
        push: router.push,
        back: router.back,
        query: { ...router.query, tab: '1' },
      })
    );

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 1 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).toHaveBeenCalledWith(
      expect.objectContaining({ initialTab: 1 })
    );
  });

  it('should update tab query param when onTabChange is called', () => {
    const mockReplace = jest.fn();
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        pathname: router.pathname,
        query: router.query,
        push: router.push,
        back: router.back,
        replace: mockReplace,
      })
    );

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 1 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    const { onTabChange } = mockHistoryList.mock.calls[0][0] as {
      onTabChange: (tab: number) => void;
    };
    onTabChange(1);

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: router.pathname,
      query: { ...router.query, tab: 1 },
    });
  });

  it('should call router.back when the Close button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{ changes: [], pagination: { totalItems: 0 } }}
        isLoading={false}
        error=""
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(router.back).toHaveBeenCalled();
  });

  it('should compute diffs and pass changes to each history item', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 2 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-02T00:00:00Z', user: 'user-1' },
                isEnabled: false,
                rules: {
                  pinnedProducts: [{ id: 'prod-1' }],
                  blockedProducts: [],
                  boosts: { product: [], numeric: [], alphanumeric: [] },
                  buries: { product: [], numeric: [], alphanumeric: [] },
                  includes: { alphanumeric: [] },
                  excludes: { alphanumeric: [] },
                },
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-2' },
                isEnabled: true,
                rules: {
                  pinnedProducts: [],
                  blockedProducts: [],
                  boosts: { product: [], numeric: [], alphanumeric: [] },
                  buries: { product: [], numeric: [], alphanumeric: [] },
                  includes: { alphanumeric: [] },
                  excludes: { alphanumeric: [] },
                },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    const { items } = mockHistoryList.mock.calls[0][0] as {
      items: Array<{ id: string; changes: string[] }>;
    };

    expect(items[0].changes).toContain('prod-1 pinned');
    expect(items[0].changes).toContain('Ruleset disabled');

    expect(items[1].changes).toEqual([]);
  });

  it('should include the product name embedded in a rule when computing diffs', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 2 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-02T00:00:00Z', user: 'user-1' },
                rules: {
                  pinnedProducts: [],
                  blockedProducts: [],
                  boosts: {
                    product: [
                      {
                        id: 'boost-1',
                        weight: 1,
                        brand: 'M&S',
                        title: 'Jeans',
                      },
                    ],
                    numeric: [],
                    alphanumeric: [],
                  },
                  buries: { product: [], numeric: [], alphanumeric: [] },
                  includes: { alphanumeric: [] },
                  excludes: { alphanumeric: [] },
                },
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-2' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    const { items } = mockHistoryList.mock.calls[0][0] as {
      items: Array<{ id: string; changes: string[] }>;
    };
    expect(items[0].changes).toContain('boost-1 boosted\nM&S Jeans');
  });

  it('should resolve facet IDs to display names in diff descriptions', () => {
    const { useGlobalFacetsList } = jest.requireMock(
      '@/libs/hooks/global/facets/use-global-facets-list'
    );
    (useGlobalFacetsList as jest.Mock).mockReturnValueOnce({
      facets: [{ id: 'facet-uuid-1', displayValue: 'Colour' }],
    });

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 2 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-02T00:00:00Z', user: 'user-1' },
                facets: [{ id: 'facet-uuid-1' }],
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-2' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    const { items } = mockHistoryList.mock.calls[0][0] as {
      items: Array<{ id: string; changes: string[] }>;
    };
    expect(items[0].changes).toContain("'Colour' facet set to included");
  });

  it('should not throw when globalFacets is undefined', () => {
    const { useGlobalFacetsList } = jest.requireMock(
      '@/libs/hooks/global/facets/use-global-facets-list'
    );
    (useGlobalFacetsList as jest.Mock).mockReturnValueOnce({
      facets: undefined,
    });

    expect(() =>
      renderWithProviders(
        <HistoryPage
          title="Category History"
          breadcrumbs={['Categories', 'Ranking rules']}
          accessType="Cat"
          ruleType={RuleType.CategoryRanking}
          history={{ changes: [], pagination: { totalItems: 0 } }}
          isLoading={false}
          error=""
        />
      )
    ).not.toThrow();
  });

  it('should not fetch global facets for redirect history', () => {
    const { useGlobalFacetsList } = jest.requireMock(
      '@/libs/hooks/global/facets/use-global-facets-list'
    );

    renderWithProviders(
      <HistoryPage
        title="Redirect History"
        breadcrumbs={['Search', 'Redirects']}
        accessType="Search"
        ruleType={RuleType.Redirect}
        history={{ changes: [], pagination: { totalItems: 0 } }}
        isLoading={false}
        error=""
      />
    );

    expect(useGlobalFacetsList).toHaveBeenCalledWith({ enabled: false });
  });

  it('should render AccessDeny when user lacks read access', () => {
    const { useAccess } = jest.requireMock('@/libs/hooks/use-access');
    (useAccess as jest.Mock).mockReturnValueOnce({
      hasReadAccess: false,
      requiredReadRole: 'Cat.R',
    });

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{ changes: [], pagination: { totalItems: 0 } }}
        isLoading={false}
        error=""
      />
    );

    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('should display an error message and not render the history list when error is set', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
          pagination: { totalItems: 1 },
        }}
        isLoading={false}
        error="Something went wrong"
      />
    );

    expect(
      screen.getByText('Error whilst retrieving history: Something went wrong')
    ).toBeInTheDocument();
    expect(mockHistoryList).not.toHaveBeenCalled();
  });

  it('should not render the history list while loading', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
          pagination: { totalItems: 1 },
        }}
        isLoading
        error=""
      />
    );

    expect(mockHistoryList).not.toHaveBeenCalled();
  });

  it('should default to page 1 and page size 20 when query params are absent', () => {
    jest.mocked(useRouter).mockReturnValueOnce(
      createMockNextRouter({
        pathname: router.pathname,
        push: router.push,
        back: router.back,
        query: { identifier: 'SUB-CAT-1' },
      })
    );

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
          pagination: { totalItems: 1 },
        }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        currentPageSize: 20,
      })
    );
  });

  it('should pass an empty identifier to HistoryList when the router identifier is not a string', () => {
    jest.mocked(useRouter).mockReturnValueOnce(
      createMockNextRouter({
        pathname: router.pathname,
        push: router.push,
        back: router.back,
        query: { ...router.query, identifier: ['SUB-CAT-1'] },
      })
    );

    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{
          pagination: { totalItems: 1 },
          changes: [
            {
              id: 'change-1',
              change: {
                id: 'ruleset-1',
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'user-1' },
              },
            },
          ],
        }}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: '' })
    );
  });
});
