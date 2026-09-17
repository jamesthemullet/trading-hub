import { type ChangeEvent, type ReactElement, useMemo, useState } from 'react';

import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { GlobalFacetAttributesPageLayout } from '@/libs/features';
import { useFacetHistory } from '@/libs/hooks/global/facets/use-facet-history';
import { useGlobalFacetsList } from '@/libs/hooks/global/facets/use-global-facets-list';
import { useAccess } from '@/libs/hooks/use-access';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const Page = (): ReactElement => {
  const { getBooleanParam, getStringParam } = useTypeSafeQuery();

  const facetId = getStringParam('id');
  const displayName = getStringParam('displayName');
  const historyId = getStringParam('historyId');
  const isHistoryView = getBooleanParam('history');
  const isReadOnly = getBooleanParam('readOnly');
  const currentPage = Number(getStringParam('currentPage')) || 1;
  const currentPageSize = Number(getStringParam('currentPageSize')) || 20;

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
    facetId: searchQuery.trim() ? facetId : '',
    query: searchQuery,
    countryCode: 'UK_IE',
  });

  const { facets, error: globalFacetsListError } = useGlobalFacetsList({
    enabled: !isHistoryView,
  });
  const historyData = useFacetHistory(
    isHistoryView ? facetId : '',
    currentPage,
    currentPageSize
  );

  const currentFacet = useMemo(
    () => facets.find((f) => f.id === facetId),
    [facets, facetId]
  );
  const historicalFacet = useMemo(
    () =>
      historyData.history.changes.find((change) => change.id === historyId)
        ?.change,
    [historyData.history.changes, historyId]
  );
  const facet = isHistoryView ? historicalFacet : currentFacet;
  const displayNameLabel = isHistoryView
    ? (facet?.displayValue ?? displayName)
    : displayName;

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
          `Facet values settings: ${displayNameLabel}`,
        ]}
      />

      {globalFacetsListError && !isHistoryView && (
        <ErrorMessage>
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}

      {historyData.error && isHistoryView && (
        <ErrorMessage>
          Error whilst retrieving history: {historyData.error}
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
          displayName={displayNameLabel}
          countryCode="UK_IE"
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          isWriteEnabled={hasWriteAccess && !isReadOnly && !isHistoryView}
        />
      )}
    </>
  );
};

export default Page;
