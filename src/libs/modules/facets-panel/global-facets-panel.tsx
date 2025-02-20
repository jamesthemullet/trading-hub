import { useEffect, useReducer, useState } from 'react';

import {
  CountryCode,
  ExcludedFacets,
  MerchandisingRules,
  ReturnedFacet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import { useGlobalFacetsList, useGlobalFacetUpdate } from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { facetsPanelReducer } from './facets-panel-reducer';
import { useFacetsRowsSelector } from './use-facets-panel-rows-selector';

type GlobalFacetsPanelProps = {
  ruleSetIncludedFacets?: RuleSetFacetConfigWithId[];
  ruleSetExcludedFacets?: ExcludedFacets;
  ruleSetRules?: MerchandisingRules;
  isLoading: boolean;
  countryCode: CountryCode;
  writeEnabled?: boolean;
  onSave: (value: {
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
  }) => void;
  onCancel: () => void;
};

const GlobalFacetsPanel = ({
  ruleSetIncludedFacets,
  ruleSetExcludedFacets,
  ruleSetRules,
  isLoading,
  countryCode,
  writeEnabled = true,
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

  const [facetsData, setFacetsData] = useState<ReturnedFacet[]>([]);

  const [initialIncludedFacets, setInitialIncludedFacets] = useState<string[]>(
    []
  );
  const [initialExcludedFacets, setInitialExcludedFacets] = useState<string[]>(
    []
  );

  const [facetPanelLocalState, dispatch] = useReducer(facetsPanelReducer, {
    includedFacets: initialIncludedFacets,
    excludedFacets: initialExcludedFacets,
    countryCode: countryCode,
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
          facetType="global"
          canMergeValueAttributes
          facetsState={facetsState}
          rulesetMerchandisingRules={ruleSetRules}
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
