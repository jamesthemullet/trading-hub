import { useRouter } from 'next/router';

import { HistoryPage } from '@/libs/features';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const GlobalHistory = ({ id }: { id: string }) => {
  const router = useRouter();
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const { history, isLoading, error } = useGlobalHistory(
    id,
    currentPage,
    currentPageSize
  );

  return (
    <HistoryPage
      title="Global History"
      breadcrumbs={['Global Ranking Rules', 'History']}
      accessType="Glob"
      ruleType="global"
      history={history}
      isLoading={isLoading}
      error={error}
    />
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default GlobalHistory;
