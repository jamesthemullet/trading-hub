import { HistoryPage } from '@/libs/features';
import { useRedirectHistory } from '@/libs/hooks/search/redirect/history/use-redirect-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const RedirectsHistory = ({ id }: { id: string }) => {
  const { history, isLoading, error } = useRedirectHistory(id);

  return (
    <HistoryPage
      title="Redirects History"
      breadcrumbs={['Search Redirects', 'History']}
      accessType="Search"
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

export default RedirectsHistory;
