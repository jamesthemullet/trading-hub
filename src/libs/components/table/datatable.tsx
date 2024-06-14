import { useState } from 'react';
import { Modal } from '@mantine/core';
import { format } from 'date-fns';

import { Toggle } from '../toggle/toggle';
import { Text, Title } from '../typography/typography.styles';
import {
  TableContainer,
  TableRow,
  TableCol,
  TableActions,
  TableOptionButton,
  TableDropdown,
  TableHeading,
  TableActionsButton,
} from './table.styles';
import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Button } from '../buttons/button/button';

const Row = styled(TableRow)`
  grid-template-columns: minmax(240px, 2fr) 90px 120px 150px 130px;
`;

const Divider = styled.span`
  border-bottom: solid 1px #000;
  width: 100%;
  display: inline-block;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

type Row = {
  id: string;
  identifier: string;
  isEnabled: boolean;
  lastChanged: {
    /** @format date-time */
    date: string;
    user: string;
  };
  onToggle: ({ id }: { id: string }) => void;
  url: string;
};

type Props = {
  headings: string[];
  onDeleteRuleSet: ({ id }: { id: string }) => void;
  rows: Row[];
};

export const DataTable = ({ headings, onDeleteRuleSet, rows }: Props) => {
  const [optionToggle, setOptionToggle] = useState('');
  const [ruleSetIdToDelete, setRuleSetIdToDelete] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <TableContainer>
        <Row style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
          {headings.map((heading) => (
            <TableCol key={heading}>
              <TableHeading as="p" isStrong={true}>
                {heading}
              </TableHeading>
            </TableCol>
          ))}
        </Row>

        {rows.map(
          ({ id, identifier, isEnabled, lastChanged, onToggle, url }: Row) => {
            const isOptionDropdownOpen = optionToggle === id;
            return (
              <Row key={id}>
                <TableCol>
                  <Text title={identifier}>{identifier}</Text>
                </TableCol>
                <TableCol>
                  <Toggle
                    checked={isEnabled}
                    onChange={() => {
                      onToggle({ id });
                    }}
                  />
                </TableCol>
                <TableCol>
                  <Text>
                    {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                  </Text>
                </TableCol>
                <TableCol>
                  <Text>{lastChanged.user}</Text>
                </TableCol>
                <TableCol style={{ padding: '12px 0 16px' }}>
                  <TableActions>
                    <TableActionsButton href={url}>Edit</TableActionsButton>
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
                        onClick={() => {
                          setRuleSetIdToDelete(id);
                          setIsModalOpen(true);
                        }}
                      >
                        Delete
                      </TableDropdown>
                    )}
                  </TableActions>
                </TableCol>
              </Row>
            );
          }
        )}
      </TableContainer>
      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsModalOpen(false)
        }
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <Title>Do you want to delete this rule?</Title>

            <Divider />

            <Buttons>
              <Button
                aria-label="Cancel delete"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  onDeleteRuleSet({ id: ruleSetIdToDelete });
                  setIsModalOpen(false);
                  setOptionToggle('');
                }}
                theme="primary"
                aria-label="Delete rule"
              >
                Delete
              </Button>
            </Buttons>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
