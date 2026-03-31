import { useRouter } from 'next/router';

import { RuleType } from '@/libs/constants/rule-types';
import { HistoryPage } from '@/libs/features';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

const CategoryHistory = ({ id }: { id: string }) => {
  const router = useRouter();
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const { history, isLoading, error } = useCategoryHistory(
    id,
    currentPage,
    currentPageSize
  );

  return (
    <HistoryPage
      title="Category History"
      breadcrumbs={['Categories', 'Ranking rules']}
      accessType="Cat"
      ruleType={RuleType.CategoryRanking}
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
