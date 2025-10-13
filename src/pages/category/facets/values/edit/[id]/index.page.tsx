import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { ErrorMessage, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import { useGetFacetAttributeValues, useRuleSetDetail } from '@/libs/hooks';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';

import Head from 'next/head';

const CentredContainer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Page = () => {
  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  const [searchQuery] = useState('');

  const router = useRouter();
  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const categoriesArray = useMemo(() => {
    const categories = router.query.categories;
    if (typeof categories === 'string') {
      return [categories];
    }
    if (Array.isArray(categories)) {
      return categories.filter((v): v is string => typeof v === 'string');
    }
    return undefined;
  }, [router.query.categories]);

  const { attributeValues } = useGetFacetAttributeValues({
    facetId: facetId,
    query: searchQuery,
    categories: categoriesArray,
    countryCode,
  });

  const {
    ruleSetDetail,
    isLoading,
    error: getRulesetDetailError,
  } = useRuleSetDetail(ruleSetId);

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Category Ruleset Facet Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Categories',
          'Facet Management Editor',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {getRulesetDetailError && (
        <ErrorMessage role="alert">
          Error whilst retrieving ruleset: {getRulesetDetailError}
        </ErrorMessage>
      )}

      {!isLoading && showNewFacetValuesPage ? (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facets={ruleSetDetail.facets}
          facetId={facetId}
          displayName={displayName}
          facetType="category"
          ruleSetId={ruleSetId}
        />
      ) : (
        <CentredContainer>Coming soon/loading</CentredContainer>
      )}
    </>
  );
};

export default Page;
