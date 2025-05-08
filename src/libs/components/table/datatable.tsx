import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal, Skeleton } from '@mantine/core';

import { useOnOutsideClick } from '@/libs/hooks';

import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '../buttons/button/button';
import { Menu } from '../dropdowns/dropdown.styles';
import { Toggle } from '../toggle/toggle';
import { Header3, Text } from '../typography/typography.styles';
import { formatCategoriesInfo } from '../utils/format-categories-info';
import { mediaQuery } from '../utils/media-query';
import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';
import { TableLink } from './table.styles';
import {
  DropdownOptions,
  TableActions,
  TableCol,
  TableContainer,
  TableDropdown,
  TableHeading,
  TableRow,
} from './table.styles';

const totalOfAllPossibleColumns = [
  'Identifier',
  'Breadcrumb',
  'Schedule',
  'Influence',
  'Enable',
  'Last Changed',
  'User',
  'Actions',
].length;

const Row = styled(TableRow)<{
  numColumns: number;
  showBreadcrumbColumn?: boolean;
}>`
  grid-template-columns: minmax(140px, 2fr) 90px 90px 120px 150px 130px;
  min-height: 83px;

  ${mediaQuery('xxl')} {
    ${({ numColumns, showBreadcrumbColumn }) =>
      `grid-template-columns: ${
        ((numColumns === totalOfAllPossibleColumns - 1 &&
          showBreadcrumbColumn) ||
          numColumns === totalOfAllPossibleColumns) &&
        'minmax(140px, 2fr) minmax(120px, 2fr) 90px 90px 120px 150px 130px;'
      };`}
  }

  ${mediaQuery('xxxl')} {
    ${({ numColumns }) => {
      if (numColumns === totalOfAllPossibleColumns - 1) {
        return 'grid-template-columns: minmax(140px, 2fr) minmax(140px, 2fr) 90px 90px 120px 150px 130px;';
      }
      if (numColumns === totalOfAllPossibleColumns) {
        return 'grid-template-columns: minmax(140px, 2fr) minmax(140px, 2fr) minmax(140px, 2fr) 90px 90px 120px 150px 130px;';
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

const FirstColumn = styled(TableCol)`
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

const ArrowContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: ${sizing(5)};
  box-sizing: border-box;
  cursor: pointer;
  border: none;
  background: none;
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
  onToggle?: ({ id }: { id: string }) => void;
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

export type DataTableProps = {
  basePath: string;
  headings: string[];
  onDeleteRuleSet: ({ id }: { id: string }) => void;
  onToggleRuleSet?: ({ id }: { id: string }) => void;
  rows: Row[];
  isLoading: boolean;
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  onDuplicate?: (id: string) => void;
  query?: string;
  writeEnabled: boolean;
  currentPageSize?: number;
};

