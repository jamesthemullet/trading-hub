import { useRouter } from 'next/router';

import { CentredError, Heading } from '@/libs/components';
import { useSearchRuleSetPreview } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(id);
  const router = useRouter();

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Ranking rules']}
      />

      {error && <CentredError>{error}</CentredError>}

      {!isLoading && (
        <Ruleset
          isEnabled={ruleSet.isEnabled}
          onCancel={() => router.push('/search/rulesets')}
          rulesetId={ruleSet.id}
          rulesetMerchandisingRules={ruleSet.rules}
          rulesetType="search"
          searchTerms={ruleSet.searchTerms}
        />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default Page;
