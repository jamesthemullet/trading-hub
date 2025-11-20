import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSetFacetConfigWithId } from '@/libs/api';
import { CentredError, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  useFacetsList,
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

  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingRuleSetFacetConfigWithId | undefined
  >(undefined);

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const searchTermsArray = useMemo(() => {
    const searchTerms = router.query.searchTerms;
    if (typeof searchTerms === 'string') {
      return [searchTerms];
    }
    if (Array.isArray(searchTerms)) {
      return searchTerms.filter((v): v is string => typeof v === 'string');
    }
    return undefined;
  }, [router.query.searchTerms]);

  // Currently we don't send searchTerms to this endpoint, which I think is wrong, awaiting confirmation
  const { attributeValues } = useGetFacetAttributeValues({
    facetId,
    query: searchQuery,
    searchTerms: searchTermsArray,
    countryCode,
  });

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(ruleSetId);

  const { facets } = useFacetsList({
    query: searchTermsArray ?? [],
    queryBy: 'searchTerms',
    enabled: true,
    countryCode: countryCode || 'UK_IE',
  });

  const facet = facets.find((facet) => facet.id === facetId);

  useEffect(() => {
    // istanbul ignore else
    if (facets.length > 0 && facet) {
      const rulesetConfig = ruleSet.facets?.find((f) => f.id === facet.id);

      setSelectedFacet({
        ...facet,
        boosted: rulesetConfig?.boosted || [],
        excludedValues: rulesetConfig?.excludedValues || [],
      });
    }
  }, [facets, facet, ruleSet.facets]);

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

      {!isLoading && showNewFacetValuesPage && selectedFacet ? (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facet={selectedFacet}
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
