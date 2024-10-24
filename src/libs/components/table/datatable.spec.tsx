import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { DataTable } from './datatable';

const mockToggle = jest.fn();

const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];
const sixHeadings = [
  'Identifier',
  'Breadcrumb',
  'Enable',
  'Last Changed',
  'User',
  'Actions',
];

const sevenHeadings = [
  'Identifier',
  'Breadcrumb',
  'Schedule',
  'Enable',
  'Last Changed',
  'User',
  'Actions',
];

const rows = [
  {
    id: 'mockId',
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
    lastChanged: { user: 'Bobby', date: '2022-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
    categoryPlpUrl: 'path/to/SubCategory_123',
  },
];

const schedulingRows = [
  {
    id: 'id',
    identifier: '*',
    isEnabled: true,
    lastChanged: { user: 'Bob', date: '2021-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
    startDate: '2022-10-01',
    endDate: '2022-10-01',
  },
  {
    id: '123',
    identifier: 'SubCategory_123',
    isEnabled: false,
    lastChanged: { user: 'Bobby', date: '2022-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
    categoryPlpUrl: 'path/to/SubCategory_123',
  },
];

describe('DataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={jest.fn()} />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('path/to/SubCategory_123')).toBeInTheDocument();
  });

  it('should render correctly with six headings', () => {
    renderWithProviders(
      <DataTable
        headings={sixHeadings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument();
  });

  it('should render correctly with seven headings', () => {
    renderWithProviders(
      <DataTable
        headings={sevenHeadings}
        rows={schedulingRows}
        onDeleteRuleSet={jest.fn()}
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('should delete a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });
    await user.click(screen.getByLabelText('Delete rule'));

    expect(mockDelete).toHaveBeenCalledWith({
      id: 'mockId',
    });
    await waitFor(() => {
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  it('should delete a rule set using keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });

    const confirmDeleteButton = screen.getByLabelText('Delete rule');
    await user.type(confirmDeleteButton, '{Enter}');

    expect(mockDelete).toHaveBeenCalledWith({
      id: 'mockId',
    });
    await waitFor(() => {
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  it('should cancel deleting a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getAllByTitle('More options')[0]);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Do you want to delete this rule?',
      })
    ).not.toBeVisible();
  });

  it('should duplicate a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    const mockDuplicate = jest.fn();
    renderWithProviders(
      <DataTable
        headings={headings}
        rows={rows}
        onDeleteRuleSet={mockDelete}
        onDuplicate={mockDuplicate}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create a duplicate rule' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Duplicate rule',
    });
    await user.click(confirmButton);

    expect(mockDuplicate).toHaveBeenCalledWith('mockId');
  });

  it('should duplicate a rule set using keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    const mockDuplicate = jest.fn();
    renderWithProviders(
      <DataTable
        headings={headings}
        rows={rows}
        onDeleteRuleSet={mockDelete}
        onDuplicate={mockDuplicate}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create a duplicate rule' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Duplicate rule',
    });
    await user.type(confirmButton, '{Enter}');

    expect(mockDuplicate).toHaveBeenCalledWith('mockId');
  });

  it('should toggle a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    user.click(screen.getAllByTitle('Toggle')[0]);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith({
        id: 'mockId',
      });
    });
  });

  it('should toggle a rule set using keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={mockDelete} />
    );

    const dropDown = screen.queryAllByTitle('More options')[0];
    dropDown.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
    });
  });

  it('should close the dropdown if already open when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={jest.fn()} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    await user.click(screen.getAllByTitle('More options')[0]);

    await waitFor(() => {
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when Esc key is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DataTable headings={headings} rows={rows} onDeleteRuleSet={jest.fn()} />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });
});
