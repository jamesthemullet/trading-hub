import styled from '@emotion/styled';
import { useState } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSetFacetConfigWithId } from '@/libs/api';
import { CentredError, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  useGetFacetAttributeValues,
  useSearchRuleSetPreview,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const CentredContainer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Page = () => {
  const router = useRouter();

  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();

  const { updateRuleSet, error: updateRuleSetError } = useSearchRuleSetUpdate();

  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const [searchQuery, setSearchQuery] = useState('');

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  // Currently we don't send searchTerms to this endpoint, which I think is wrong, awaiting confirmation
  const { attributeValues } = useGetFacetAttributeValues({
    facetId: facetId,
    query: searchQuery,
    countryCode,
  });

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(ruleSetId);

  const facet = ruleSet.facets?.find((facet) => facet.id === facetId);

  const handleSave = async (
    newFacet: MerchandisingRuleSetFacetConfigWithId
  ) => {
    const newFacets = ruleSet.facets?.map((facet) => {
      if (facet.id === newFacet.id) {
        return newFacet;
      }

      return facet;
    });

    const response = await updateRuleSet({
      ...ruleSet,
      ruleSetId,
      facets: newFacets,
    });

    // istanbul ignore else
    if (response) {
      return router.push('/search');
    }
  };

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Search Ruleset Facet Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search',
          'Facet Management Editor',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {error && <CentredError>{error}</CentredError>}
      {updateRuleSetError && (
        <CentredError role="alert">
          Error whilst updating ruleset: {updateRuleSetError}
        </CentredError>
      )}

      {!isLoading && showNewFacetValuesPage && facet ? (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facet={facet}
          displayName={displayName}
          facetType="search"
          ruleSetId={ruleSetId}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onSave={handleSave}
        />
      ) : (
        <CentredContainer>Coming soon/loading</CentredContainer>
      )}
    </>
  );
};

export default Page;
