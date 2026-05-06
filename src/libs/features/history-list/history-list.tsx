import { useEffect, useState } from 'react';

import { TablePagination, Tabs, Typography } from '@/libs/components';
import { getFacetRoute, getRulesetEditRoute } from '@/libs/constants/routes';
import { FacetType, RuleType } from '@/libs/constants/rule-types';

import Link from 'next/link';

import styles from './history-list.module.css';

const HISTORY_COLUMNS = ['Date', 'Time', 'User', ''] as const;

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
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

type HistoryItem = {
  rulesetId: string;
  id: string;
  date: string;
  user: string;
};

type HistoryRowProps = {
  item: HistoryItem;
  absoluteIndex: number;
  ruleType: RuleType;
  currentPage: number;
  currentPageSize: number;
  isShowingFacets: boolean;
  facetType: FacetType | null;
};

const HistoryRow = ({
  item,
  absoluteIndex,
  ruleType,
  currentPage,
  currentPageSize,
  isShowingFacets,
  facetType,
}: HistoryRowProps) => {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  const formattedTime = date.toLocaleTimeString('en-GB', TIME_FORMAT_OPTIONS);
  const isLatest = absoluteIndex === 0;
  const linkText = isLatest ? 'View current' : 'View';
  const baseHref =
    isShowingFacets && facetType
      ? getFacetRoute(facetType, 'edit', item.rulesetId)
      : getRulesetEditRoute(ruleType, item.rulesetId);
  const href = isLatest
    ? baseHref
    : {
        pathname: baseHref,
        query: {
          history: 'true',
          historyId: item.id,
          currentPage,
          currentPageSize,
        },
      };

  return (
    <li className={styles.historyRow} key={item.id}>
      <Typography variant="bodyMedium">{formattedDate}</Typography>
      <Typography variant="bodyMedium">{formattedTime}</Typography>
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
  totalItems?: number;
  startIndex?: number;
  currentPage?: number;
  currentPageSize?: number;
  pageSizes?: number[];
  pagination?: { totalItems?: number };
  isLoading?: boolean;
  handlePageChange?: (page: number, pageSize: number) => void;
  initialTab?: number;
  onTabChange?: (tab: number) => void;
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
}: HistoryListProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const facetType = RULE_TYPE_TO_FACET_TYPE[ruleType];
  const isShowingFacets = activeTab === 1;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div>
      {facetType !== null && (
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
