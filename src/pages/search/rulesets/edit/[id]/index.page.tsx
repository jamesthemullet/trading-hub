import { useRouter } from 'next/router';

import { RuleSet } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { SEARCH_READ_ROLE, SEARCH_WRITE_ROLE } from '../../../search-config';

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
      rules: ruleSet.rules,
      searchTerms,
      startDate: ruleSet.startDate,
      endDate: ruleSet.endDate,
      ...(ruleSet.excludedFacets && { excludedFacets: ruleSet.excludedFacets }),
      ...(ruleSet.facets && { facets: ruleSet.facets }),
      isEnabled: ruleSet.isEnabled,
    }).then(() => {
      router.push('/search/rulesets');
    });
  };

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: SEARCH_READ_ROLE,
    writeRole: SEARCH_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={SEARCH_READ_ROLE} />;
  }

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
          rulesetFacets={ruleSet.facets}
          rulesetExcludedFacets={ruleSet.excludedFacets}
          startDate={ruleSet.startDate}
          endDate={ruleSet.endDate}
          countryCode={ruleSet.countryCode}
          writeEnabled={hasWriteAccess}
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
