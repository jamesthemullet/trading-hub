import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { DataTable } from './datatable';

const mockToggle = jest.fn();
const mockToggleRuleSet = jest.fn();

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

const maxHeadings = [
  'Identifier',
  'Breadcrumb',
  'Schedule',
  'Influence',
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

const countryRows = [
  {
    id: '123',
    identifier: 'SubCategory_123',
    isEnabled: false,
    lastChanged: { user: 'Bobby', date: '2022-10-01' },
    onToggle: mockToggle,
    url: 'path/to/ruleset',
    categoryPlpUrl: 'path/to/SubCategory_123',
    countryCode: 'FR',
  },
];

describe('DataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('path/to/SubCategory_123')).toBeInTheDocument();
  });

  it('should render loading skeleton correctly', () => {
    renderWithProviders(
      <DataTable
        isLoading={true}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByTestId('datatable-skeleton')).toBeVisible();
    expect(screen.getByText('Identifier')).toBeVisible();
  });

  it('should render loading skeleton with specific page size', () => {
    renderWithProviders(
      <DataTable
        isLoading={true}
        currentPageSize={20}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByTestId('datatable-skeleton')).toBeVisible();
    expect(screen.getByTestId('datatable-skeleton-row-19')).toBeVisible();
    expect(screen.getByText('Identifier')).toBeVisible();
  });

  it('should render correctly with no write access', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DataTable
        isLoading={false}
        currentPageSize={20}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
        writeEnabled={false}
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('path/to/SubCategory_123')).toBeInTheDocument();

    await user.click(screen.getAllByTitle('More options')[0]);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Delete' })
      ).not.toBeInTheDocument();
    });
  });

  it('should render correctly with six headings', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={sixHeadings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument();
  });

  it('should render correctly with seven headings', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={sevenHeadings}
        rows={schedulingRows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('should show "No end date" when no set', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={sevenHeadings}
        rows={[
          {
            id: 'id',
            identifier: '*',
            isEnabled: true,
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            onToggle: mockToggle,
            url: 'path/to/ruleset',
            startDate: '2022-10-01',
          },
        ]}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );
    expect(screen.getAllByText('01 Oct 2022 - No end date')).toHaveLength(3);
  });

  it('should render correctly with max headings', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={maxHeadings}
        rows={schedulingRows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByText('SubCategory_123')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Influence')).toBeInTheDocument();
  });

  describe('deleting', () => {
    it('should delete a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          ruleType="categoryRanking"
        />
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
      await user.click(screen.getByTestId('Delete rule'));

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
        <DataTable
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          ruleType="categoryRanking"
        />
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

      const confirmDeleteButton = screen.getByTestId('Delete rule');
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
        <DataTable
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          ruleType="categoryRanking"
        />
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
  });

  describe('duplication', () => {
    it('should duplicate a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="categoryRanking"
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
        name: 'Confirm',
      });
      await user.click(confirmButton);

      expect(mockDuplicate).toHaveBeenCalledWith('mockId');
    });

    it('should duplicate a redirect', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="redirect"
        />
      );

      await user.click(screen.getAllByTitle('More options')[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Create a duplicate redirect rule',
          })
        ).toBeVisible();
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Confirm',
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
          isLoading={false}
          headings={headings}
          rows={rows}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="categoryRanking"
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
        name: 'Confirm',
      });
      await user.type(confirmButton, '{Enter}');

      expect(mockDuplicate).toHaveBeenCalledWith('mockId');
    });

    it('should show search terms when duplicating a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={[{ ...rows[0], searchTerms: ['foo', 'bar'] }]}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="searchRanking"
        />
      );

      await user.click(screen.getAllByTitle('More options')[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Are you sure you want to create a duplicate of foo, bar?'
          )
        ).toBeVisible();
      });
    });

    it('should show a maximum of 3 search terms when duplicating a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={[{ ...rows[0], searchTerms: ['one', 'two', 'three', 'four'] }]}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="searchRanking"
        />
      );

      await user.click(screen.getAllByTitle('More options')[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Are you sure you want to create a duplicate of one, two, three [...]?'
          )
        ).toBeVisible();
      });
    });

    it('should show categories when duplicating a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={[
            {
              ...rows[0],
              categoriesInfo: [
                { name: 'foo', id: 'fooId' },
                { name: 'bar', id: 'barId' },
              ],
            },
          ]}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="categoryRanking"
        />
      );

      await user.click(screen.getAllByTitle('More options')[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Are you sure you want to create a duplicate of fooId - foo | barId - bar?'
          )
        ).toBeVisible();
      });
    });

    it('should show a maximum of 3 categories when duplicating a rule set', async () => {
      const user = userEvent.setup();
      const mockDelete = jest.fn();
      const mockDuplicate = jest.fn();
      renderWithProviders(
        <DataTable
          isLoading={false}
          headings={headings}
          rows={[
            {
              ...rows[0],
              categoriesInfo: [
                { name: 'one', id: 'oneId' },
                { name: 'two', id: 'twoId' },
                { name: 'three', id: 'threeId' },
                { name: 'four', id: 'fourId' },
              ],
            },
          ]}
          onDeleteRuleSet={mockDelete}
          onDuplicate={mockDuplicate}
          ruleType="categoryRanking"
        />
      );

      await user.click(screen.getAllByTitle('More options')[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Are you sure you want to create a duplicate of oneId - one | twoId - two | threeId - three [...]?'
          )
        ).toBeVisible();
      });
    });
  });

  it('should toggle a rule set', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={mockDelete}
        ruleType="categoryRanking"
      />
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
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={mockDelete}
        ruleType="categoryRanking"
      />
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
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
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
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
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

  it('should not show country flag if the country is not UK or IE', () => {
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={countryRows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.queryByAltText('UK rule')).not.toBeInTheDocument();
    expect(screen.queryByAltText('IE rule')).not.toBeInTheDocument();
  });

  it('should display both the UK and IE flags if the country code is UK_IE', () => {
    const ukIeRows = [
      {
        id: '123',
        identifier: 'SubCategory_123',
        isEnabled: false,
        lastChanged: { user: 'Bobby', date: '2022-10-01' },
        onToggle: mockToggle,
        url: 'path/to/ruleset',
        categoryPlpUrl: 'path/to/SubCategory_123',
        countryCode: 'UK_IE',
      },
    ];

    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={ukIeRows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByAltText('UK rule')).toBeInTheDocument();
    expect(screen.getByAltText('IE rule')).toBeInTheDocument();
  });

  it('should display the UK flag if the country code is UK', () => {
    const ukRows = [
      {
        id: '123',
        identifier: 'SubCategory_123',
        isEnabled: false,
        lastChanged: { user: 'Bobby', date: '2022-10-01' },
        onToggle: mockToggle,
        url: 'path/to/ruleset',
        categoryPlpUrl: 'path/to/SubCategory_123',
        countryCode: 'UK',
      },
    ];

    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={ukRows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
      />
    );

    expect(screen.getByAltText('UK rule')).toBeInTheDocument();
  });

  it('should call onToggleRuleSet', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={rows}
        onDeleteRuleSet={jest.fn()}
        ruleType="categoryRanking"
        onToggleRuleSet={mockToggleRuleSet}
      />
    );

    user.click(screen.getAllByTitle('Toggle')[0]);

    await waitFor(() => {
      expect(mockToggleRuleSet).toHaveBeenCalledWith({
        id: 'mockId',
      });
    });
  });

  it('should show query text in a b tag', async () => {
    const { container } = renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={[{ ...rows[0], identifier: 'foo | bar' }]}
        onDeleteRuleSet={jest.fn()}
        onDuplicate={jest.fn()}
        ruleType="searchRanking"
        query="bar"
      />
    );
    expect(container.querySelector('b')).toHaveTextContent('bar');
  });

  it('should show capitalised query text in a b tag for a lowercase identifier', async () => {
    const { container } = renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={[{ ...rows[0], identifier: 'foo | bar' }]}
        onDeleteRuleSet={jest.fn()}
        onDuplicate={jest.fn()}
        ruleType="searchRanking"
        query="FOO"
      />
    );
    expect(container.querySelector('b')).toHaveTextContent('foo');
  });

  it('should show last edited user name that matches query text in a b tag', async () => {
    const { container } = renderWithProviders(
      <DataTable
        isLoading={false}
        headings={headings}
        rows={[
          { ...rows[0], lastChanged: { date: '2021-10-01', user: 'Mr Foo' } },
        ]}
        onDeleteRuleSet={jest.fn()}
        onDuplicate={jest.fn()}
        ruleType="searchRanking"
        query="FOO"
      />
    );

    expect(container.querySelector('b')).toHaveTextContent('Foo');
  });
});
