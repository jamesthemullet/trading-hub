import { useRouter } from 'next/router';

import { RuleType } from '@/libs/constants/rule-types';
import { HistoryPage } from '@/libs/features';
import { useRedirectHistory } from '@/libs/hooks/search/redirect/history/use-redirect-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const RedirectsHistory = ({ id }: { id: string }) => {
  const router = useRouter();
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const { history, isLoading, error } = useRedirectHistory(
    id,
    currentPage,
    currentPageSize
  );

  return (
    <HistoryPage
      title="Redirects History"
      breadcrumbs={['Search Redirects', 'History']}
      accessType="Search"
      ruleType={RuleType.Redirect}
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
