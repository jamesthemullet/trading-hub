import { useEffect, useState } from 'react';
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
  const { facets, isLoading, onRefreshFacetList } = useGlobalFacetsList();

  const router = useRouter();
  const [error, setError] = useState<string | undefined>();

  const { globalRuleSet } = useGlobalRuleSetDetail(id);

  const [globalFacetsList, setGlobalFacetsList] =
    useState<ReturnedFacet[]>(facets);
  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);
  const [includedFacets, setIncludedFacets] = useState<ReturnedFacet[]>([]);
  const [orderedLocalFacetData, setOrderedLocalFacetData] = useState<
    ReturnedFacet[]
  >([]);

  useEffect(() => {
    setGlobalFacetsList(facets);
  }, [facets]);

  useEffect(() => {
    const includedFacets = facetsFromGlobalRuleSet
      .map((facet) => {
        const localFacet = globalFacetsList.find(
          (localFacet) => localFacet.id === facet.id
        );
        return localFacet;
      })
      .filter((facet): facet is ReturnedFacet => Boolean(facet));
    setIncludedFacets(includedFacets);
    const excludedFacets = globalFacetsList.filter(
      (facet) =>
        !facetsFromGlobalRuleSet.some((ruleFacet) => ruleFacet.id === facet.id)
    );
    setOrderedLocalFacetData([...includedFacets, ...excludedFacets]);
  }, [globalFacetsList, facetsFromGlobalRuleSet]);

  useEffect(() => {
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { setSearch, filteredFacets } = useFacetsFilter(orderedLocalFacetData);

  const { handleGlobalFacetUpdate } = useGlobalFacetUpdate();
  const { saveGlobalRuleset } = useGlobalRuleSetUpdate();

  const handleSave = async () => {
    const response = await saveGlobalRuleset({
      ruleSetId: globalRuleSet.id,
      ruleSet: {
        facets: facetsFromGlobalRuleSet,
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

    if (!response) {
      setError('Error: failed to update facet');
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
    value: 'included' | 'excluded',
    id?: string
  ) => {
    setFacetsFromGlobalRuleSet((prev) => {
      if (value === 'excluded') {
        return prev.filter((item) => item.id !== id);
      } else {
        const existingFacet = globalFacetsList.find((facet) => facet.id === id);
        // istanbul ignore next
        if (!existingFacet) {
          return prev;
        }

        const facetToAdd = {
          id: existingFacet.id,
          boosted: existingFacet.boosted,
          excludedValues: existingFacet.excludedValues,
        };

        if (!prev.find((facet) => facet.id === facetToAdd.id)) {
          return [...prev, facetToAdd];
        } else {
          return prev;
        }
      }
    });
  };

  return (
    <>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

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
          facetsData={filteredFacets}
          defaultCategory={defaultCategory}
          canMergeValueAttributes
          includedFacets={includedFacets}
          facetType="global"
        />
      )}
      <FilteredResultsPanel filteredFacets={filteredFacets.length} />

      {error && <ErrorMessage>{error}</ErrorMessage>}
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
