import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import { getFacetRoute, getNewFacetRoute } from '@/libs/constants';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetAttributesListActions } from '@/libs/containers';
import { ModalUnsavedChanges } from '@/libs/containers/shared/modals';
import { diffFacetValues } from '@/libs/hooks/utils/diff';
import type { Action } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';
import { facetAttributesPageReducer } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';

import intersection from 'lodash/intersection';
import without from 'lodash/without';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { SearchAndCategoryFacetAttributesList } from '../search-and-category-facet-attributes-list/search-and-category-facet-attributes-list';
import { appendUndoState } from './undo-history';

const EMPTY_VALUES: string[] = [];

export const getFacetValuesOrEmpty = (values?: string[]): string[] =>
  values ?? EMPTY_VALUES;

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
    const boosted = facet.boosted ?? [];
    const excludedValues = facet.excludedValues ?? [];
    const intersectedValues = intersection(boosted, excludedValues);

    const deduplicatedBoosted = without(boosted, ...intersectedValues);

    return {
      ...facet,
      boosted: deduplicatedBoosted,
      excludedValues,
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(
    facetAttributesPageReducer,
    processedFacet
  );
  const boostedValues = getFacetValuesOrEmpty(facetLocalState.boosted);
  const excludedFacetValues = getFacetValuesOrEmpty(
    facetLocalState.excludedValues
  );

  const algoControlValues = attributeValues
    .filter((value) => !boostedValues.includes(value.displayValue))
    .filter((value) => !excludedFacetValues.includes(value.displayValue));
  const includedValues = boostedValues.map((value, index) => ({
    displayValue: value,
    order: index + 1,
  }));

  const excludedValues = attributeValues.filter((value) =>
    excludedFacetValues.includes(value.displayValue)
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const diffItems = useMemo(
    () =>
      diffFacetValues(
        processedFacet.boosted,
        boostedValues,
        processedFacet.excludedValues,
        excludedFacetValues
      ),
    [boostedValues, excludedFacetValues, processedFacet]
  );

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
    if (isDraftRuleset) {
      onSave(facetLocalState);
      setStateHistory([]);
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleConfirmSave = () => {
    setIsReviewModalOpen(false);
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

      <RulesetDiffModal
        opened={isReviewModalOpen}
        diffItems={diffItems}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsReviewModalOpen(false)}
      />
    </>
  );
};
