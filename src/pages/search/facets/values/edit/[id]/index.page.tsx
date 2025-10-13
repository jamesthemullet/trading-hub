import styled from '@emotion/styled';
import { useState } from 'react';

import { CentredError, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import { useSearchRuleSetPreview } from '@/libs/hooks';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';

import Head from 'next/head';

const CentredContainer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Page = () => {
  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();

  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  const [searchQuery] = useState('');

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  // Currently we don't send searchTerms to this endpoint, which I think is wrong, awaiting confirmation
  const { attributeValues } = useGetFacetAttributeValues({
    facetId: facetId,
    query: searchQuery,
    countryCode,
  });

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(ruleSetId);

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

      {!isLoading && showNewFacetValuesPage ? (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facets={ruleSet.facets}
          facetId={facetId}
          displayName={displayName}
          facetType="search"
          ruleSetId={ruleSetId}
        />
      ) : (
        <CentredContainer>Coming soon/loading</CentredContainer>
      )}
    </>
  );
};

export default Page;
