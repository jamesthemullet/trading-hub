import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ReturnedRuleSet } from '@/libs/api';

import { Rules } from './rules';

const mockRules: ReturnedRuleSet[] = [
  {
    id: '382740c2-9e8a-4ac0-aa56-1cd7ebdbcafa',
    categoryName: 'Jeans',
    lastChanged: {
      date: '2023-11-15T13:00:00.000Z',
      user: 'muthukumari thangaraj@',
    },
    categoryId: '123',
    rules: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { numeric: [], alphaNumeric: [], product: [] },
      buries: { numeric: [], alphaNumeric: [], product: [] },
    },
    isEnabled: true,
  },
  {
    id: '4a809738-e16b-4f51-fbd0-ca97d884b725',
    categoryName: 'Dresses',
    lastChanged: {
      date: '2023-11-15T13:00:00.000Z',
      user: 'muthukumari thangaraj@',
    },
    categoryId: '456',
    rules: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { numeric: [], alphaNumeric: [], product: [] },
      buries: { numeric: [], alphaNumeric: [], product: [] },
    },
    isEnabled: true,
  },
];

describe('Heading', () => {
  it('should render rule headings', () => {
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={jest.fn()}
      />
    );

    expect(screen.getByText('Identifier')).toBeInTheDocument();
  });

  it('should render list of rules', () => {
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={jest.fn()}
      />
    );

    expect(screen.getByText('123 | Jeans')).toBeInTheDocument();
    expect(screen.getByText('456 | Dresses')).toBeInTheDocument();
  });

  it('should call callback on order change', async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn();
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={mockCallback}
        onDeleteRuleSet={jest.fn()}
      />
    );

    await user.click(screen.getByText('Identifier'));

    expect(mockCallback).toHaveBeenCalledWith('categoryName');
  });

  it('should toggle the isEnabled option', async () => {
    const user = userEvent.setup();
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={jest.fn()}
      />
    );

    await user.click(screen.getAllByTitle('Toggle')[0]);

    expect(screen.getAllByTitle('Toggle')[0]).toBeInTheDocument();
  });

  it('should open the options dropdown', async () => {
    const user = userEvent.setup();
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={jest.fn()}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open and close the options dropdown', async () => {
    const user = userEvent.setup();
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={jest.fn()}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getAllByTitle('More options')[0]);

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should call the delete callback', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();
    render(
      <Rules
        rules={mockRules}
        columnOrderName="categoryName"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
        onDeleteRuleSet={mockDelete}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getByText('Delete'));

    expect(mockDelete).toHaveBeenCalledWith({ rulesetId: mockRules[0].id });
  });
});
