import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { DataTable } from './datatable';

const mockToggle = jest.fn();

const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

const rows = [
  {
    id: 'id',
    identifier: '*',
    isEnabled: true,
    lastChanged: { user: 'Bob', date: '2021-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
  },
  {
    id: '123',
    identifier: 'SubCategory_123',
    isEnabled: false,
    lastChanged: { user: 'Bob', date: '2021-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
  },
];

describe('DataTable', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={jest.fn()} />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
  });

  it('should delete a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).toBeVisible();
    });
    await user.click(screen.getByLabelText('Delete rule'));

    expect(mockDelete).toHaveBeenCalledWith({
      id: 'id',
    });
  });

  it('should cancel deleting a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).toBeVisible();
    });
    await user.click(screen.getByLabelText('Cancel delete'));

    await user.click(screen.getAllByTitle('More options')[0]);
    expect(
      screen.getByText('Do you want to delete this rule?')
    ).not.toBeVisible();
  });

  it('should toggle a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('Toggle')[0]);

    expect(mockToggle).toHaveBeenCalledWith({
      id: 'id',
    });
  });
});
