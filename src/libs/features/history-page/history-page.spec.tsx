import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';

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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router as never);
  });

  it('should use history item count as totalItems when pagination is missing', () => {
    render(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType="categoryRanking"
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
    render(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType="categoryRanking"
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
      })
    );

    expect(mockTablePagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { totalItems: 42 },
      })
    );
  });

  it('should default TablePagination totalItems to history item count when missing', () => {
    render(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType="categoryRanking"
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

    expect(mockTablePagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { totalItems: 2 },
      })
    );
  });

  it('should default TablePagination totalItems to 0 when pagination and history items are missing', () => {
    render(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType="categoryRanking"
        history={{}}
        isLoading={false}
        error=""
      />
    );

    expect(mockHistoryList).not.toHaveBeenCalled();
    expect(mockTablePagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { totalItems: 0 },
      })
    );
  });

  it('should update query params on pagination change', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <HistoryPage
        title="Category History"
        breadcrumbs={['Categories', 'Ranking rules']}
        accessType="Cat"
        ruleType="categoryRanking"
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

    await user.click(screen.getByRole('button', { name: 'Change page' }));

    expect(updateQueryParams).toHaveBeenCalledWith(router, {
      currentPage: 3,
      currentPageSize: 50,
      searchQuery: '',
    });
  });
});
