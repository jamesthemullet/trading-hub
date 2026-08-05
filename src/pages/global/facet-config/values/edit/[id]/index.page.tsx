import { type ChangeEvent, type ReactElement, useMemo, useState } from 'react';

import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { GlobalFacetAttributesPageLayout } from '@/libs/features';
import { useGlobalFacetsList } from '@/libs/hooks/global/facets/use-global-facets-list';
import { useAccess } from '@/libs/hooks/use-access';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const Page = (): ReactElement => {
  const { getStringParam } = useTypeSafeQuery();

  const facetId = getStringParam('id');
  const displayName = getStringParam('displayName');

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
      countryCode: 'UK_IE',
    });

  const {
    attributeValues: searchedAttributeValues,
    error: searchedAttributeValuesError,
  } = useGetFacetAttributeValues({
    facetId,
    query: searchQuery,
    countryCode: 'UK_IE',
  });

  const { facets, error: globalFacetsListError } = useGlobalFacetsList();

  const facet = useMemo(
    () => facets.find((f) => f.id === facetId),
    [facets, facetId]
  );

  const { hasReadAccess, requiredReadRole, hasWriteAccess } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&amp;S | Global Facet Config - Edit Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Global',
          'Facet Configuration',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {globalFacetsListError && (
        <ErrorMessage>
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}

      {(attributeValuesError || searchedAttributeValuesError) && (
        <ErrorMessage>
          Error retrieving values:{' '}
          {attributeValuesError || searchedAttributeValuesError}
        </ErrorMessage>
      )}

      {!!attributeValues && facet && (
        <GlobalFacetAttributesPageLayout
          facet={facet}
          attributeValues={attributeValues}
          searchedAttributeValues={searchedAttributeValues}
          facetId={facetId}
          displayName={displayName}
          countryCode="UK_IE"
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          isWriteEnabled={hasWriteAccess}
        />
      )}
    </>
  );
};

export default Page;
