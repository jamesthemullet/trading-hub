import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import { useOnOutsideClick } from '@/libs/hooks';

import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '../buttons/button/button';
import { Toggle } from '../toggle/toggle';
import { Header3, Text } from '../typography/typography.styles';
import { formatCategoriesInfo } from '../utils/format-categories-info';
import { mediaQuery } from '../utils/media-query';
import { spacing } from '../utils/spacing';
import {
  DropdownOptions,
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
  showBreadcrumbColumn?: boolean;
}>`
  grid-template-columns: minmax(140px, 2fr) 90px 120px 150px 130px;
  min-height: 83px;

  ${mediaQuery('xxl')} {
    ${({ numColumns, showBreadcrumbColumn }) =>
      `grid-template-columns: ${
        ((numColumns === 6 && showBreadcrumbColumn) || numColumns === 7) &&
        'minmax(140px, 2fr) minmax(140px, 2fr) 90px 120px 150px 130px;'
      };`}
  }

  ${mediaQuery('xxxl')} {
    ${({ numColumns }) => {
      if (numColumns === 6) {
        return 'grid-template-columns: minmax(140px, 2fr) minmax(140px, 2fr) 90px 120px 150px 130px;';
      }
      if (numColumns === 7) {
        return 'grid-template-columns: minmax(140px, 2fr) minmax(140px, 2fr) minmax(140px, 2fr) 90px 120px 150px 130px;';
      }
      return '';
    }}
  }
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: end;
  margin-right: ${spacing(2)};
  margin-bottom: ${spacing(1)};
  align-items: end;

  img {
    margin-right: ${spacing(1)};
  }

  ${mediaQuery('xxl')} {
    display: none;
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

  &[data-heading='Schedule'] {
    display: none;

    ${mediaQuery('xxxl')} {
      display: block;
    }
  }
`;

const StyledUrlText = styled(Text)`
  padding-top: ${spacing(1)};
  font-style: italic;
`;

const CompactUrlText = styled(StyledUrlText)`
  ${mediaQuery('xxxl')} {
    display: none;
  }
`;

const SchedulingDetailLeftSide = styled.div`
  display: none;

  ${mediaQuery('xxl')} {
    display: flex;
    align-items: end;
    padding-top: ${spacing(1)};

    img {
      margin-right: ${spacing(1)};
    }
  }

  ${mediaQuery('xxxl')} {
    display: none;
  }
`;

const SchedulingColumn = styled(TableCol)`
  display: none;

  ${mediaQuery('xxxl')} {
    display: flex;
    align-items: center;

    img {
      margin-right: ${spacing(1)};
    }
  }
`;

const FlagAndIdentifier = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-right: ${spacing(1)};
  }
