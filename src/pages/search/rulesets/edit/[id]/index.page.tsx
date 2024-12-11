import { useRouter } from 'next/router';

import { RuleSet } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(id);
  const router = useRouter();
  const { updateRuleSet, isSaving } = useSearchRuleSetUpdate();

  const saveRuleSet = async ({
    searchTerms,
    ruleSetId,
    ruleSet,
  }: {
    searchTerms?: Array<string>;
    ruleSetId: string;
    ruleSet: RuleSet;
  }) => {
    // istanbul ignore next
    if (!searchTerms?.[0]) return;
    await updateRuleSet({
      ruleSetId,
      rules: ruleSet,
      searchTerms,
      startDate: ruleSet.startDate,
      endDate: ruleSet.endDate,
    }).then(() => {
      router.push('/search/rulesets');
    });
  };

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit search ranking rule</title>
      </Head>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Ranking rules']}
      />

      {error && <CentredError>{error}</CentredError>}

      {!isLoading && (
        <Ruleset
          isEnabled={ruleSet.isEnabled}
          onCancel={() => router.push('/search/rulesets')}
          onSave={saveRuleSet}
          rulesetId={ruleSet.id}
          rulesetMerchandisingRules={ruleSet.rules}
          rulesetType="search"
          searchTerms={ruleSet.searchTerms}
          startDate={ruleSet.startDate}
          endDate={ruleSet.endDate}
          countryCode={ruleSet.countryCode}
        />
      )}

      {isSaving && <Loader />}
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
