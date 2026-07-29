import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import type { LastChanged } from '@/libs/components';
import { ErrorMessage } from '@/libs/components';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsPanel } from '@/libs/features/facets/facets-panel/facets-panel';
import { useGlobalFacetsList, useGlobalFacetUpdate } from '@/libs/hooks';

type GlobalFacetsPanelProps = {
  ruleSetIncludedFacets?: MerchandisingRuleSetFacetConfigWithId[];
  ruleSetExcludedFacets?: MerchandisingExcludedFacets;
  isLoading: boolean;
  countryCode: MerchandisingCountryCode;
  isWriteEnabled: boolean;
  onSave: (value: {
    includedFacets: MerchandisingReturnedFacet[];
    excludedFacets: MerchandisingExcludedFacets;
    countryCode: MerchandisingCountryCode;
  }) => void;
  onCancel: () => void;
  lastChanged?: LastChanged;
};

const GlobalFacetsPanel = ({
  ruleSetIncludedFacets,
  ruleSetExcludedFacets,
  isLoading,
  countryCode,
  isWriteEnabled,
  onSave,
  onCancel,
  lastChanged,
}: GlobalFacetsPanelProps): ReactElement => {
  const {
    facets,
    isLoading: isLoadingFacets,
    error: globalFacetsListError,
  } = useGlobalFacetsList();
  const { handleGlobalFacetUpdate, error: updatingGlobalFacetError } =
    useGlobalFacetUpdate();

  const [displayValueOverrides, setDisplayValueOverrides] = useState<
    Record<string, string>
  >({});

  const initialIncludedFacetIds = useMemo(
    () => ruleSetIncludedFacets?.map((facet) => facet.id) || [],
    [ruleSetIncludedFacets]
  );

  const initialExcludedFacetIds = useMemo(
    () =>
      ruleSetExcludedFacets?.facets?.map(
        (facet) =>
          // istanbul ignore next
          facet.id || ''
      ) || [],
    [ruleSetExcludedFacets?.facets]
  );

  const facetsData = useMemo(
    () =>
      facets.map((facet) => {
        const overriddenDisplayValue = displayValueOverrides[facet.id];

        if (overriddenDisplayValue === undefined) {
          return facet;
        }

        return {
          ...facet,
          displayValue: overriddenDisplayValue,
        };
      }),
    [facets, displayValueOverrides]
  );

  const onFacetDataChange = async ({
    value,
    facet,
  }: {
    value: string;
    facet: MerchandisingReturnedFacet;
  }) => {
    setDisplayValueOverrides((prev) => ({
      ...prev,
      [facet.id]: value,
    }));

    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
      },
    });

    if (response && 'status' in response && response.status === 'error') {
      setDisplayValueOverrides((prev) => ({
        ...prev,
        [facet.id]: facet.displayValue,
      }));
      return;
    }
  };

  return (
    <>
      {globalFacetsListError && (
        <ErrorMessage>
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}
      {updatingGlobalFacetError && (
        <ErrorMessage>
          Error whilst updating global facet: {updatingGlobalFacetError}
        </ErrorMessage>
      )}

      {isLoading || isLoadingFacets ? (
        <FacetsPanelSkeleton
          title="Global Facet Rule Editor"
          aria-busy="true"
        />
      ) : (
        <FacetsPanel
          title="Global Facet Rule Editor"
          facetsData={facetsData}
          initialIncludedFacetIds={initialIncludedFacetIds}
          initialExcludedFacetIds={initialExcludedFacetIds}
          countryCode={countryCode}
          onSave={onSave}
          onCancel={onCancel}
          onFacetDataChange={onFacetDataChange}
          isWriteEnabled={isWriteEnabled}
          lastChanged={lastChanged}
        />
      )}
    </>
  );
};

export default GlobalFacetsPanel;
