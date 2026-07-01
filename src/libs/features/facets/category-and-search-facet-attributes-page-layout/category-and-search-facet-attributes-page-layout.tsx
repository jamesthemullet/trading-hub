import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { getFacetRoute, getNewFacetRoute } from '@/libs/constants';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetAttributesListActions } from '@/libs/containers';
import { ModalUnsavedChanges } from '@/libs/containers/shared/modals';
import type { Action } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';
import { facetAttributesPageReducer } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';

import intersection from 'lodash/intersection';
import without from 'lodash/without';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { SearchAndCategoryFacetAttributesList } from '../search-and-category-facet-attributes-list/search-and-category-facet-attributes-list';
import { appendUndoState } from './undo-history';

type PageLayout = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facet: MerchandisingRuleSetFacetConfigWithId;
  displayName: string;
  facetType: FacetType.Category | FacetType.Search;
  ruleSetId: string;
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: (newFacet: MerchandisingRuleSetFacetConfigWithId) => void;
  isWriteEnabled: boolean;
  headerText?: string;
  countryCode?: string;
  isDraftRuleset?: boolean;
};

export const CategoryAndSearchFacetsPanelPageLayout = ({
  attributeValues,
  facet,
  displayName,
  facetType,
  ruleSetId,
  searchQuery,
  onSearchChange,
  onSave,
  isWriteEnabled,
  headerText,
  countryCode = 'UK_IE',
  isDraftRuleset = false,
}: PageLayout) => {
  const router = useRouter();

  const processedFacet = useMemo(() => {
    const intersectedValues = intersection(facet.boosted, facet.excludedValues);

    const boosted = without(facet.boosted, ...intersectedValues);

    return {
      ...facet,
      ...(boosted.length > 0 && { boosted }),
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(
    facetAttributesPageReducer,
    processedFacet
  );

  const algoControlValues = attributeValues
    .filter((value) => !facetLocalState.boosted!.includes(value.displayValue))
    .filter(
      (value) => !facetLocalState.excludedValues?.includes(value.displayValue)
    );
  const includedValues = facetLocalState.boosted!.map((value, index) => ({
    displayValue: value,
    order: index + 1,
  }));

  const excludedValues = attributeValues.filter((value) =>
    facetLocalState.excludedValues?.includes(value.displayValue)
  );

  const isUndoButtonVisible = facetType === FacetType.Category;

  const [stateHistory, setStateHistory] = useState<
    MerchandisingRuleSetFacetConfigWithId[]
  >([]);

  const dispatchWithHistory = useCallback(
    (action: Action) => {
      setStateHistory((prev) => appendUndoState(prev, { ...facetLocalState }));
      dispatch(action);
    },
    [facetLocalState]
  );

  const handleUndo = useCallback(() => {
    /* istanbul ignore next -- defensive guard behind disabled button */
    if (stateHistory.length === 0) return;
    const previousState = stateHistory[stateHistory.length - 1];
    setStateHistory((prev) => prev.slice(0, -1));
    dispatch({ type: 'RESTORE_STATE', payload: previousState });
  }, [stateHistory]);

  const hasChanges = stateHistory.length > 0;

  const handleUndoHotkey = useCallback(() => {
    if (!isUndoButtonVisible || !hasChanges) return;
    handleUndo();
  }, [isUndoButtonVisible, hasChanges, handleUndo]);

  useHotkeys([['mod+z', handleUndoHotkey]]);

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);

  const navigateBack = useCallback(() => {
    if (isDraftRuleset) {
      router.push(getNewFacetRoute(facetType));
      return;
    }
    router.push(getFacetRoute(facetType, 'edit', ruleSetId));
  }, [isDraftRuleset, router, facetType, ruleSetId]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setIsUnsavedChangesModalOpen(true);
      return;
    }
    navigateBack();
  }, [hasChanges, navigateBack]);

  const handleSave = () => {
    onSave(facetLocalState);
    setStateHistory([]);
  };

  return (
    <>
      <FacetAttributesPageLayoutHeader
        algoControlValues={algoControlValues.length}
        includedValues={includedValues.length}
        excludedValues={excludedValues.length}
        displayName={displayName}
        facetType={facetType}
        headerText={headerText}
        onClose={handleClose}
        onSave={handleSave}
        isWriteEnabled={isWriteEnabled}
        isUndoButtonVisible={isUndoButtonVisible}
        isUndoDisabled={!hasChanges}
        onUndo={handleUndo}
        countryCode={countryCode}
        isDraftRuleset={isDraftRuleset}
      />

      <FacetAttributesListActions
        onSearchChange={onSearchChange}
        isMergeHidden
        isWriteEnabled={isWriteEnabled}
      />

      <SearchAndCategoryFacetAttributesList
        boostedValues={includedValues}
        algoControlValues={algoControlValues}
        excludedValues={excludedValues}
        dispatch={dispatchWithHistory}
        searchQuery={searchQuery}
        isWriteEnabled={isWriteEnabled}
      />

      <ModalUnsavedChanges
        opened={isUnsavedChangesModalOpen}
        onClose={navigateBack}
        onContinue={() => setIsUnsavedChangesModalOpen(false)}
      />
    </>
  );
};
