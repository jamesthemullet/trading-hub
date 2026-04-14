import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import { RuleType } from '@/libs/constants/rule-types';
import { HistoryPage } from '@/libs/features';
import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const SearchHistory = ({ id }: { id: string }): ReactElement => {
  const router = useRouter();
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const { history, isLoading, error } = useSearchHistory(
    id,
    currentPage,
    currentPageSize
  );

  return (
    <HistoryPage
      title="Search History"
      breadcrumbs={['Search Rules', 'History']}
      accessType="Search"
      ruleType={RuleType.SearchRanking}
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

export default SearchHistory;
