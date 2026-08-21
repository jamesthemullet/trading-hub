import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import { AccessDeny, Button, ErrorMessage, Heading } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';
import { RuleType } from '@/libs/constants/rule-types';
import { HistoryList } from '@/libs/features/history-list/history-list';
import { useGlobalFacetsList } from '@/libs/hooks/global/facets/use-global-facets-list';
import { useAccess } from '@/libs/hooks/use-access';
import { PAGE_SIZES } from '@/libs/hooks/use-rows-per-page-setting';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import {
  computeHistoryDiff,
  type RulesetSnapshot,
} from '@/libs/utils/compute-history-diff';
import { getPaginationOffset } from '@/libs/utils/pagination';

import Head from 'next/head';

import styles from './history-page.module.css';

type AccessType = 'Cat' | 'Search' | 'Glob';

type HistoryData = {
  changes: Array<{
    id: string;
    change: RulesetSnapshot & {
      id: string;
      lastChanged: {
        date: string;
        user: string;
      };
    };
  }>;
  pagination: {
    totalItems?: number;
  };
};

type HistoryPageProps = {
  title: string;
  breadcrumbs: string[];
  accessType: AccessType;
  ruleType: RuleType;
  history: HistoryData;
  isLoading: boolean;
  error: string;
};

export const HistoryPage = ({
  title,
  breadcrumbs,
  accessType,
  ruleType,
  history,
  isLoading,
  error,
}: HistoryPageProps): ReactElement => {
  const { hasReadAccess, requiredReadRole } = useAccess(accessType);
  const router = useRouter();
  const { facets: globalFacets } = useGlobalFacetsList({
    enabled: ruleType !== RuleType.Redirect,
  });
  const facetNames = Object.fromEntries(
    globalFacets?.map((f) => [f.id, f.displayValue]) ?? []
  );
  const identifier = router.query.identifier;
  const pageSizes = [...PAGE_SIZES];
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;
  const currentTab = Number(router.query.tab) || 0;
  const startIndex = getPaginationOffset(currentPage, currentPageSize);

  const handlePageChange = (page: number, pageSize: number) => {
    updateQueryParams(router, {
      currentPage: page,
      currentPageSize: pageSize,
      searchQuery: '',
    });
  };

  const handleTabChange = (tab: number) => {
    void router.replace({
      pathname: router.pathname,
      query: { ...router.query, tab },
    });
  };

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  const historyItems = history.changes.map((item, index, changes) => {
    const previousChange = history.changes?.[index + 1]?.change ?? null;
    const isOldestOnPage = index === changes.length - 1;
    return {
      id: item.id,
      date: item.change.lastChanged.date,
      user: item.change.lastChanged.user,
      rulesetId: item.change.id,
      changes: isOldestOnPage
        ? []
        : computeHistoryDiff(item.change, previousChange, facetNames),
    };
  });
  const normalisedTotalItems =
    history.pagination.totalItems ?? historyItems.length;
  const normalisedPagination = {
    ...history.pagination,
    totalItems: normalisedTotalItems,
  };

  return (
    <section className={styles.container}>
      <Head>
        <title>Merchandising Hub | M&amp;S | {title}</title>
      </Head>

      <div className={styles.headingRow}>
        <Heading breadcrumbs={breadcrumbs} title="Changes history" />
        <Button
          type="button"
          aria-label="Close"
          theme="primary"
          onClick={() => router.back()}
        >
          Close
        </Button>
      </div>

      <div className={styles.labelWrapper}>
        <Typography variant="bodySmall" hasMargin>
          {identifier}
        </Typography>
      </div>
      {error && (
        <ErrorMessage centred>
          Error whilst retrieving history: {error}
        </ErrorMessage>
      )}
      <section className={styles.listContainer}>
        {!isLoading && !error && historyItems?.length && (
          <HistoryList
            items={historyItems}
            ruleType={ruleType}
            startIndex={startIndex}
            currentPage={currentPage}
            currentPageSize={currentPageSize}
            pagination={normalisedPagination}
            pageSizes={pageSizes}
            isLoading={isLoading}
            handlePageChange={handlePageChange}
            initialTab={currentTab}
            onTabChange={handleTabChange}
          />
        )}
      </section>
    </section>
  );
};
