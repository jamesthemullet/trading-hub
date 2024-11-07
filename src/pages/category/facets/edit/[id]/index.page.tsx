import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {
  Category,
  CountryCode,
  ExcludedFacets,
  ReturnedFacet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import {
  useFacetsList,
  useRuleSetDetail,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();
  const {
    ruleSetDetail,
    isLoading,
    refreshRuleset,
    error: getRulesetDetailError,
  } = useRuleSetDetail(id);

  const [userSelectedCategory, setUserSelectedCategory] = useState<
    Required<Category> | undefined
  >();

  const [facetsFromCategoryRuleSet, setFacetsFromCategoryRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  const [dateTime, setDateTime] = useState<Array<Date | null>>([null, null]);

  const { facets, error: getFacetsDataError } = useFacetsList({
    categoryId: userSelectedCategory?.identifier,
    enabled: !isLoading,
    emptyListWhenCategoryNotSelected: true,
  });

  const [facetsData, setFacetsData] = useState<ReturnedFacet[]>([]);
  const [initialIncludedFacets, setInitialIncludedFacets] = useState<string[]>(
    []
  );
  const [initialExcludedFacets, setInitialExcludedFacets] = useState<string[]>(
    []
  );

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();

  useEffect(() => {
    if (ruleSetDetail.facets) {
      setFacetsFromCategoryRuleSet(ruleSetDetail.facets);
    }
    // TODO this needs additional refactoring
    if (ruleSetDetail.categoriesInfo[0]) {
      setUserSelectedCategory({
        identifier: ruleSetDetail.categoriesInfo[0].id,
        name: ruleSetDetail.categoriesInfo[0].name || '',
        path: '/',
      });
    }
    if (ruleSetDetail.startDate && ruleSetDetail.endDate) {
      setDateTime([
        new Date(ruleSetDetail.startDate),
        new Date(ruleSetDetail.endDate),
      ]);
    }
  }, [ruleSetDetail]);

  useEffect(() => {
    const includedFacets = facetsFromCategoryRuleSet.map((facet) => {
      return facet.id;
    });

    const excludedFacets = facets
      .filter((facet) =>
        ruleSetDetail.excludedFacets?.facets?.some(
          (excludedFacet) => excludedFacet?.id === facet.id
        )
      )
      .map((facet) => facet.id);

    const newFacetsData = facets.map((facet) => {
      const includedFacet = facetsFromCategoryRuleSet.find(
        (facetFromCategory) => facetFromCategory.id === facet.id
      );

      if (!includedFacet) {
        return facet;
      }

      return {
        ...facet,
        ...includedFacet,
      };
    });

    setFacetsData(newFacetsData);
    setInitialIncludedFacets(includedFacets);
    setInitialExcludedFacets(excludedFacets);
  }, [
    facets,
    facetsFromCategoryRuleSet,
    ruleSetDetail.facets,
    ruleSetDetail.excludedFacets?.facets,
  ]);

  const handleSave = async ({
    categoryIds,
    includedFacets,
    excludedFacets,
    countryCode,
  }: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
  }) => {
    const response = await updateCategoryRuleSet({
      categoryIds,
      rules: ruleSetDetail.rules,
      facets: includedFacets,
      isEnabled: ruleSetDetail.isEnabled,
      ...(dateTime[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime[1] && {
        endDate: new Date(dateTime[1]).toISOString(),
      }),
      ruleSetId: id,
      excludedFacets,
      countryCode,
    });
    if (response && response.status !== 'error') {
      return router.push(`/category/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const handleUpdatedValues = (
    included: string[],
    excluded: string[],
    id: string
  ) => {
    setFacetsData((prev) => {
      const updatedFacets = prev.map((facet) => {
        if (facet.id === id) {
          return {
            ...facet,
            boosted: included,
            excludedValues: excluded,
          };
        } else {
          return facet;
        }
      });
      return updatedFacets;
    });
  };

  const handleUserSelectedCategoryChange = (
    category: Required<Category> | undefined
  ) => {
    setFacetsData([]);
    setFacetsFromCategoryRuleSet([]);
    setUserSelectedCategory(category);
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      {getRulesetDetailError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetDetailError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}
      {getFacetsDataError && (
        <ErrorMessage>
          Error whilst retrieving facet list: {getFacetsDataError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          title="Facet Rule Editor"
          displayRowOrderControls={true}
          onSelectedCategoryChange={handleUserSelectedCategoryChange}
          onScheduleDateChange={(
            updatedDateTime: [Date | null, Date | null]
          ) => {
            setDateTime(updatedDateTime);
          }}
          refreshData={refreshRuleset}
          categoryIds={ruleSetDetail.categoriesInfo.map(
            (category) => category.id
          )}
          endDate={ruleSetDetail.endDate}
          facetsData={facetsData}
          initialIncludedFacets={initialIncludedFacets}
          initialExcludedFacets={initialExcludedFacets}
          facetType="category"
          rulesetMerchandisingRules={ruleSetDetail.rules}
          startDate={ruleSetDetail.startDate}
          updatedValues={handleUpdatedValues}
          countryCode={ruleSetDetail.countryCode || 'UK_IE'}
        />
      )}
    </>
  );
};

export default Page;
