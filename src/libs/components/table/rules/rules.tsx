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
import { spacing } from '../../utils/spacing';
import styled from '@emotion/styled';

const RulesTableCol = styled(TableCol)`
  flex: 0 0 150px;

  &:first-of-type {
    flex: 2 0 240px;
    padding-left: ${spacing(2)};
  }

  &:nth-of-type(2) {
    flex: 0 0 100px;
  }

  &:nth-of-type(5) {
    flex: 0 0 180px;
  }
`;

type RulesProps = {
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
}: RulesProps) => {
  const [optionToggle, setOptionToggle] = useState('');

  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {COLUMNS.map(({ label, sortBy }) => (
          <RulesTableCol
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
          </RulesTableCol>
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
              <RulesTableCol>
                <Text title={categoryName}>
                  {categoryId} | {categoryName}
                </Text>
              </RulesTableCol>
              <RulesTableCol>
                <Toggle checked={isEnabled} onChange={() => {}} />
              </RulesTableCol>
              <RulesTableCol>
                <TableDateContainer>
                  <Text>
                    {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                  </Text>
                  <Text style={{ fontSize: '0.7em' }}>{lastChanged.user}</Text>
                </TableDateContainer>
              </RulesTableCol>
              <RulesTableCol style={{ padding: '12px 0 16px' }}>
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
              </RulesTableCol>
            </TableRow>
          );
        }
      )}
    </TableContainer>
  );
};
