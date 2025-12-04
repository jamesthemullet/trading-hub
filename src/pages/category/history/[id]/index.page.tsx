import { HistoryPage } from '@/libs/features';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const CategoryHistory = ({ id }: { id: string }) => {
  const { history, isLoading, error } = useCategoryHistory(id);

  return (
    <HistoryPage
      title="Category History"
      breadcrumbs={['Categories', 'Ranking rules']}
      accessType="Cat"
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

export default CategoryHistory;
