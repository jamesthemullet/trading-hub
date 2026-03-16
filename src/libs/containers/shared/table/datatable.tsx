import { useState } from 'react';
import { Modal, Skeleton } from '@mantine/core';

import { Button } from '@/libs/components';
import { Toggle } from '@/libs/components/toggle/toggle';
import { Typography } from '@/libs/components/typography/typography';
import {
  getFacetRoute,
  getHistoryRoute,
  getRulesetEditRoute,
  ROUTES,
} from '@/libs/constants/routes';
import { useOnOutsideClick } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';
import { formatCategoriesInfo } from '@/libs/utils/format-categories-info';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';
import { getFlagFromCountryCode } from '@/libs/utils/get-flag-from-country-code';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import styles from './table.module.css';

type Row = {
  id: string;
  identifier: string;
  isEnabled: boolean;
  lastChanged: {
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
  onDuplicate: (id: string) => void;
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
      .split(
        new RegExp(`(${query?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      )
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
      <div data-testid={isLoading ? 'datatable-skeleton' : 'datatable'}>
        <div
          className={styles.row}
          data-num-columns={headings.length}
          data-show-breadcrumb={showBreadcrumbColumn}
        >
          {headings.map((heading) => (
            <div
              key={heading}
              className={styles.dynamicTableCol}
              data-heading={heading}
            >
              <Typography isStrong variant="bodySmall">
                {heading}
              </Typography>
            </div>
          ))}
        </div>
        {isLoading
          ? Array.from({ length: Number(currentPageSize || 10) }).map(
              (_, index) => {
                return (
                  <div
                    className={styles.row}
                    data-testid={`datatable-skeleton-row-${index}`}
                    key={`skeleton-row-${index}`}
                    data-num-columns={headings.length}
                  >
                    <div className={styles.firstColumn} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.breadcrumbColumn} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.schedulingColumn} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.tableCol} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.tableCol} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.tableCol} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.tableCol} aria-busy="true">
                      <Skeleton height={48} width="100%" />
                    </div>
                    <div className={styles.tableCol} aria-busy="true">
                      <Skeleton height={48} width={113.3} />
                    </div>
                  </div>
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

                const formattedIdentifier = formatHTMLStrings(identifier)!;

                return (
                  <div
                    className={styles.row}
                    key={id}
                    data-num-columns={headings.length}
                    data-show-breadcrumb={showBreadcrumbColumn}
                  >
                    <div className={styles.firstColumn}>
                      <div className={styles.flagAndIdentifier}>
                        {countryCode &&
                          getFlagFromCountryCode(countryCode).map(
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
                        <Typography
                          as="span"
                          variant="bodySmall"
                          className={styles.noOverflowText}
                        >
                          {formatByQuery(formattedIdentifier)}
                        </Typography>
                      </div>
                      {categoryPlpUrl && (
                        <Typography
                          as="span"
                          variant="bodySmall"
                          className={styles.compactUrlText}
                        >
                          {categoryPlpUrl}
                        </Typography>
                      )}
                      {startDate &&
                        headings.filter((heading) => heading === 'Schedule')
                          .length > 0 && (
                          <div className={styles.schedulingDetailLeftSide}>
                            <Image
                              alt=""
                              src="/trading-hub/asset/icon-calendar.svg"
                              width={24}
                              height={24}
                            />
                            <Typography as="span" variant="bodyMedium">
                              {format(new Date(startDate), 'dd MMM yyyy')}
                              {endDate
                                ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                                : ' - No end date'}
                            </Typography>
                          </div>
                        )}
                    </div>
                    {headings.filter((heading) => heading === 'Breadcrumb')
                      .length > 0 && (
                      <div className={styles.breadcrumbColumn}>
                        {categoryPlpUrl && (
                          <span title={categoryPlpUrl}>
                            <Typography
                              as="span"
                              variant="bodySmall"
                              className={styles.styledUrlText}
                            >
                              {categoryPlpUrl}
                            </Typography>
                          </span>
                        )}
                      </div>
                    )}
                    {headings.filter((heading) => heading === 'Schedule')
                      .length > 0 && (
                      <div className={styles.schedulingColumn}>
                        {startDate ? (
                          <>
                            <Image
                              alt=""
                              src="/trading-hub/asset/icon-calendar.svg"
                              width={24}
                              height={24}
                            />
                            <Typography as="span" variant="bodySmall">
                              {format(new Date(startDate), 'dd MMM yyyy')}
                              {endDate
                                ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                                : ' - No end date'}
                            </Typography>
                          </>
                        ) : (
                          <Typography as="span" variant="bodyMedium">
                            All time
                          </Typography>
                        )}
                      </div>
                    )}
                    <div className={styles.tableCol}>
                      {countryCode?.replace('_', '/')}
                    </div>
                    <div className={styles.tableCol}>
                      <Toggle
                        checked={isEnabled}
                        disabled={!writeEnabled}
                        onChange={() => {
                          track({
                            event: `Toggle ${ruleType} ruleset to ${!isEnabled}`,
                          });
                          if (onToggleRuleSet) {
                            onToggleRuleSet({ id });
                          }
                          if (onToggle) {
                            onToggle({ id });
                          }
                        }}
                      />
                    </div>
                    <div className={styles.tableCol}>
                      <Typography as="span" variant="bodySmall">
                        {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                      </Typography>
                    </div>
                    <div className={styles.tableCol}>
                      <Typography as="span" variant="bodySmall">
                        {formatByQuery(lastChanged.user)}
                      </Typography>
                    </div>
                    <div className={styles.tableCol}>
                      <div className={styles.tableActions}>
                        <Button
                          appearance="icon"
                          onKeyDown={(e) => {
                            // istanbul ignore else
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              handleOptionToggle(id);
                            }
                            if (e.key === 'Escape' && optionToggle !== '') {
                              setOptionToggle('');
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleOptionToggle(id);
                          }}
                          aria-label="More options"
                          title="More options"
                        >
                          <span className={styles.menuButton} />
                        </Button>
                        {isOptionDropdownOpen && (
                          <div
                            className={styles.dropdownOptions}
                            ref={dropdownWrapperRef}
                          >
                            {ruleType !== 'redirect' && (
                              <>
                                <Link
                                  className={styles.tableLink}
                                  href={getRulesetEditRoute(ruleType, id)}
                                  onClick={() =>
                                    track({
                                      event: `${editViewText} ${ruleType} ranking rule`,
                                    })
                                  }
                                >
                                  {editViewText} ranking rule
                                </Link>
                                <Link
                                  className={styles.tableLink}
                                  href={getFacetRoute(
                                    basePath.replace('/', '') as
                                      | 'category'
                                      | 'search'
                                      | 'global',
                                    'edit',
                                    id
                                  )}
                                  onClick={() =>
                                    track({
                                      event: `${editViewText} ${ruleType} facet rule`,
                                    })
                                  }
                                >
                                  {editViewText} facet rule
                                </Link>
                              </>
                            )}
                            {ruleType === 'redirect' && (
                              <Link
                                className={styles.tableLink}
                                href={ROUTES.SEARCH.REDIRECTS.EDIT(id)}
                                onClick={() =>
                                  track({
                                    event: `${editViewText} ${ruleType} rule`,
                                  })
                                }
                              >
                                {editViewText} redirect rule
                              </Link>
                            )}
                            <Link
                              className={styles.tableLink}
                              title="view history"
                              href={getHistoryRoute(
                                ruleType,
                                id,
                                formattedIdentifier
                              )}
                            >
                              View history
                            </Link>
                            {writeEnabled && (
                              <Button
                                className={styles.tableDropdown}
                                appearance="plain"
                                type="button"
                                title="Delete"
                                onMouseDown={onConfirmDelete}
                                onKeyDown={(e) => {
                                  // istanbul ignore else
                                  if (e.key === 'Enter') {
                                    onConfirmDelete();
                                  }
                                }}
                                data-testid="Delete rule via dropdown"
                              >
                                Delete
                              </Button>
                            )}
                            {writeEnabled && !!onDuplicate && (
                              <Button
                                className={styles.tableDropdown}
                                appearance="plain"
                                type="button"
                                onMouseDown={onConfirmDuplicate}
                                onKeyDown={(e) => {
                                  // istanbul ignore else
                                  if (e.key === 'Enter') {
                                    onConfirmDuplicate();
                                  }
                                }}
                              >
                                Duplicate
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {startDate && (
                      <div className={styles.fullWidthRow}>
                        <Image
                          alt=""
                          src="/trading-hub/asset/icon-calendar.svg"
                          width={24}
                          height={24}
                        />
                        <Typography as="time" variant="bodySmall">
                          {format(new Date(startDate), 'dd MMM yyyy')}
                          {endDate
                            ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                            : ' - No end date'}
                        </Typography>
                      </div>
                    )}
                  </div>
                );
              }
            )}
      </div>

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
        <Modal.Content
          aria-label={`Modal to confirm ${ruleSetEditOption === 'delete' ? 'deleting of rule' : 'duplicating of rule'}`}
        >
          <Modal.Body>
            <Typography as="h2" withMargin variant="bodyMedium">
              {ruleSetEditOption === 'delete'
                ? 'Do you want to delete this rule?'
                : `Create a duplicate ${ruleType === 'redirect' ? 'redirect' : ''} rule`}
            </Typography>

            {ruleSetEditOption === 'duplicate' && (
              <>
                <Typography withMargin variant="bodyMedium">
                  Are you sure you want to create a duplicate of {ruleName}?
                </Typography>
                <Typography variant="bodyMedium">
                  This duplicate will supersede the current rule when it becomes
                  active.
                </Typography>
              </>
            )}

            <span className={styles.divider} />

            <div className={styles.buttons}>
              <Button
                onClick={() => setIsModalOpen(false)}
                theme="tertiary"
                isInline
              >
                Cancel
              </Button>

              {ruleSetEditOption === 'delete' && (
                <Button
                  onClick={() => {
                    onDeleteRuleSet({ id: ruleSetIdToEdit });
                    setIsModalOpen(false);
                    setOptionToggle('');
                    track({ event: `Delete ${ruleType} ruleset` });
                  }}
                  theme="tertiary"
                  data-testid="Delete rule"
                  data-autofocus
                  isInline
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
                    track({ event: `Duplicate ${ruleType} ruleset` });
                  }}
                  theme="tertiary"
                  data-autofocus
                  isInline
                >
                  Confirm
                </Button>
              )}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
