import { render, screen } from '@testing-library/react';

import { RuleType } from '@/libs/constants/rule-types';

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
    },
    {
      rulesetId: 'ruleset-1',
      id: 'change-2',
      date: '2024-01-14T10:15:00Z',
      user: 'Jane Smith',
    },
    {
      rulesetId: 'ruleset-1',
      id: 'change-3',
      date: '2024-01-13T09:00:00Z',
      user: 'Bob Johnson',
    },
  ];

  it('should render the history list with all columns', () => {
    render(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should mark the first item as current version', () => {
    render(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText('Current version')).toBeInTheDocument();
    expect(screen.getAllByText('View version')).toHaveLength(2);
  });

  it('should display "current" next to the latest date', () => {
    render(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    expect(screen.getByText(/Jan 15, 2024 \(current\)/)).toBeInTheDocument();
  });

  it('should create correct link for current version', () => {
    render(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    const currentLink = screen.getByText('Current version').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1'
    );
  });

  it('should create correct links for historical versions', () => {
    render(
      <HistoryList items={mockItems} ruleType={RuleType.CategoryRanking} />
    );

    const historyLinks = screen.getAllByText('View version');

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
    render(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        currentPage={3}
        currentPageSize={50}
      />
    );

    const historyLinks = screen.getAllByText('View version');

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

  it('should show paginated row numbers and no current version on later pages', () => {
    render(
      <HistoryList
        items={mockItems}
        ruleType={RuleType.CategoryRanking}
        totalItems={25}
        startIndex={10}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.queryByText('Current version')).not.toBeInTheDocument();
    expect(screen.getAllByText('View version')).toHaveLength(3);
  });
});
