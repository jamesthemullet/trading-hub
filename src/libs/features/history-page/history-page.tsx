import { useRouter } from 'next/router';

import {
  AccessDeny,
  ErrorMessage,
  Heading,
  TablePagination,
} from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';
import { HistoryList } from '@/libs/features/history-list/history-list';
import { useAccess } from '@/libs/hooks/use-access';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';

import Head from 'next/head';

import styles from './history-page.module.css';

type AccessType = 'Cat' | 'Search' | 'Glob';
type RuleType = 'categoryRanking' | 'searchRanking' | 'global' | 'redirect';

type HistoryData = {
  changes?: Array<{
    id: string;
    change: {
      id: string;
      lastChanged: {
        date: string;
        user: string;
      };
    };
  }>;
  pagination?: {
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
}: HistoryPageProps) => {
  const { hasReadAccess, requiredReadRole } = useAccess(accessType);
  const router = useRouter();
  const identifier = router.query.identifier;
  const pageSizes = [10, 20, 50, 100];
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;
  const startIndex = (currentPage - 1) * currentPageSize;

  const handlePageChange = (page: number, pageSize: number) => {
    updateQueryParams(router, {
      currentPage: page,
      currentPageSize: pageSize,
      searchQuery: '',
    });
  };

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  const historyItems = history.changes?.map((item) => ({
    id: item.id,
    date: item.change.lastChanged.date,
    user: item.change.lastChanged.user,
    rulesetId: item.change.id,
  }));
  const normalisedTotalItems =
    history.pagination?.totalItems ?? historyItems?.length ?? 0;
  const normalisedPagination = {
    ...history.pagination,
    totalItems: normalisedTotalItems,
  };

  return (
    <section className={styles.container}>
      <Head>
        <title>Merchandising Hub | M&amp;S | {title}</title>
      </Head>

      <Heading breadcrumbs={breadcrumbs} title="Subcategory History" />

      <div className={styles.labelWrapper}>
        <Typography variant="bodySmall" withMargin>
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
            totalItems={normalisedTotalItems}
            startIndex={startIndex}
          />
        )}
      </section>

      <TablePagination
        pagination={normalisedPagination}
        pageSizes={pageSizes}
        handlePageChange={handlePageChange}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        isLoading={isLoading}
      />
    </section>
  );
};
