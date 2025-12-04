import { useRouter } from 'next/router';

import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';
import { HistoryList } from '@/libs/features/history-list/history-list';
import { useAccess } from '@/libs/hooks/use-access';
import { PageNameLabel } from '@/libs/utils/shared.styles';

import Head from 'next/head';

import styles from './history-page.module.css';

type AccessType = 'Cat' | 'Search' | 'Glob';

type HistoryData = {
  changes?: Array<{
    id: string;
    change: {
      lastChanged: {
        date: string;
        user: string;
      };
    };
  }>;
};

type HistoryPageProps = {
  title: string;
  breadcrumbs: string[];
  accessType: AccessType;
  history: HistoryData;
  isLoading: boolean;
  error: string;
};

export const HistoryPage = ({
  title,
  breadcrumbs,
  accessType,
  history,
  isLoading,
  error,
}: HistoryPageProps) => {
  const { hasReadAccess, requiredReadRole } = useAccess(accessType);
  const router = useRouter();
  const identifier = router.query.identifier;

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  const historyItems = history.changes?.map((item) => ({
    id: item.id,
    date: item.change.lastChanged.date,
    user: item.change.lastChanged.user,
  }));

  return (
    <section className={styles.container}>
      <Head>
        <title>Merchandising Hub | M&amp;S | {title}</title>
      </Head>

      <Heading breadcrumbs={breadcrumbs} />

      <PageNameLabel>Subcategory History</PageNameLabel>
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
          <HistoryList items={historyItems} />
        )}
      </section>
    </section>
  );
};
