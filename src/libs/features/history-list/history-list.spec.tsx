import { render, screen } from '@testing-library/react';

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
    render(<HistoryList items={mockItems} ruleType="categoryRanking" />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should mark the first item as current version', () => {
    render(<HistoryList items={mockItems} ruleType="categoryRanking" />);

    expect(screen.getByText('Current version')).toBeInTheDocument();
    expect(screen.getAllByText('View version')).toHaveLength(2);
  });

  it('should display "current" next to the latest date', () => {
    render(<HistoryList items={mockItems} ruleType="categoryRanking" />);

    expect(screen.getByText(/Jan 15, 2024 \(current\)/)).toBeInTheDocument();
  });

  it('should create correct link for current version', () => {
    render(<HistoryList items={mockItems} ruleType="categoryRanking" />);

    const currentLink = screen.getByText('Current version').closest('a');
    expect(currentLink).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1'
    );
  });

  it('should create correct links for historical versions', () => {
    render(<HistoryList items={mockItems} ruleType="categoryRanking" />);

    const historyLinks = screen.getAllByText('View version');
    expect(historyLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1?history=true&historyId=change-2'
    );
    expect(historyLinks[1].closest('a')).toHaveAttribute(
      'href',
      '/category/rulesets/edit/ruleset-1?history=true&historyId=change-3'
    );
  });

  it('should show paginated row numbers and no current version on later pages', () => {
    render(
      <HistoryList
        items={mockItems}
        ruleType="categoryRanking"
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
