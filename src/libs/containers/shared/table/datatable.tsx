import type { ReactElement } from 'react';
import { useState } from 'react';
import { Modal, Skeleton } from '@mantine/core';

import { Button } from '@/libs/components';
import { Toggle } from '@/libs/components/toggle/toggle';
import { Typography } from '@/libs/components/typography/typography';
import {
  getFacetRoute,
  getHistoryRoute,
  ROUTES,
} from '@/libs/constants/routes';
import type { FacetType } from '@/libs/constants/rule-types';
import { RuleType } from '@/libs/constants/rule-types';
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
  ruleType: RuleType;
  onDuplicate: (id: string) => void;
  query?: string;
  isWriteEnabled: boolean;
  currentPageSize?: number;
  onToggleFavourite?: (id: string) => void;
  favouriteIds?: string[];
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
  isWriteEnabled,
  isLoading,
  currentPageSize,
  onToggleFavourite,
  favouriteIds = [],
}: DataTableProps): ReactElement => {
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

  const shouldShowBreadcrumbColumn = headings.includes('Breadcrumb');
  const shouldShowScheduleColumn = headings.includes('Schedule');

  const setDuplicationName = ({
    categoriesInfo,
    searchTerms,
  }: Pick<Row, 'categoriesInfo' | 'searchTerms'>) => {
    if (ruleType === RuleType.CategoryRanking && categoriesInfo) {
      const firstThree = [...categoriesInfo].slice(0, 3);
      return `${formatCategoriesInfo(firstThree)}${categoriesInfo.length > 3 ? ' [...]' : ''}`;
    }
    if (
      (ruleType === RuleType.Redirect || ruleType === RuleType.SearchRanking) &&
      searchTerms
    ) {
      return `${searchTerms.slice(0, 3).join(', ')}${searchTerms.length > 3 ? ' [...]' : ''}`;
    }
    return 'rule';
  };

  const formatByQuery = (identifier: string) => {
    const safeQuery = query?.toLowerCase();

    if (!safeQuery) {
      return identifier;
    }

    const words = identifier.split(
      new RegExp(`(${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );

    let cursor = 0;

    return words.map((word) => {
      const startPosition = identifier.indexOf(word, cursor);
      cursor = Math.max(cursor, startPosition + word.length);

      return word.toLowerCase() === safeQuery ? (
        <b key={`${word}-${startPosition}`}>{word}</b>
      ) : (
        word
      );
    });
  };

  const editViewText = isWriteEnabled ? 'Edit' : 'View';

  return (
    <>
      <div
        data-testid={isLoading ? 'datatable-skeleton' : 'datatable'}
        className={styles.dataTable}
      >
        <div
          className={styles.row}
          data-num-columns={headings.length}
          data-show-breadcrumb={shouldShowBreadcrumbColumn}
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
          ? Array.from(
              { length: Number(currentPageSize || 10) },
              (_, i) => `datatable-skeleton-row-${i}`
            ).map((rowId) => {
              return (
                <div
                  className={styles.row}
                  data-testid={rowId}
                  key={rowId}
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
            })
          : rows.map(
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
                const isRowFavourite = favouriteIds.includes(id);
                const favouriteActionLabel = isRowFavourite
                  ? 'Remove from favourites'
                  : 'Add to favourites';

                const handleFavouriteAction = (event: {
                  stopPropagation: () => void;
                }) => {
                  event.stopPropagation();
                  onToggleFavourite?.(id);
                };

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

                const formattedIdentifier = formatHTMLStrings(identifier);
                const toggleAriaLabel = `${
                  isEnabled ? 'Disable' : 'Enable'
                } ruleset ${formattedIdentifier}`;

                return (
                  <div
                    className={styles.row}
                    key={id}
                    data-num-columns={headings.length}
                    data-show-breadcrumb={shouldShowBreadcrumbColumn}
                  >
                    <div className={styles.firstColumn}>
                      <div className={styles.flagAndIdentifier}>
                        {countryCode &&
                          getFlagFromCountryCode(countryCode).map(
                            ({ flags, alt }) => (
                              <Image
                                key={flags}
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
                      {startDate && shouldShowScheduleColumn && (
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
                    {shouldShowBreadcrumbColumn && (
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
                    {shouldShowScheduleColumn && (
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
                        aria-label={toggleAriaLabel}
                        checked={isEnabled}
                        disabled={!isWriteEnabled}
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
                        {onToggleFavourite && (
                          <Button
                            appearance="icon"
                            aria-label={favouriteActionLabel}
                            title={favouriteActionLabel}
                            onMouseDown={handleFavouriteAction}
                            onKeyDown={
                              /* istanbul ignore next */
                              (e) => {
                                if (e.key === 'Enter') {
                                  handleFavouriteAction(e);
                                }
                              }
                            }
                          >
                            <span
                              aria-hidden="true"
                              className={
                                isRowFavourite
                                  ? styles.favouriteActive
                                  : styles.favourite
                              }
                            >
                              ★
                            </span>
                          </Button>
                        )}
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
                            {ruleType !== RuleType.Redirect && (
                              <>
                                <Link
                                  className={styles.tableLink}
                                  href={url}
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
                                    basePath.replace('/', '') as FacetType,
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
                            {ruleType === RuleType.Redirect && (
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
                            {isWriteEnabled && (
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
                            {isWriteEnabled && !!onDuplicate && (
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
            <Typography as="h2" hasMargin variant="bodyMedium">
              {ruleSetEditOption === 'delete'
                ? 'Do you want to delete this rule?'
                : `Create a duplicate ${ruleType === RuleType.Redirect ? 'redirect' : ''} rule`}
            </Typography>

            {ruleSetEditOption === 'duplicate' && (
              <>
                <Typography hasMargin variant="bodyMedium">
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
