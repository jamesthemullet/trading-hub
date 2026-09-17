import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { Button, TablePagination, Tabs, Typography } from '@/libs/components';
import {
  getFacetConfigRoute,
  getFacetRoute,
  getRulesetEditRoute,
} from '@/libs/constants/routes';
import { FacetType, RuleType } from '@/libs/constants/rule-types';

import Link from 'next/link';

import styles from './history-list.module.css';

const HISTORY_COLUMNS = ['Date', 'Time', 'Changes Made', 'User', ''];

const MAX_VISIBLE_DIFFS = 4;

const HISTORY_TABS = [{ title: 'Rulesets' }, { title: 'Facets' }];

const RULE_TYPE_TO_FACET_TYPE: Record<RuleType, FacetType | null> = {
  [RuleType.CategoryRanking]: FacetType.Category,
  [RuleType.SearchRanking]: FacetType.Search,
  [RuleType.Global]: FacetType.Global,
  [RuleType.Redirect]: null,
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
};

type HistoryItem = {
  rulesetId: string;
  id: string;
  date: string;
  user: string;
  changes: string[];
};

type HistoryLinkTarget = 'ruleset' | 'facetConfigValues';

type HistoryItemHref =
  | string
  | {
      pathname: string;
      query: Record<string, string | number>;
    };

type HistoryRowProps = {
  item: HistoryItem;
  absoluteIndex: number;
  ruleType: RuleType;
  currentPage: number;
  currentPageSize: number;
  isShowingFacets: boolean;
  facetType: FacetType | null;
  identifier?: string;
  linkTarget: HistoryLinkTarget;
};

const DiffLine = ({ desc }: { desc: string }) => {
  const [line, ...rest] = desc.split('\n');
  const productName = rest.join('\n');
  return (
    <div className={styles.diffItem}>
      <Typography variant="bodyMedium">{line}</Typography>
      {productName && (
        <Typography variant="bodySmall" className={styles.diffProductName}>
          {productName}
        </Typography>
      )}
    </div>
  );
};

const diffLineKey = (desc: string, previousDescriptions: string[]): string => {
  const occurrence = previousDescriptions.filter(
    (previousDescription) => previousDescription === desc
  ).length;

  return `${desc}-${occurrence}`;
};

const getHistoryItemBaseHref = ({
  facetType,
  isShowingFacets,
  item,
  linkTarget,
  ruleType,
}: {
  facetType: FacetType | null;
  isShowingFacets: boolean;
  item: HistoryItem;
  linkTarget: HistoryLinkTarget;
  ruleType: RuleType;
}): string => {
  if (linkTarget === 'facetConfigValues') {
    return getFacetConfigRoute('valuesEdit', item.rulesetId);
  }

  if (isShowingFacets && facetType) {
    return getFacetRoute(facetType, 'edit', item.rulesetId);
  }

  return getRulesetEditRoute(ruleType, item.rulesetId);
};

const HistoryRow = ({
  item,
  absoluteIndex,
  ruleType,
  currentPage,
  currentPageSize,
  isShowingFacets,
  facetType,
  identifier,
  linkTarget,
}: HistoryRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  const formattedTime = date.toLocaleTimeString('en-GB', TIME_FORMAT_OPTIONS);
  const isLatest = absoluteIndex === 0;
  const linkText = isLatest ? 'View current' : 'View';
  const baseHref = getHistoryItemBaseHref({
    facetType,
    isShowingFacets,
    item,
    linkTarget,
    ruleType,
  });
  const displayNameQuery: Record<string, string | number> =
    linkTarget === 'facetConfigValues' && identifier
      ? { displayName: identifier }
      : {};
  const href: HistoryItemHref = isLatest
    ? { pathname: baseHref, query: displayNameQuery }
    : {
        pathname: baseHref,
        query: {
          ...displayNameQuery,
          history: 'true',
          historyId: item.id,
          currentPage,
          currentPageSize,
        },
      };

  const allDiffs = item.changes;
  const hasOverflow = allDiffs.length > MAX_VISIBLE_DIFFS;
  const visibleDiffs = isExpanded
    ? allDiffs
    : allDiffs.slice(0, MAX_VISIBLE_DIFFS);
  const visibleDiffsWithKeys = visibleDiffs.map((desc, index) => ({
    desc,
    key: diffLineKey(desc, visibleDiffs.slice(0, index)),
  }));

  return (
    <li className={styles.historyRow} key={item.id}>
      <Typography variant="bodyMedium">{formattedDate}</Typography>
      <Typography variant="bodyMedium">{formattedTime}</Typography>
      <div className={styles.changeDiffs}>
        {visibleDiffs.length > 0 ? (
          <>
            {visibleDiffsWithKeys.map(({ desc, key }) => (
              <DiffLine key={key} desc={desc} />
            ))}
            {hasOverflow && (
              <Button
                type="button"
                appearance="plain"
                className={styles.toggleLink}
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Typography variant="bodyMedium" as="span">
                  {isExpanded ? 'Show Fewer' : 'Show More'}
                </Typography>
              </Button>
            )}
          </>
        ) : (
          <Typography variant="bodyMedium">—</Typography>
        )}
      </div>
      <Typography variant="bodyMedium">{item.user}</Typography>
      <Link href={href} className={styles.historyLink}>
        {linkText}
      </Link>
    </li>
  );
};

type HistoryListProps = {
  items: HistoryItem[];
  ruleType: RuleType;
  startIndex?: number;
  currentPage?: number;
  currentPageSize?: number;
  pageSizes?: number[];
  pagination?: { totalItems?: number };
  isLoading?: boolean;
  handlePageChange?: (page: number, pageSize: number) => void;
  initialTab?: number;
  onTabChange?: (tab: number) => void;
  hasTabs?: boolean;
  identifier?: string;
  linkTarget?: HistoryLinkTarget;
};

export const HistoryList = ({
  items,
  ruleType,
  startIndex = 0,
  currentPage = 1,
  currentPageSize = 20,
  pageSizes,
  pagination,
  isLoading,
  handlePageChange,
  initialTab = 0,
  onTabChange,
  hasTabs = true,
  identifier,
  linkTarget = 'ruleset',
}: HistoryListProps): ReactElement => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const facetType = RULE_TYPE_TO_FACET_TYPE[ruleType];
  const isShowingFacets = hasTabs && activeTab === 1;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div>
      {facetType !== null && hasTabs && (
        <div className={styles.tabsWrapper}>
          <Tabs
            tabs={HISTORY_TABS}
            currentTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              onTabChange?.(tab);
            }}
          />
        </div>
      )}
      <div className={styles.historyListWrapper}>
        <ul className={styles.historyList}>
          <li className={styles.historyHeader}>
            {HISTORY_COLUMNS.map((column) => (
              <Typography key={column} variant="bodySmall" isStrong>
                {column}
              </Typography>
            ))}
          </li>
          {items.map((item, index) => (
            <HistoryRow
              key={item.id}
              item={item}
              absoluteIndex={startIndex + index}
              ruleType={ruleType}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              isShowingFacets={isShowingFacets}
              facetType={facetType}
              identifier={identifier}
              linkTarget={linkTarget}
            />
          ))}
        </ul>
        {pagination && handlePageChange && (
          <TablePagination
            pagination={pagination}
            pageSizes={pageSizes ?? []}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            currentPageSize={currentPageSize}
            isLoading={isLoading ?? false}
          />
        )}
      </div>
    </div>
  );
};