export const DataTable = ({
  basePath,
  headings,
  onDeleteRuleSet,
  rows,
  ruleType,
  onDuplicate,
  onToggleRuleSet,
  query,
  writeEnabled,
  isLoading,
  currentPageSize,
}: DataTableProps) => {
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

  const formatByQuery = (identifier: string) =>
    identifier
      .split(new RegExp(`(${query})`, 'gi'))
      .map((word, ind) =>
        word.toLowerCase() === query?.toLowerCase() ? (
          <b key={`${word}-${ind}`}>{word}</b>
        ) : (
          word
        )
      );

  const editViewText = writeEnabled ? 'Edit' : 'View';

  return (
    <>
      <TableContainer
        data-testid={isLoading ? 'datatable-skeleton' : 'datatable'}
      >
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
        {isLoading
          ? Array.from({ length: Number(currentPageSize || 10) }).map(
              (_, index) => {
                return (
                  <Row
                    data-testid={`datatable-skeleton-row-${index}`}
                    key={`skeleton-row-${index}`}
                    numColumns={headings.length}
                  >
                    <FirstColumn aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </FirstColumn>
                    <BreadcrumbColumn aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </BreadcrumbColumn>
                    <SchedulingColumn aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </SchedulingColumn>
                    <TableCol aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </TableCol>
                    <TableCol aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </TableCol>
                    <TableCol aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </TableCol>
                    <TableCol aria-busy="true">
                      <Skeleton height={48} width={'100%'} />
                    </TableCol>
                    <TableCol
                      style={{ padding: '12px 0 16px' }}
                      aria-busy="true"
                    >
                      <Skeleton height={48} width={113.3} />
                    </TableCol>
                  </Row>
                );
              }
            )
          : rows.map(
              ({
                id,
                identifier,
                isEnabled,
                lastChanged,
                onToggle,
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
                  setRuleName(
                    setDuplicationName({ categoriesInfo, searchTerms })
                  );
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
                        <NoOverflowText title={identifier}>
                          {formatByQuery(identifier)}
                        </NoOverflowText>
                      </FlagAndIdentifier>
                      {categoryPlpUrl && (
                        <CompactUrlText title={categoryPlpUrl}>
                          {categoryPlpUrl}
                        </CompactUrlText>
                      )}
                      {startDate &&
                        headings.filter((heading) => heading === 'Schedule')
                          .length > 0 && (
                          <SchedulingDetailLeftSide>
                            <Image
                              alt=""
                              src="/trading-hub/asset/icon-calendar.svg"
                              width={24}
                              height={24}
                            />
                            <Text as="time">
                              {format(new Date(startDate), 'dd MMM yyyy')}
                              {endDate
                                ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                                : ' - No end date'}
                            </Text>
                          </SchedulingDetailLeftSide>
                        )}
                    </FirstColumn>
                    {headings.filter((heading) => heading === 'Breadcrumb')
                      .length > 0 && (
                      <BreadcrumbColumn>
                        {categoryPlpUrl && (
                          <StyledUrlText title={categoryPlpUrl}>
                            {categoryPlpUrl}
                          </StyledUrlText>
                        )}
                      </BreadcrumbColumn>
                    )}
                    {headings.filter((heading) => heading === 'Schedule')
                      .length > 0 && (
                      <SchedulingColumn>
                        {startDate ? (
                          <>
                            <Image
                              alt=""
                              src="/trading-hub/asset/icon-calendar.svg"
                              width={24}
                              height={24}
                            />
                            <Text>
                              {format(new Date(startDate), 'dd MMM yyyy')}
                              {endDate
                                ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                                : ' - No end date'}
                            </Text>
                          </>
                        ) : (
                          <Text>All time</Text>
                        )}
                      </SchedulingColumn>
                    )}
                    <TableCol>{countryCode?.replace('_', '/')}</TableCol>
                    <TableCol>
                      <Toggle
                        checked={isEnabled}
                        disabled={!writeEnabled}
                        onChange={() => {
                          if (onToggleRuleSet) {
                            onToggleRuleSet({ id });
                          }
                          if (onToggle) {
                            onToggle({ id });
                          }
                        }}
                      />
                    </TableCol>
                    <TableCol>
                      <Text>
                        {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                      </Text>
                    </TableCol>
                    <TableCol>
                      <Text>{formatByQuery(lastChanged.user)}</Text>
                    </TableCol>
                    <TableCol style={{ padding: '12px 0 0' }}>
                      <TableActions onKeyDown={handleOnKeyDown}>
                        <ArrowContainer
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
                        >
                          <Menu />
                        </ArrowContainer>
                        {isOptionDropdownOpen && (
                          <DropdownOptions ref={dropdownWrapperRef}>
                            {ruleType !== 'redirect' && (
                              <>
                                <TableLink
                                  href={`${basePath}/rulesets/edit/${id}`}
                                >
                                  {editViewText} ranking rule
                                </TableLink>
                                <TableLink
                                  href={`${basePath}/facets/edit/${id}`}
                                >
                                  {editViewText} facet rule
                                </TableLink>
                              </>
                            )}
                            {ruleType === 'redirect' && (
                              <TableLink href={`/search/redirects/edit/${id}`}>
                                {editViewText} redirect rule
                              </TableLink>
                            )}
                            {writeEnabled && (
                              <TableDropdown
                                title="Delete"
                                onMouseDown={onConfirmDelete}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onConfirmDelete();
                                  }
                                }}
                                data-testid="Delete rule via dropdown"
                              >
                                Delete
                              </TableDropdown>
                            )}
                            {writeEnabled && !!onDuplicate && (
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
                      {startDate && (
                        <>
                          <Image
                            alt=""
                            src="/trading-hub/asset/icon-calendar.svg"
                            width={24}
                            height={24}
                          />
                          <Text as="time">
                            {format(new Date(startDate), 'dd MMM yyyy')}
                            {endDate
                              ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                              : ' - No end date'}
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
        role="dialog"
        aria-modal="true"
        aria-label={`Modal to confirm ${ruleSetEditOption === 'delete' ? 'deleting of rule' : 'duplicating of rule'}`}
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
                  data-testid="Delete rule"
                  data-autofocus
                  data-umami-event={`delete-${ruleType}-rule`}
                  data-umami-event-ruleset={ruleSetIdToEdit}
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
                  data-autofocus
                  data-umami-event={`create-duplicate-${ruleType}-rule`}
                  data-umami-event-ruleset={ruleSetIdToEdit}
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
