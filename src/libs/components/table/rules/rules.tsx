import { useState } from 'react';

import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedRuleSet } from '@/libs/api';
import { Text } from '../../typography/typography.styles';
import {
  TableContainer,
  TableRow,
  TableCol,
  TableColumnOrder,
  TableActions,
  TableOptionButton,
  TableDropdown,
  TableDateContainer,
  TableHeading,
  TableActionsButton,
} from '../table.styles';

type Props = {
  columnOrderName: keyof ReturnedRuleSet;
  columnSortOrder: 'asc' | 'desc';
  onDeleteRuleSet: ({ rulesetId }: { rulesetId: string }) => void;
  onColumnOrderChange: (columnId: keyof ReturnedRuleSet) => void;
  rules: ReturnedRuleSet[];
};

const COLUMNS: {
  label: string;
  sortBy?: keyof ReturnedRuleSet;
}[] = [
  {
    label: 'Identifier',
    sortBy: 'categoryName',
  },
  {
    label: 'Enable',
  },
  {
    label: 'Last changed',
    sortBy: 'lastChanged',
  },
  {
    label: 'Actions',
  },
];

export const Rules = ({
  rules,
  onColumnOrderChange,
  onDeleteRuleSet,
  columnOrderName,
  columnSortOrder,
}: Props) => {
  const [optionToggle, setOptionToggle] = useState('');

  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {COLUMNS.map(({ label, sortBy }) => (
          <TableCol
            key={`column-${label}`}
            style={{
              cursor: sortBy ? 'pointer' : 'auto',
              userSelect: 'none',
            }}
            onClick={() => {
              sortBy && onColumnOrderChange(sortBy);
            }}
          >
            <TableHeading as="p" isStrong={true}>
              {label}
            </TableHeading>

            {sortBy && (
              <TableColumnOrder
                order={
                  columnOrderName === sortBy ? columnSortOrder : 'unsorted'
                }
              />
            )}
          </TableCol>
        ))}
      </TableRow>
      {rules.map(
        ({
          categoryName,
          categoryId,
          id,
          lastChanged,
          isEnabled,
        }: ReturnedRuleSet) => {
          const isOptionDropdownOpen = optionToggle === id;

          return (
            <TableRow key={`rule-${id}`}>
              <TableCol>
                <Text title={categoryName}>
                  {categoryId} | {categoryName}
                </Text>
              </TableCol>
              <TableCol>
                <Toggle checked={isEnabled} onChange={() => {}} />
              </TableCol>
              <TableCol>
                <TableDateContainer>
                  <Text>
                    {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                  </Text>
                  <Text style={{ fontSize: '0.7em' }}>{lastChanged.user}</Text>
                </TableDateContainer>
              </TableCol>
              <TableCol style={{ padding: '12px 0 16px' }}>
                <TableActions>
                  <TableActionsButton href={`rules/edit/${id}`}>
                    Edit
                  </TableActionsButton>
                  <TableOptionButton
                    isOpen={isOptionDropdownOpen}
                    onClick={() =>
                      setOptionToggle(isOptionDropdownOpen ? '' : id)
                    }
                    title="More options"
                  />
                  {isOptionDropdownOpen && (
                    <TableDropdown
                      title="Delete"
                      onClick={() => onDeleteRuleSet({ rulesetId: id })}
                    >
                      Delete
                    </TableDropdown>
                  )}
                </TableActions>
              </TableCol>
            </TableRow>
          );
        }
      )}
    </TableContainer>
  );
};
