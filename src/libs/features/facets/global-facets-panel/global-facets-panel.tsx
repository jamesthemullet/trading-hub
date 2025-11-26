import { useEffect, useReducer, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsPanel } from '@/libs/features/facets/facets-panel/facets-panel';
import { useGlobalFacetsList, useGlobalFacetUpdate } from '@/libs/hooks';
import { facetsPanelReducer } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { useFacetsRowsSelector } from '@/libs/stores/facets-panel/use-facets-panel-rows-selector';

type GlobalFacetsPanelProps = {
  ruleSetIncludedFacets?: MerchandisingRuleSetFacetConfigWithId[];
  ruleSetExcludedFacets?: MerchandisingExcludedFacets;
  isLoading: boolean;
  countryCode: MerchandisingCountryCode;
  writeEnabled: boolean;
  onSave: (value: {
    includedFacets: MerchandisingReturnedFacet[];
    excludedFacets: MerchandisingExcludedFacets;
    countryCode: MerchandisingCountryCode;
  }) => void;
  onCancel: () => void;
};

const GlobalFacetsPanel = ({
  ruleSetIncludedFacets,
  ruleSetExcludedFacets,
  isLoading,
  countryCode,
  writeEnabled,
  onSave,
  onCancel,
}: GlobalFacetsPanelProps) => {
  const {
    facets,
    onRefreshFacetList,
    isLoading: isLoadingFacets,
    error: globalFacetsListError,
  } = useGlobalFacetsList();
  const { handleGlobalFacetUpdate, error: updatingGlobalFacetError } =
    useGlobalFacetUpdate();

  const [facetsData, setFacetsData] = useState<MerchandisingReturnedFacet[]>(
    []
  );

  const [initialIncludedFacets, setInitialIncludedFacets] = useState<string[]>(
    []
  );
  const [initialExcludedFacets, setInitialExcludedFacets] = useState<string[]>(
    []
  );

  const [facetPanelLocalState, dispatch] = useReducer(facetsPanelReducer, {
    includedFacets: initialIncludedFacets,
    excludedFacets: initialExcludedFacets,
    countryCode,
  });

  useEffect(() => {
    setFacetsData(facets);
  }, [facets]);

  const { facetsState, includedFacets, excludedFacets } = useFacetsRowsSelector(
    facetPanelLocalState,
    facetsData
  );

  useEffect(() => {
    const includedFacets = ruleSetIncludedFacets?.map((facet) => {
      return facet.id;
    });

    const excludedFacets =
      ruleSetExcludedFacets?.facets?.map(
        (facet) =>
          // istanbul ignore next
          facet.id || ''
      ) || [];

    setInitialIncludedFacets(includedFacets || []);
    setInitialExcludedFacets(excludedFacets);
  }, [ruleSetIncludedFacets, ruleSetExcludedFacets?.facets]);

  useEffect(() => {
    dispatch({
      type: 'INITIALISE_STATE',
      payload: {
        includedFacets: initialIncludedFacets,
        excludedFacets: initialExcludedFacets,
        countryCode: facetPanelLocalState.countryCode || countryCode,
      },
    });
  }, [
    initialIncludedFacets,
    initialExcludedFacets,
    countryCode,
    facetPanelLocalState.countryCode,
  ]);

  const handleSave = () => {
    onSave({
      includedFacets,
      excludedFacets,
      countryCode: facetPanelLocalState.countryCode || 'UK_IE',
    });
  };

  const onFacetDataChange = async ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded';
    facet: MerchandisingReturnedFacet;
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

    const updatedGlobalFacets = facetsData.map((globalFacet) => {
      if (globalFacet.id === facet.id) {
        return { ...globalFacet, displayValue: response?.displayValue };
      }
      return globalFacet;
    });

    setFacetsData(updatedGlobalFacets);
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
          canMergeValueAttributes
          facetsState={facetsState}
          countryCode={facetPanelLocalState.countryCode}
          includedFacets={includedFacets}
          excludedFacets={excludedFacets}
          dispatch={dispatch}
          onSave={handleSave}
          onCancel={onCancel}
          refreshData={onRefreshFacetList}
          onFacetDataChange={onFacetDataChange}
          writeEnabled={writeEnabled}
        />
      )}
    </>
  );
};

export default GlobalFacetsPanel;
