import { HistoryPage } from '@/libs/features';
import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const SearchHistory = ({ id }: { id: string }) => {
  const { history, isLoading, error } = useSearchHistory(id);

  return (
    <HistoryPage
      title="Search History"
      breadcrumbs={['Search Rules', 'History']}
      accessType="Search"
      ruleType="searchRanking"
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
