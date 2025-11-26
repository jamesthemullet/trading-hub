import styled from '@emotion/styled';
import { type ChangeEvent, useMemo, useState } from 'react';

import { ErrorMessage, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { GlobalFacetAttributesPageLayout } from '@/libs/features';
import { useGlobalFacetsList } from '@/libs/hooks/global/facets/use-global-facets-list';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
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
  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const [searchQuery, setSearchQuery] = useState('');
  const { callback: handleSearch } = useDebounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const { attributeValues, error: attributeValuesError } =
    useGetFacetAttributeValues({
      facetId,
      query: '',
      countryCode,
    });

  const { facets, error: globalFacetsListError } = useGlobalFacetsList();

  const facet = useMemo(
    () => facets.find((f) => f.id === facetId),
    [facets, facetId]
  );

  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Global Ruleset Facet Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Global',
          'Facet Management Editor',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {globalFacetsListError && (
        <ErrorMessage role="alert">
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}

      {attributeValuesError && (
        <ErrorMessage role="alert">
          Error retrieving values: {attributeValuesError}
        </ErrorMessage>
      )}

      {!!attributeValues && showNewFacetValuesPage && facet ? (
        <GlobalFacetAttributesPageLayout
          facet={facet}
          attributeValues={attributeValues}
          facetId={facetId}
          displayName={displayName}
          ruleSetId={ruleSetId}
          countryCode={countryCode}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
      ) : (
        <CentredContainer>Coming soon/loading</CentredContainer>
      )}
    </>
  );
};

export default Page;
