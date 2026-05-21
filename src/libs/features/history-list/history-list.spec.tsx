import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RuleType } from '@/libs/constants/rule-types';
import { renderWithProviders } from '@/test/render-with-providers';

import { HistoryList } from './history-list';

jest.mock('@/libs/hooks/utils/analytics', () => ({
  track: jest.fn(),
}));

describe('HistoryList', () => {
  const mockItems = [
    {
      rulesetId: 'ruleset-1',
      id: 'change-1',
      date: '2024-01-15T14:30:00Z',
      user: 'John Doe',
      changes: ['12345678 pinned', '87654321 boosted'],
    },
    {
      rulesetId: 'ruleset-1',
      id: 'change-2',
      date: '2024-01-14T10:15:00Z',
      user: 'Jane Smith',
      changes: ['Disabled'],
    },
    {
      rulesetId: 'ruleset-1',
      id: 'change-3',
      date: '2024-01-13T09:00:00Z',
      user: 'Bob Johnson',
      changes: [],
    },
  ];

  it('should render the history list with all columns', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Changes Made')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should show "View current" for the latest item and "View" for older items', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('View current')).toBeInTheDocument();
    expect(screen.getAllByText('View')).toHaveLength(2);
  });

  it('should render change descriptions for items with changes', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('12345678 pinned')).toBeInTheDocument();
    expect(screen.getByText('87654321 boosted')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should render "—" for items with an empty changes array', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should show "Show More" and hide overflow when changes exceed MAX_VISIBLE_DIFFS', () => {
    const manyChanges = [
      {
        rulesetId: 'ruleset-1',
        id: 'change-overflow',
        date: '2024-01-15T14:30:00Z',
        user: 'John Doe',
        changes: [
          'a pinned',
          'b boosted',
          'c blocked',
          'd buried',
          'e unpinned',
        ],
      },
    ];
    renderWithProviders(
      <HistoryList items={manyChanges} ruleType={RuleType.CategoryRanking} />
    );

    expect(
      screen.getByRole('button', { name: 'Show More' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show More' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByText('e unpinned')).not.toBeInTheDocument();
  });

  it('should expand to show all changes when "Show More" is clicked', async () => {
    const user = userEvent.setup();
    const manyChanges = [
      {
        rulesetId: 'ruleset-1',
        id: 'change-overflow',
        date: '2024-01-15T14:30:00Z',
        user: 'John Doe',
        changes: [
          'a pinned',
          'b boosted',
          'c blocked',
          'd buried',
          'e unpinned',
        ],
      },
    ];
    renderWithProviders(
      <HistoryList items={manyChanges} ruleType={RuleType.CategoryRanking} />
    );

    await user.click(screen.getByRole('button', { name: 'Show More' }));

    expect(screen.getByText('e unpinned')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show Fewer' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Fewer' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('should collapse back when "Show Fewer" is clicked', async () => {
    const user = userEvent.setup();
    const manyChanges = [
      {
        rulesetId: 'ruleset-1',
        id: 'change-overflow',
        date: '2024-01-15T14:30:00Z',
        user: 'John Doe',
        changes: [
          'a pinned',
          'b boosted',
          'c blocked',
          'd buried',
          'e unpinned',
        ],
      },
    ];
    renderWithProviders(
      <HistoryList items={manyChanges} ruleType={RuleType.CategoryRanking} />
    );

    await user.click(screen.getByRole('button', { name: 'Show More' }));
    await user.click(screen.getByRole('button', { name: 'Show Fewer' }));

    expect(screen.queryByText('e unpinned')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show More' })
    ).toBeInTheDocument();
  });

  it('should create correct link for current version', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    const currentLink = screen.getByText('View current').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1'
    );
  });

  it('should create correct links for historical versions', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    const historyLinks = screen.getAllByText('View');

    const firstHref = historyLinks[0].closest('a')?.getAttribute('href') ?? '';
    const firstUrl = new URL(firstHref, 'http://localhost');
    expect(firstUrl.pathname).toBe('/category/rulesets/edit/ruleset-1');
    expect(firstUrl.searchParams.get('history')).toBe('true');
    expect(firstUrl.searchParams.get('historyId')).toBe('change-2');
    expect(firstUrl.searchParams.get('currentPage')).toBe('1');
    expect(firstUrl.searchParams.get('currentPageSize')).toBe('20');

    const secondHref = historyLinks[1].closest('a')?.getAttribute('href') ?? '';
    const secondUrl = new URL(secondHref, 'http://localhost');
    expect(secondUrl.pathname).toBe('/category/rulesets/edit/ruleset-1');
    expect(secondUrl.searchParams.get('history')).toBe('true');
    expect(secondUrl.searchParams.get('historyId')).toBe('change-3');
    expect(secondUrl.searchParams.get('currentPage')).toBe('1');
    expect(secondUrl.searchParams.get('currentPageSize')).toBe('20');
  });

  it('should propagate non-default pagination values into historical version links', () => {
    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        currentPage={3}
        currentPageSize={50}
      />
    );

    const historyLinks = screen.getAllByText('View');

    const firstHref = historyLinks[0].closest('a')?.getAttribute('href') ?? '';
    const firstUrl = new URL(firstHref, 'http://localhost');
    expect(firstUrl.pathname).toBe('/category/rulesets/edit/ruleset-1');
    expect(firstUrl.searchParams.get('history')).toBe('true');
    expect(firstUrl.searchParams.get('historyId')).toBe('change-2');
    expect(firstUrl.searchParams.get('currentPage')).toBe('3');
    expect(firstUrl.searchParams.get('currentPageSize')).toBe('50');

    const secondHref = historyLinks[1].closest('a')?.getAttribute('href') ?? '';
    const secondUrl = new URL(secondHref, 'http://localhost');
    expect(secondUrl.pathname).toBe('/category/rulesets/edit/ruleset-1');
    expect(secondUrl.searchParams.get('history')).toBe('true');
    expect(secondUrl.searchParams.get('historyId')).toBe('change-3');
    expect(secondUrl.searchParams.get('currentPage')).toBe('3');
    expect(secondUrl.searchParams.get('currentPageSize')).toBe('50');
  });

  it('should show "View current" on the first page and "View" only on later pages', () => {
    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        totalItems={25}
        startIndex={10}
      />
    );

    expect(screen.queryByText('View current')).not.toBeInTheDocument();
    expect(screen.getAllByText('View')).toHaveLength(3);
  });

  it('should not render TablePagination when pagination props are absent', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should call handlePageChange when a page is selected', async () => {
    const user = userEvent.setup();
    const handlePageChange = jest.fn();

    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        pagination={{ totalItems: 50 }}
        pageSizes={[10, 20, 50]}
        currentPage={1}
        currentPageSize={10}
        handlePageChange={handlePageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(handlePageChange).toHaveBeenCalled();
  });

  it('should default pageSizes to [] when not provided', () => {
    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        pagination={{ totalItems: 50 }}
        currentPage={1}
        currentPageSize={10}
        handlePageChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('results count')).toBeInTheDocument();
  });

  it('should render Rulesets and Facets tabs for category rule types', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(
      screen.getByRole('button', { name: 'Rulesets' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Facets' })).toBeInTheDocument();
  });

  it('should not render tabs for redirect rule types', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.Redirect} />
    );

    expect(
      screen.queryByRole('button', { name: 'Rulesets' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Facets' })
    ).not.toBeInTheDocument();
  });

  it('should link to ruleset edit route by default (Rulesets tab active)', () => {
    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    const currentLink = screen.getByText('View current').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1'
    );
  });

  it('should link to facet edit route when Facets tab is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    await user.click(screen.getByRole('button', { name: 'Facets' }));

    const currentLink = screen.getByText('View current').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/facets/edit/ruleset-1'
    );
  });

  it('should link to facet edit route for historical items when Facets tab is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    await user.click(screen.getByRole('button', { name: 'Facets' }));

    const historyLinks = screen.getAllByText('View');
    const firstHref = historyLinks[0].closest('a')?.getAttribute('href') ?? '';
    const firstUrl = new URL(firstHref, 'http://localhost');
    expect(firstUrl.pathname).toBe('/category/facets/edit/ruleset-1');
    expect(firstUrl.searchParams.get('history')).toBe('true');
    expect(firstUrl.searchParams.get('historyId')).toBe('change-2');
  });

  it('should link to search facet route when rule type is SearchRanking and Facets tab is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HistoryList items={mockItems} ruleType={RuleType.SearchRanking} />
    );

    await user.click(screen.getByRole('button', { name: 'Facets' }));

    const currentLink = screen.getByText('View current').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/search/facets/edit/ruleset-1'
    );
  });

  it('should start on the Facets tab when initialTab=1', () => {
    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        initialTab={1}
      />
    );

    const currentLink = screen.getByText('View current').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/facets/edit/ruleset-1'
    );
  });

  it('should call onTabChange when switching tabs', async () => {
    const user = userEvent.setup();
    const onTabChange = jest.fn();

    renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        onTabChange={onTabChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Facets' }));
    expect(onTabChange).toHaveBeenCalledWith(1);
  });

  it('should update the active tab when initialTab prop changes', () => {
    const { rerender } = renderWithProviders(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        initialTab={0}
      />
    );

    expect(screen.getByText('View current').closest('a')).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1'
    );

    rerender(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        initialTab={1}
      />
    );

    expect(screen.getByText('View current').closest('a')).toHaveAttribute(
      'href',
      '/category/facets/edit/ruleset-1'
    );
  });
});
