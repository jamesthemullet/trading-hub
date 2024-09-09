import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { ReturnedFacet, RuleSetFacetConfigWithId } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import {
  useFacetsFilter,
  useGlobalFacetsList,
  useGlobalFacetUpdate,
  useGlobalRuleSetDetail,
  useGlobalRuleSetUpdate,
} from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

const defaultCategory = {
  identifier: 'Applies to all pages in marksandspencer.com',
  name: 'All products',
  path: '/',
};

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const {
    facets,
    isLoading,
    onRefreshFacetList,
    error: globalFacetsListError,
  } = useGlobalFacetsList();

  const router = useRouter();

  const { globalRuleSet, error: globalRulesetError } =
    useGlobalRuleSetDetail(id);

  const [globalFacetsList, setGlobalFacetsList] =
    useState<ReturnedFacet[]>(facets);
  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);
  const [includedFacets, setIncludedFacets] = useState<ReturnedFacet[]>([]);
  const [excludedFacets, setExcludedFacets] = useState<ReturnedFacet[]>([]);
  const [orderedLocalFacetData, setOrderedLocalFacetData] = useState<
    ReturnedFacet[]
  >([]);

  useEffect(() => {
    setGlobalFacetsList(facets);
  }, [facets]);

  useEffect(() => {
    if (globalRulesetError !== '') {
      return;
    }
    const includedFacets = facetsFromGlobalRuleSet
      .map((facet) => {
        const localFacet = globalFacetsList.find(
          (localFacet) => localFacet.id === facet.id
        );
        return localFacet;
      })
      .filter((facet): facet is ReturnedFacet => Boolean(facet));
    setIncludedFacets(includedFacets);

    const excludedFacets = globalFacetsList.filter((facet) =>
      globalRuleSet.excludedFacets?.facets?.some(
        (excludedFacet) => excludedFacet?.facet?.id === facet.id
      )
    );

    const restOfFacets = globalFacetsList.filter(
      (facet) =>
        !includedFacets.some(
          (includedFacet) => includedFacet.id === facet.id
        ) &&
        !excludedFacets.some((excludedFacet) => excludedFacet.id === facet.id)
    );
    setExcludedFacets(excludedFacets);
    setOrderedLocalFacetData([
      ...includedFacets,
      ...restOfFacets,
      ...excludedFacets,
    ]);
  }, [
    globalFacetsList,
    facetsFromGlobalRuleSet,
    globalRulesetError,
    globalRuleSet.excludedFacets?.facets,
  ]);

  useEffect(() => {
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { setSearch, filteredFacets } = useFacetsFilter(orderedLocalFacetData);

  const orderedFilteredFacets = useMemo(() => {
    const filteredIncludedFacets = filteredFacets.filter((facet) =>
      includedFacets.includes(facet)
    );
    const filteredExcludedFacets = filteredFacets.filter((facet) =>
      excludedFacets.includes(facet)
    );

    const restOfTheFacets = filteredFacets.filter(
      (facet) =>
        !filteredIncludedFacets.includes(facet) &&
        !filteredExcludedFacets.includes(facet)
    );

    return [
      ...filteredIncludedFacets,
      ...restOfTheFacets,
      ...filteredExcludedFacets,
    ];
  }, [filteredFacets, includedFacets, excludedFacets]);

  const { handleGlobalFacetUpdate, error: updatingGlobalFacetError } =
    useGlobalFacetUpdate();
  const { saveGlobalRuleset, error: savingGlobalRulesetError } =
    useGlobalRuleSetUpdate();

  const handleSave = async () => {
    const response = await saveGlobalRuleset({
      ruleSetId: globalRuleSet.id,
      ruleSet: {
        facets: includedFacets.map((facet) => ({
          id: facet.id,
          boosted: facet.boosted,
          excludedValues: facet.excludedValues,
        })),
        rules: globalRuleSet.rules,
        isEnabled: globalRuleSet.isEnabled,
      },
    });

    if (response) {
      return router.push(`/global/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const onFacetDataChange = async ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded';
    facet: ReturnedFacet;
  }) => {
    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
      },
    });

    if (!response || !('displayValue' in response)) {
      return;
    }

    const updatedGlobalFacets = globalFacetsList.map((globalFacet) => {
      if (globalFacet.id === facet.id) {
        return { ...globalFacet, displayValue: response?.displayValue };
      }
      return globalFacet;
    });

    setGlobalFacetsList(updatedGlobalFacets);
  };

  const onHandleStatusChange = async (
    value: 'included' | 'excluded' | 'algoControl',
    id?: string
  ) => {
    const existingFacet = globalFacetsList.find((facet) => facet.id === id);
    // istanbul ignore next
    if (!existingFacet) {
      return;
    }

    switch (value) {
      case 'included':
        setIncludedFacets((prev) => [...prev, existingFacet]);
        setExcludedFacets((prev) => prev.filter((facet) => facet.id !== id));

        break;
      case 'excluded':
        setIncludedFacets((prev) => prev.filter((facet) => facet.id !== id));
        setExcludedFacets((prev) => [...prev, existingFacet]);
        break;
      case 'algoControl':
        setIncludedFacets((prev) => prev.filter((facet) => facet.id !== id));
        setExcludedFacets((prev) => prev.filter((facet) => facet.id !== id));
        break;
    }
  };

  return (
    <>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      {globalFacetsListError && (
        <ErrorMessage>
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}

      {globalRulesetError && (
        <ErrorMessage>
          Error whilst retrieving global ruleset: {globalRulesetError}
        </ErrorMessage>
      )}

      {savingGlobalRulesetError && (
        <ErrorMessage>
          Error whilst saving global ruleset: {savingGlobalRulesetError}
        </ErrorMessage>
      )}

      {updatingGlobalFacetError && (
        <ErrorMessage>
          Error whilst updating global facet: {updatingGlobalFacetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Global Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          setSearch={setSearch}
          onFacetDataChange={onFacetDataChange}
          onHandleStatusChange={onHandleStatusChange}
          refreshData={onRefreshFacetList}
          title="Global Facet Rule Editor"
          facetsData={orderedFilteredFacets}
          defaultCategory={defaultCategory}
          canMergeValueAttributes
          includedFacets={includedFacets}
          excludedFacets={excludedFacets}
          facetType="global"
        />
      )}
      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default Page;
