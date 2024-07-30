import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { ReturnedFacet, RuleSetFacetConfigWithId } from '@/libs/api';
import { Heading } from '@/libs/components';
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
  const { facets, isLoading } = useGlobalFacetsList();
  const router = useRouter();

  const { globalRuleSet } = useGlobalRuleSetDetail(id);

  const [globalFacetsList, setGlobalFacetsList] =
    useState<ReturnedFacet[]>(facets);
  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  useEffect(() => {
    setGlobalFacetsList(facets);
  }, [facets]);

  useEffect(() => {
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { setSearch, filteredFacets } = useFacetsFilter(globalFacetsList);

  const { handleUpdate } = useGlobalFacetUpdate();
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

  const onFacetDataChange = async (
    index: number,
    value: string | 'included' | 'excluded',
    facet: ReturnedFacet
  ) => {
    const response = await handleUpdate({
      facetId: facet.id,
      data: {
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
      },
    });

    setGlobalFacetsList((prev) => {
      const updatedFacet: ReturnedFacet = {
        ...prev[index],
        displayValue: response?.displayValue as string,
      };
      return [...prev.slice(0, index), updatedFacet, ...prev.slice(index + 1)];
    });
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
          title="Global Facet Rule Editor"
          facetsData={filteredFacets}
          defaultCategory={defaultCategory}
          canMergeValueAttributes
          includedFacets={facetsFromGlobalRuleSet}
          canEditDisplayName={true}
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
