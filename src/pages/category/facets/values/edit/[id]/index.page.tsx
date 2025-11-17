import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  useFacetsList,
  useGetFacetAttributeValues,
  useRuleSetDetail,
  useUpdateRuleSet,
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
  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();

  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();
  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingReturnedFacet | undefined
  >(undefined);

  const { callback: handleSearch } = useDebounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

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

  const { facets } = useFacetsList({
    query: categoriesArray ?? [],
    queryBy: 'categoryIds',
    enabled: true,
    countryCode: countryCode || 'UK_IE',
  });

  const facet = facets.find((facet) => facet.id === facetId);

  useEffect(() => {
    // istanbul ignore else
    if (facets.length > 0 && facet) {
      const rulesetConfig = ruleSetDetail.facets?.find(
        (f) => f.id === facet.id
      );
      setSelectedFacet({
        ...facet,
        boosted: rulesetConfig?.boosted || [],
        excludedValues: rulesetConfig?.excludedValues || [],
        indexPropertyName: facet.indexPropertyName,
      });
    }
  }, [facets, facet, ruleSetDetail]);

  const handleSave = async (
    newFacet: MerchandisingRuleSetFacetConfigWithId
  ) => {
    const {
      // no need for last changed
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      lastChanged: _,
      facets,
      id,
      categoriesInfo,
      ...rest
    } = ruleSetDetail;
    const newFacets = facets?.map((facet) => {
      if (facet.id === newFacet.id) {
        return newFacet;
      }

      return facet;
    });
    const response = await updateCategoryRuleSet({
      ...rest,
      categoryIds:
        categoriesInfo.map(({ id }) => id) ||
        // istanbul ignore next
        [],
      facets: newFacets,
      ruleSetId: id,
    });
    // istanbul ignore else
    if (response && response.status !== 'error') {
      return router.push('/category');
    }
  };

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
      {updateRulesetError && (
        <ErrorMessage role="alert">
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      {!isLoading && showNewFacetValuesPage && selectedFacet ? (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facet={selectedFacet}
          displayName={displayName}
          facetType="category"
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
