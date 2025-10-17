import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { FacetList } from '@/libs/modules/facet-list/facet-list';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
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
    facets,
    excludedFacets,
    countryCode,
    searchTerms,
    startDate,
    endDate,
  }: MerchandisingRuleSet & { searchTerms?: string[] }) => {
    // istanbul ignore next
    if (!searchTerms) {
      return;
    }

    const response = await updateRuleSet({
      searchTerms,
      rules: ruleSet.rules,
      facets,
      isEnabled: ruleSet.isEnabled,
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && {
        endDate: new Date(endDate).toISOString(),
      }),
      ruleSetId: id,
      excludedFacets,
      countryCode,
    });

    // istanbul ignore else
    if (response) {
      return router.push('/search');
    }
  };

  const handleCancel = () => {
    router.push('/search');
  };

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(id);

  const { hasReadAccess, requiredReadRole, hasWriteAccess } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit Search Facets</title>
      </Head>
      <Heading breadcrumbs={['Search', 'Facet Management', 'Editor']} />

      {error && (
        <ErrorMessage role="alert">
          Error whilst retrieving ruleset: {error}
        </ErrorMessage>
      )}
      {updateRuleSetError && (
        <ErrorMessage role="alert">
          Error whilst updating ruleset: {updateRuleSetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" aria-busy="true" />
      ) : (
        <FacetList
          facetType="search"
          currentRuleset={ruleSet}
          searchTerms={ruleSet.searchTerms}
          isNewRuleset={false}
          onCancel={handleCancel}
          onSave={handleSave}
          writeEnabled={hasWriteAccess}
        />
      )}
    </>
  );
};

export default Page;
