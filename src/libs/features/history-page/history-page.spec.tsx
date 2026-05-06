import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { Button } from '@/libs/components/button/button';
import { RuleType } from '@/libs/constants/rule-types';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
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
  const router = {
    query: {
      identifier: 'SUB-CAT-1',
      currentPage: '1',
      currentPageSize: '20',
    },
    pathname: '/category/history/[id]',
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router as never);
  });

  it('should use history item count as totalItems when pagination is missing', () => {
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
                lastChanged: {
                  date: '2024-01-01T00:00:00Z',
                  user: 'user-1',
                },
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: {
                  date: '2024-01-02T00:00:00Z',
                  user: 'user-2',
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
        totalItems: 2,
      })
    );
  });

  it('should use pagination totalItems when provided', () => {
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
        totalItems: 42,
        pagination: { totalItems: 42 },
      })
    );
  });

  it('should default TablePagination totalItems to history item count when missing', () => {
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
                lastChanged: {
                  date: '2024-01-01T00:00:00Z',
                  user: 'user-1',
                },
              },
            },
            {
              id: 'change-2',
              change: {
                id: 'ruleset-1',
                lastChanged: {
                  date: '2024-01-02T00:00:00Z',
                  user: 'user-2',
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
        pagination: { totalItems: 2 },
      })
    );
  });

  it('should default TablePagination totalItems to 0 when pagination and history items are missing', () => {
    renderWithProviders(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType={RuleType.CategoryRanking}
        history={{}}
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
    jest.mocked(useRouter).mockReturnValue({
      ...router,
      query: { ...router.query, tab: '1' },
    } as never);

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
    jest.mocked(useRouter).mockReturnValue({
      ...router,
      replace: mockReplace,
    } as never);

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
        history={{}}
        isLoading={false}
        error=""
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(router.back).toHaveBeenCalled();
  });
});
