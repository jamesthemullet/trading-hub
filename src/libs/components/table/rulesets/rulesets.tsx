import { useState } from 'react';

import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { MerchandisingRules, ReturnedRuleSet } from '@/libs/api';
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

const Col = styled(TableCol)`
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
  onEnableDisableRuleSet: (args: {
    categoryId: string;
    isEnabled: boolean;
    merchandisingRules: MerchandisingRules;
    ruleSetId: string;
  }) => void;
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

export const Rulesets = ({
  rules,
  onColumnOrderChange,
  onDeleteRuleSet,
  onEnableDisableRuleSet,
  columnOrderName,
  columnSortOrder,
}: RulesProps) => {
  const [optionToggle, setOptionToggle] = useState('');

  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {COLUMNS.map(({ label, sortBy }) => (
          <Col
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
          </Col>
        ))}
      </TableRow>
      {rules.map(
        ({
          categoryName,
          categoryId,
          id,
          lastChanged,
          isEnabled,
          rules,
        }: ReturnedRuleSet) => {
          const isOptionDropdownOpen = optionToggle === id;

          return (
            <TableRow key={`rule-${id}`}>
              <Col>
                <Text title={categoryName}>
                  {categoryId} | {categoryName}
                </Text>
              </Col>
              <Col>
                <Toggle
                  checked={isEnabled}
                  onChange={() => {
                    onEnableDisableRuleSet({
                      categoryId,
                      isEnabled: !isEnabled,
                      merchandisingRules: rules,
                      ruleSetId: id,
                    });
                  }}
                />
              </Col>
              <Col>
                <TableDateContainer>
                  <Text>
                    {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                  </Text>
                  <Text style={{ fontSize: '0.7em' }}>{lastChanged.user}</Text>
                </TableDateContainer>
              </Col>
              <Col style={{ padding: '12px 0 16px' }}>
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
              </Col>
            </TableRow>
          );
        }
      )}
    </TableContainer>
  );
};
