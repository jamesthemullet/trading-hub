import { useState } from 'react';

import styled from '@emotion/styled';
import { format } from 'date-fns';

import { Toggle } from '../toggle/toggle';
import type { ReturnedRuleSet } from '@/libs/api';
import { spacing } from '../utils/spacing';
import { Label, Text } from '../typography/typography.styles';

type Props = {
  columnOrderName: keyof ReturnedRuleSet;
  columnSortOrder: 'asc' | 'desc';
  onDeleteRuleSet: ({ rulesetId }: { rulesetId: string }) => void;
  onColumnOrderChange: (columnId: keyof ReturnedRuleSet) => void;
  rules: ReturnedRuleSet[];
};

const Container = styled.div`
  margin: ${spacing(2)} 0;
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #b1b1b1;

  &:first-of-type {
    position: sticky;
    z-index: 1;
    top: 70px;
    background: #fff;
  }
`;

const Col = styled.div`
  text-overflow: ellipsis;
  flex: 0 0 150px;
  display: flex;
  flex-direction: row;
  padding: ${spacing(3)} ${spacing(1)} ${spacing(0.5)};

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

  p {
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    text-wrap: nowrap;
    width: 100%;
  }
`;

const RuleSetHeading = styled(Label)`
  color: #1d1d1b;
  font-weight: bold;
`;

const EditButton = styled.a`
  border: none;
  color: #000;
  background-color: #f5f5f5;
  transition: background-color 0.1s ease-in;
  text-decoration: none;
  padding: 12px 16px;
  width: 100%;

  &:hover {
    background-color: #e3e3e3;
  }
`;

const ORDER_TO_COLOR = [
  {
    asc: '#bbb',
    desc: '#666',
    unsorted: '#bbb',
  },
  {
    asc: '#666',
    desc: '#bbb',
    unsorted: '#bbb',
  },
];

const ColumnOrder = styled.div<{ order: 'asc' | 'desc' | 'unsorted' }>`
  position: relative;
  ::before,
  ::after {
    border: 4px solid transparent;
    content: '';
    display: block;
    height: 0;
    right: 5px;
    top: 50%;
    position: absolute;
    width: 0;
  }

  ::before {
    border-bottom-color: ${({ order }) => ORDER_TO_COLOR[0][order]};
    margin-top: -9px;
  }

  ::after {
    border-top-color: ${({ order }) => ORDER_TO_COLOR[1][order]};
    margin-top: 1px;
  }
`;

const DateContainer = styled.div`
  margin-top: 0;

  p {
    line-height: 1;
  }
`;

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

const OptionButton = styled.button<{ isOpen: boolean }>`
  position: relative;
  width: 50px;
  border: none;
  border-radius: 0;
  background-color: #f5f5f5;
  transition: background-color 0.1s ease-in;
  border-left: solid 1px #999;

  &::before {
    border: 4px solid transparent;
    border-bottom-color: ${({ isOpen }) => isOpen && '#000'};
    border-top-color: ${({ isOpen }) => !isOpen && '#000'};
    content: '';
    display: block;
    height: 0;
    right: 15px;
    top: ${({ isOpen }) => (isOpen ? '35%' : '23px')};
    position: absolute;
    width: 0;
  }

  &:hover {
    background-color: #e3e3e3;
  }
`;

const Actions = styled.div`
  position: relative;
  display: flex;
`;

const Dropdown = styled.button`
  position: absolute;
  top: 47px;
  background-color: #f5f5f5;
  width: 100%;
  padding: ${spacing(2)};
  z-index: 1;
  border: none;
  border-top: solid 1px #999;
  box-shadow: #000 0 4px 2px -4px;
  font-family: inherit;
  font-size: inherit;
  text-align: left;

  &:hover,
  &:active {
    background-color: #e3e3e3;
  }
`;

export const Rules = ({
  rules,
  onColumnOrderChange,
  onDeleteRuleSet,
  columnOrderName,
  columnSortOrder,
}: Props) => {
  const [optionToggle, setOptionToggle] = useState('');

  return (
    <Container>
      <Row style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
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
            <RuleSetHeading as="p" isStrong={true}>
              {label}
            </RuleSetHeading>
            {sortBy && (
              <ColumnOrder
                order={
                  columnOrderName === sortBy ? columnSortOrder : 'unsorted'
                }
              />
            )}
          </Col>
        ))}
      </Row>
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
            <Row key={`rule-${id}`}>
              <Col>
                <Text title={categoryName}>
                  {categoryId} | {categoryName}
                </Text>
              </Col>
              <Col>
                <Toggle checked={isEnabled} onChange={() => {}} />
              </Col>
              <Col>
                <DateContainer>
                  <Text>
                    {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                  </Text>
                  <Text style={{ fontSize: '0.7em' }}>{lastChanged.user}</Text>
                </DateContainer>
              </Col>
              <Col style={{ padding: '12px 0 16px' }}>
                <Actions>
                  <EditButton href={`rules/edit/${id}`}>Edit</EditButton>
                  <OptionButton
                    isOpen={isOptionDropdownOpen}
                    onClick={() =>
                      setOptionToggle(isOptionDropdownOpen ? '' : id)
                    }
                    title="More options"
                  />
                  {isOptionDropdownOpen && (
                    <Dropdown
                      title="Delete"
                      onClick={() => onDeleteRuleSet({ rulesetId: id })}
                    >
                      Delete
                    </Dropdown>
                  )}
                </Actions>
              </Col>
            </Row>
          );
        }
      )}
    </Container>
  );
};