`;

const NoOverflowText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  categoriesInfo?: Array<{
    id: string;
    name?: string;
    plpUrl?: string;
  }>;
  categoryPlpUrl?: string | undefined;
  searchTerms?: string[];
  startDate?: string;
  endDate?: string;
  countryCode?: string;
};

type Props = {
  headings: string[];
  onDeleteRuleSet: ({ id }: { id: string }) => void;
  rows: Row[];
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  onDuplicate?: (id: string) => void;
};

export const DataTable = ({
  headings,
  onDeleteRuleSet,
  rows,
  ruleType,
  onDuplicate,
}: Props) => {
  const [optionToggle, setOptionToggle] = useState('');
  const [ruleSetIdToEdit, setRuleSetIdToEdit] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [ruleSetEditOption, setRuleSetEditOption] = useState<
    'delete' | 'duplicate'
  >('delete');
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

  const showBreadcrumbColumn =
    headings.filter((heading) => heading === 'Breadcrumb').length > 0;

  const setDuplicationName = ({
    categoriesInfo,
    searchTerms,
  }: Pick<Row, 'categoriesInfo' | 'searchTerms'>) => {
    if (ruleType === 'categoryRanking' && categoriesInfo) {
      const firstThree = [...categoriesInfo].slice(0, 3);
      return `${formatCategoriesInfo(firstThree)}${categoriesInfo.length > 3 ? ' [...]' : ''}`;
    }
    if (
      (ruleType === 'redirect' || ruleType === 'searchRanking') &&
      searchTerms
    ) {
      return `${searchTerms.slice(0, 3).join(', ')}${searchTerms.length > 3 ? ' [...]' : ''}`;
    }
    return 'rule';
  };

  return (
    <>
      <TableContainer>
        <Row
          style={{ color: '#8a8a8a', fontSize: '0.9em' }}
          numColumns={headings.length}
          showBreadcrumbColumn={showBreadcrumbColumn}
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
            categoriesInfo,
            searchTerms,
            startDate,
            endDate,
            countryCode,
          }: Row) => {
            const isOptionDropdownOpen = optionToggle === id;

            const onConfirmDelete = () => {
              setRuleSetIdToEdit(id);
              setRuleSetEditOption('delete');
              setIsModalOpen(true);
            };

            const onConfirmDuplicate = () => {
              setRuleSetIdToEdit(id);
              setRuleSetEditOption('duplicate');
              setRuleName(setDuplicationName({ categoriesInfo, searchTerms }));
              setIsModalOpen(true);
            };

            const getFlagFromCountryCode = (
              countryCode: string | undefined
            ): { flags: string; alt: string }[] => {
              const createFlagObject = (code: string) => ({
                flags: `/trading-hub/asset/icon-${code.toLowerCase()}-flag.svg`,
                alt: `${code} rule`,
              });

              switch (countryCode) {
                case 'UK':
                case 'IE':
                  return [createFlagObject(countryCode)];
                case 'UK_IE':
                  return [createFlagObject('UK'), createFlagObject('IE')];
                default:
                  return [];
              }
            };

            return (
              <Row
                key={id}
                numColumns={headings.length}
                showBreadcrumbColumn={showBreadcrumbColumn}
              >
                <FirstColumn>
                  <FlagAndIdentifier>
                    {countryCode && (
                      <>
                        {getFlagFromCountryCode(countryCode).map(
                          ({ flags, alt }, index) => (
                            <Image
                              key={index}
                              src={flags}
                              width={20}
                              height={20}
                              alt={alt}
                            />
                          )
                        )}
                      </>
                    )}
                    <NoOverflowText
                      title={identifier}
                      dangerouslySetInnerHTML={{ __html: identifier }}
                    />
                  </FlagAndIdentifier>
                  {categoryPlpUrl && (
                    <CompactUrlText
                      title={categoryPlpUrl}
                      dangerouslySetInnerHTML={{ __html: categoryPlpUrl }}
                    />
                  )}
                  {startDate &&
                    endDate &&
                    headings.filter((heading) => heading === 'Schedule')
                      .length > 0 && (
                      <SchedulingDetailLeftSide>
                        <Image
                          alt=""
                          src={`/trading-hub/asset/icon-calendar.svg`}
                          width={24}
                          height={24}
                        />
                        <Text as="time">
                          {format(new Date(startDate), 'dd MMM yyyy')} -{' '}
                          {format(new Date(endDate), 'dd MMM yyyy')}
                        </Text>
                      </SchedulingDetailLeftSide>
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
                {headings.filter((heading) => heading === 'Schedule').length >
                  0 && (
                  <SchedulingColumn>
                    {startDate && endDate ? (
                      <>
                        <Image
                          alt=""
                          src={`/trading-hub/asset/icon-calendar.svg`}
                          width={24}
                          height={24}
                        />
                        <Text>
                          {format(new Date(startDate), 'dd MMM yyyy')} -{' '}
                          {format(new Date(endDate), 'dd MMM yyyy')}
                        </Text>
                      </>
                    ) : (
                      <Text>All time</Text>
                    )}
                  </SchedulingColumn>
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
                <TableCol style={{ padding: '12px 0 0' }}>
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
                      <DropdownOptions>
                        <TableDropdown
                          title="Delete"
                          onMouseDown={onConfirmDelete}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onConfirmDelete();
                            }
                          }}
                        >
                          Delete
                        </TableDropdown>
                        {!!onDuplicate && (
                          <TableDropdown
                            title="Duplicate"
                            onMouseDown={onConfirmDuplicate}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onConfirmDuplicate();
                              }
                            }}
                          >
                            Duplicate
                          </TableDropdown>
                        )}
                      </DropdownOptions>
                    )}
                  </TableActions>
                </TableCol>
                <FullWidthRow>
                  {startDate && endDate && (
                    <>
                      <Image
                        alt=""
                        src={`/trading-hub/asset/icon-calendar.svg`}
                        width={24}
                        height={24}
                      />
                      <Text as="time">
                        {format(new Date(startDate), 'dd MMM yyyy')} -{' '}
                        {format(new Date(endDate), 'dd MMM yyyy')}
                      </Text>
                    </>
                  )}
                </FullWidthRow>
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
            <Header3>
              {ruleSetEditOption === 'delete'
                ? 'Do you want to delete this rule?'
                : `Create a duplicate ${ruleType === 'redirect' ? 'redirect' : ''} rule`}
            </Header3>

            {ruleSetEditOption === 'duplicate' && (
              <>
                <Text withMargin>
                  Are you sure you want to create a duplicate of {ruleName}?
                </Text>
                <Text>
                  This duplicate will supersede the current rule when it becomes
                  active.
                </Text>
              </>
            )}

            <Divider />

            <Buttons>
              <Button onClick={() => setIsModalOpen(false)} theme="tertiary">
                Cancel
              </Button>

              {ruleSetEditOption === 'delete' && (
                <Button
                  onClick={() => {
                    onDeleteRuleSet({ id: ruleSetIdToEdit });
                    setIsModalOpen(false);
                    setOptionToggle('');
                  }}
                  theme="tertiary"
                  aria-label="Delete rule"
                  data-autofocus
                >
                  Delete
                </Button>
              )}

              {ruleSetEditOption === 'duplicate' && onDuplicate && (
                <Button
                  onClick={() => {
                    onDuplicate(ruleSetIdToEdit);
                    setIsModalOpen(false);
                    setOptionToggle('');
                  }}
                  theme="tertiary"
                  aria-label="Duplicate rule"
                  data-autofocus
                >
                  Confirm
                </Button>
              )}
            </Buttons>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
