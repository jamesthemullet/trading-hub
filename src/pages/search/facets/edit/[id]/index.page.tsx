import { useRouter } from 'next/router';

import { CountryCode, ExcludedFacets, ReturnedFacet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';
import SearchFacetsPanel from '@/libs/modules/facets-panel/search-facets-panel';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();

  const { updateRuleSet, error: updateRuleSetError } = useSearchRuleSetUpdate();

  const handleSave = async ({
    searchTerms,
    includedFacets,
    excludedFacets,
    countryCode,
    dateTime,
  }: {
    searchTerms: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
    dateTime?: [Date | null, Date | null];
  }) => {
    const response = await updateRuleSet({
      searchTerms,
      rules: ruleSet.rules,
      ...(dateTime?.[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime?.[1] && {
        endDate: new Date(dateTime[1]).toISOString(),
      }),
      ruleSetId: id,
      facets: includedFacets,
      countryCode,
      excludedFacets,
      isEnabled: ruleSet.isEnabled,
    });

    if (response) {
      return router.push(`/search/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/search/facets');
  };

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(id);

  return (
    <>
      <Head>
        <title>{`Merchandising Hub | M&S | Edit Search Facets`}</title>
      </Head>
      <Heading breadcrumbs={['Search', 'Facet Management', 'Editor']} />

      {error && (
        <ErrorMessage>Error whilst retrieving ruleset: {error}</ErrorMessage>
      )}
      {updateRuleSetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRuleSetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" />
      ) : (
        <SearchFacetsPanel
          ruleSetIncludedFacets={ruleSet.facets}
          ruleSetExcludedFacets={ruleSet.excludedFacets}
          ruleSetRules={ruleSet.rules}
          startDate={ruleSet.startDate}
          endDate={ruleSet.endDate}
          isLoading={isLoading}
          countryCode={ruleSet.countryCode || 'UK_IE'}
          searchTerms={ruleSet.searchTerms}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Page;
