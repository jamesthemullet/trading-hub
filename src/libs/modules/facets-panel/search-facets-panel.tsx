import { useEffect, useReducer, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRules,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import { useFacetsList } from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { facetsPanelReducer } from './facets-panel-reducer';
import { useFacetsRowsSelector } from './use-facets-panel-rows-selector';

type SearchFacetsPanelProps = {
  ruleSetIncludedFacets: MerchandisingRuleSetFacetConfigWithId[] | undefined;
  ruleSetExcludedFacets: MerchandisingExcludedFacets | undefined;
  isLoading: boolean;
  countryCode: MerchandisingCountryCode;
  searchTerms: string[];
  ruleSetRules?: MerchandisingRules;
  startDate?: string;
  endDate?: string;
  isNewRuleset?: boolean;
  writeEnabled?: boolean;
  onSave: (value: {
    searchTerms: string[];
    includedFacets: MerchandisingReturnedFacet[];
    excludedFacets: MerchandisingExcludedFacets;
    countryCode: MerchandisingCountryCode;
    dateTime?: [Date | null, Date | null];
  }) => void;
  onCancel: () => void;
  refreshData?: () => void;
};

const SearchFacetsPanel = ({
  ruleSetIncludedFacets,
  ruleSetExcludedFacets,
  isLoading,
  countryCode,
  searchTerms,
  ruleSetRules,
  startDate,
  endDate,
  isNewRuleset,
  writeEnabled = true,
  onSave,
  onCancel,
  refreshData,
}: SearchFacetsPanelProps) => {
  const [stateInitialised, setStateInitialised] = useState(false);

  const [selectedSearchTerms, setSelectedSearchTerms] =
    useState<Array<string>>(searchTerms);

  const [dateTime, setDateTime] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [facetsData, setFacetsData] = useState<MerchandisingReturnedFacet[]>(
    []
  );

  const [initialIncludedFacets, setInitialIncludedFacets] = useState<string[]>(
    []
  );
  const [initialExcludedFacets, setInitialExcludedFacets] = useState<string[]>(
    []
  );

  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >('UK');

  const [facetPanelLocalState, dispatch] = useReducer(facetsPanelReducer, {
    includedFacets: initialIncludedFacets,
    excludedFacets: initialExcludedFacets,
    countryCode: countryCode,
  });

  const { facets, error: getFacetsDataError } = useFacetsList({
    query: selectedSearchTerms,
    queryBy: 'searchTerms',
    enabled: !isLoading,
    countryCode: facetPanelLocalState.countryCode,
  });

  const { facetsState, includedFacets, excludedFacets } = useFacetsRowsSelector(
    facetPanelLocalState,
    facetsData
  );

  useEffect(() => {
    if (startDate && endDate) {
      setDateTime([new Date(startDate), new Date(endDate)]);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const newIncludedFacets = ruleSetIncludedFacets?.map((facet) => {
      return facet.id;
    });

    const newExcludedFacets = ruleSetExcludedFacets?.facets
      ?.map((facet) => facet.id)
      .filter((id): id is string => id !== undefined);

    const newFacetsData = facets.map((facet) => {
      const includedFacet = ruleSetIncludedFacets?.find(
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
    if (!stateInitialised) {
      setInitialIncludedFacets(newIncludedFacets || []);
      setInitialExcludedFacets(newExcludedFacets || []);

      setStateInitialised(true);
    }
  }, [
    facets,
    stateInitialised,
    ruleSetIncludedFacets,
    ruleSetExcludedFacets?.facets,
  ]);

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
    facetPanelLocalState.countryCode,
    countryCode,
  ]);

  const handleSave = () => {
    onSave({
      searchTerms: selectedSearchTerms,
      includedFacets,
      excludedFacets,
      countryCode:
        facetPanelLocalState.countryCode ||
        // istanbul ignore next
        'UK_IE',
      dateTime,
    });
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

  return (
    <>
      {getFacetsDataError && (
        <ErrorMessage>
          Error whilst retrieving facet list: {getFacetsDataError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" aria-busy="true" />
      ) : (
        <FacetsPanel
          title="Facet Rule Editor"
          facetType="search"
          displayRowOrderControls={true}
          isNewRuleset={isNewRuleset}
          startDate={startDate}
          endDate={endDate}
          facetsState={facetsState}
          rulesetMerchandisingRules={ruleSetRules}
          searchTerms={selectedSearchTerms}
          countryCode={facetPanelLocalState.countryCode}
          includedFacets={includedFacets}
          excludedFacets={excludedFacets}
          selectedPreviewCountryCode={selectedPreviewCountryCode}
          setSelectedPreviewCountryCode={setSelectedPreviewCountryCode}
          onSave={handleSave}
          onCancel={onCancel}
          setDateTime={setDateTime}
          refreshData={refreshData}
          updatedValues={handleUpdatedValues}
          dispatch={dispatch}
          setSearchTerms={setSelectedSearchTerms}
          writeEnabled={writeEnabled}
        />
      )}
    </>
  );
};

export default SearchFacetsPanel;
