import { ReturnedGlobalFacet } from '@/libs/api';
import { useGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';

import { EditFacetModalV2 } from './edit-facet-modal-v2';

export const EditFacetModal = ({
  onClose,
  updatedValues,
  refreshData,
  facet,
  facetType,
  category,
}: {
  onClose: () => void;
  facet: ReturnedGlobalFacet;
  facetType: 'global' | 'category' | 'search';
  refreshData?: () => void;
  onHandleSave?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[]
  ) => void;
  updatedValues?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[],
    id: string
  ) => void;
  category: string | undefined;
}) => {
  const { handleGlobalFacetUpdate } = useGlobalFacetUpdate();

  return (
    <EditFacetModalV2
      onClose={onClose}
      mergeEnabled={facetType === 'global'}
      removeFacetValueFromMergeGroupEnabled={facetType === 'global'}
      displayValueEditEnabled={facetType === 'global'}
      saveButtonLabel={facetType === 'global' ? 'Save' : 'Done'}
      onSave={async (facet) => {
        const facetBoosted = facet.boosted ?? [];
        const facetExcludedValues = facet.excludedValues ?? [];
        if (facetType === 'global') {
          await handleGlobalFacetUpdate({
            facetId: facet.id,
            data: facet,
          });
          refreshData?.();
        } else {
          updatedValues?.(facetBoosted, facetExcludedValues, facet.id);
          onClose();
        }
      }}
      facet={facet}
      category={category}
    />
  );
};
