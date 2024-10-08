import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import { useOnOutsideClick } from '@/libs/hooks';

import { format } from 'date-fns';

import { Button } from '../buttons/button/button';
import { Toggle } from '../toggle/toggle';
import { Text, Title } from '../typography/typography.styles';
import { mediaQuery } from '../utils/media-query';
import { spacing } from '../utils/spacing';
import {
  TableActions,
  TableActionsButton,
  TableCol,
  TableContainer,
  TableDropdown,
  TableHeading,
  TableOptionButton,
  TableRow,
} from './table.styles';

export const Row = styled(TableRow)<{
  numColumns: number;
}>`
  grid-template-columns: minmax(140px, 2fr) 90px 120px 150px 130px;
  min-height: 83px;

  ${mediaQuery('xxl')} {
    ${({ numColumns }) =>
      `grid-template-columns: ${
        numColumns === 6 &&
        'minmax(140px, 2fr) minmax(140px, 2fr) 90px 120px 150px 130px;'
      };`}
  }

  ${mediaQuery('xxxl')} {
    ${({ numColumns }) =>
      `grid-template-columns: ${
        numColumns === 6 &&
        'minmax(140px, 2fr) minmax(140px, 2fr) 90px 120px 150px 130px;'
      };`}
  }
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

export const FirstColumn = styled(TableCol)`
  display: flex;
  flex-direction: column;

  ${mediaQuery('xxl')} {
    p:not(:first-of-type) {
      display: none;
    }
  }
`;

const BreadcrumbColumn = styled(TableCol)`
  display: none;

  ${mediaQuery('xxl')} {
    display: block;
  }
`;

const DynamicTableCol = styled(TableCol)`
  &[data-heading='Breadcrumb'] {
    display: none;

    ${mediaQuery('xxl')} {
      display: block;
    }
  }
`;

const StyledUrlText = styled(Text)`
  padding-top: ${spacing(1)};
  font-style: italic;
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
  categoryPlpUrl?: string | undefined;
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

  const onClose = () => {
    setOptionToggle('');
  };

  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: onClose,
  });

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && optionToggle !== '') {
      setOptionToggle('');
    }
  };

  const handleOptionToggle = (id: string) => {
    setOptionToggle(optionToggle === id ? '' : id);
  };

  return (
    <>
      <TableContainer>
        <Row
          style={{ color: '#8a8a8a', fontSize: '0.9em' }}
          numColumns={headings.length}
        >
          {headings.map((heading) => (
            <DynamicTableCol key={heading} data-heading={heading}>
              <TableHeading as="p" isStrong={true}>
                {heading}
              </TableHeading>
            </DynamicTableCol>
          ))}
        </Row>

        {rows.map(
          ({
            id,
            identifier,
            isEnabled,
            lastChanged,
            onToggle,
            url,
            categoryPlpUrl,
          }: Row) => {
            const isOptionDropdownOpen = optionToggle === id;
            return (
              <Row key={id} numColumns={headings.length}>
                <FirstColumn>
                  <Text
                    title={identifier}
                    dangerouslySetInnerHTML={{ __html: identifier }}
                  />
                  {categoryPlpUrl && (
                    <StyledUrlText
                      title={categoryPlpUrl}
                      dangerouslySetInnerHTML={{ __html: categoryPlpUrl }}
                    />
                  )}
                </FirstColumn>
                {headings.filter((heading) => heading === 'Breadcrumb').length >
                  0 && (
                  <BreadcrumbColumn>
                    {categoryPlpUrl && (
                      <StyledUrlText
                        title={categoryPlpUrl}
                        dangerouslySetInnerHTML={{ __html: categoryPlpUrl }}
                      />
                    )}
                  </BreadcrumbColumn>
                )}
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
                  <TableActions
                    onKeyDown={handleOnKeyDown}
                    ref={dropdownWrapperRef}
                  >
                    <TableActionsButton href={url}>Edit</TableActionsButton>
                    <TableOptionButton
                      isOpen={isOptionDropdownOpen}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          handleOptionToggle(id);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleOptionToggle(id);
                      }}
                      title="More options"
                    />
                    {isOptionDropdownOpen && (
                      <TableDropdown
                        title="Delete"
                        onMouseDown={() => {
                          setRuleSetIdToDelete(id);
                          setIsModalOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setRuleSetIdToDelete(id);
                            setIsModalOpen(true);
                          }
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
