import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { ReturnedFacet } from '@/libs/api';
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

const defaultCategory = {
  identifier: 'Applies to all pages in marksandspencer.com',
  name: 'All products',
  path: '/',
};

const Page = () => {
  const { facets, isLoading } = useGlobalFacetsList();

  const router = useRouter();
  const globalId = router.query.id as string;

  const [localFacetData, setLocalFacetData] = useState<ReturnedFacet[]>(facets);

  useEffect(() => {
    setLocalFacetData(facets);
  }, [facets]);

  const { setSearch, filteredFacets } = useFacetsFilter(localFacetData);

  const { handleUpdate } = useGlobalFacetUpdate();
  const { saveGlobalRuleset } = useGlobalRuleSetUpdate();
  const { globalRuleSet } = useGlobalRuleSetDetail(globalId);

  const handleSave = async () => {
    const response = await saveGlobalRuleset({
      ruleSetId: globalRuleSet.id,
      ruleSet: {
        facets: filteredFacets,
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

    setLocalFacetData((prev) => {
      const updatedFacet: ReturnedFacet = {
        ...prev[index],
        displayValue: response?.displayValue as string,
      };
      return [...prev.slice(0, index), updatedFacet, ...prev.slice(index + 1)];
    });
  };

  const onHandleStatusChange = async (
    index: number,
    value: 'included' | 'excluded'
  ) => {
    setLocalFacetData((prev) => {
      const updatedFacet: ReturnedFacet = {
        ...prev[index],
        status: value,
      };
      return [...prev.slice(0, index), updatedFacet, ...prev.slice(index + 1)];
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
        />
      )}
      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};

export default Page;
