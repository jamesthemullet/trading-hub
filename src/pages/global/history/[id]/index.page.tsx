import { HistoryPage } from '@/libs/features';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const GlobalHistory = ({ id }: { id: string }) => {
  const { history, isLoading, error } = useGlobalHistory(id);

  return (
    <HistoryPage
      title="Global History"
      breadcrumbs={['Global Ranking Rules', 'History']}
      accessType="Glob"
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
