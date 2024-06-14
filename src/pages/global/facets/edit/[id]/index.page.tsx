import { Heading } from '@/libs/components';

import { useRouter } from 'next/router';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { useFacetsFilter } from '@/libs/hooks/use-facets-filter';
import { useEffect, useState } from 'react';
import { ReturnedFacet } from '@/libs/api';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { useGlobalFacetsList } from '@/libs/hooks/use-global-facets-list';
import { useGlobalFacetUpdate } from '@/libs/hooks/use-global-facet-update';

const defaultCategory = {
  identifier: 'Applies to all pages in marksandspencer.com',
  name: 'All products',
  path: '/',
};

const Page = () => {
  const { facets, isLoading } = useGlobalFacetsList();

  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const [localFacetData, setLocalFacetData] = useState<ReturnedFacet[]>(facets);

  useEffect(() => {
    setLocalFacetData(facets);
  }, [facets]);

  const { setSearch, filteredFacets } = useFacetsFilter(localFacetData);

  const { handleUpdate } = useGlobalFacetUpdate();

  const onFacetDataChange = async (
    index: number,
    value: string | 'included' | 'excluded',
    facet: ReturnedFacet
  ) => {
    // TO-DO handle key of status - this is in endpoint /search/beta/merchandising/global/ruleset/{ruleSetId}
    const response = await handleUpdate({
      facetId: facet.id,
      data: {
        // TO-DO when status is handled, displayValue will need to equal key === 'displayValue' ? value : facet.displayValue
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
      },
    });

    setLocalFacetData((prev) => {
      const updatedFacet: ReturnedFacet = {
        ...prev[index],
        displayValue: response.displayValue,
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
          title="Global Facet Rule Editor"
          facetsData={filteredFacets}
          defaultCategory={defaultCategory}
        />
      )}
      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};

export default Page;
