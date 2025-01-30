import { useEffect, useReducer, useState } from 'react';

import {
  CountryCode,
  ExcludedFacets,
  MerchandisingRules,
  ReturnedFacet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import { useFacetsList } from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { facetsPanelReducer } from './facets-panel-reducer';
import { useFacetsRowsSelector } from './use-facets-panel-rows-selector';

type CategoryFacetsPanelProps = {
  ruleSetIncludedFacets: RuleSetFacetConfigWithId[] | undefined;
  ruleSetExcludedFacets: ExcludedFacets | undefined;
  ruleSetRules?: MerchandisingRules;
  isLoading: boolean;
  countryCode: CountryCode;
  categoryIds: string[];
  startDate?: string;
  endDate?: string;
  isNewRuleset?: boolean;
  writeEnabled?: boolean;
  onSave: (value: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
    dateTime?: [Date | null, Date | null];
  }) => void;
  onCancel: () => void;
  refreshData?: () => void;
};

const CategoryFacetsPanel = ({
  ruleSetIncludedFacets,
  ruleSetExcludedFacets,
  ruleSetRules,
  isLoading,
  countryCode,
  categoryIds,
  startDate,
  endDate,
  isNewRuleset,
  writeEnabled = true,
  onSave,
  onCancel,
  refreshData,
}: CategoryFacetsPanelProps) => {
  const [stateInitialised, setStateInitialised] = useState(false);

  const [selectedCategories, setSelectedCategories] =
    useState<Array<string>>(categoryIds);

  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >(categoryIds && categoryIds[0]?.includes('IE_') ? 'IE' : 'UK');

  const [dateTime, setDateTime] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

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

  const { facets, error: getFacetsDataError } = useFacetsList({
    query: selectedCategories,
    queryBy: 'categoryIds',
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

    const newExcludedFacets = facets
      .filter((facet) =>
        ruleSetExcludedFacets?.facets?.some(
          (excludedFacet) => excludedFacet?.id === facet.id
        )
      )
      .map((facet) => facet.id);

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
    if (!stateInitialised && newFacetsData?.length) {
      setInitialIncludedFacets(newIncludedFacets || []);
      setInitialExcludedFacets(newExcludedFacets);

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
      categoryIds: selectedCategories,
      includedFacets,
      excludedFacets,
      countryCode: facetPanelLocalState.countryCode || 'UK_IE',
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
        <FacetsPanelSkeleton title="Facet Rule Editor" />
      ) : (
        <FacetsPanel
          title="Facet Rule Editor"
          facetType="category"
          displayRowOrderControls={true}
          isNewRuleset={isNewRuleset}
          startDate={startDate}
          endDate={endDate}
          facetsState={facetsState}
          rulesetMerchandisingRules={ruleSetRules}
          selectedCategories={selectedCategories}
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
          setSelectedCategories={setSelectedCategories}
          writeEnabled={writeEnabled}
        />
      )}
    </>
  );
};

export default CategoryFacetsPanel;
