import { memo, useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSet,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  FacetOrderInput,
  Typography,
} from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import type { RuleSetActions } from '@/libs/components/types';
import { getFacetRoute } from '@/libs/constants';
import { FacetType } from '@/libs/constants/rule-types';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { ModalEditValuesUnsavedChanges } from '@/libs/containers/shared/modals';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useDraftRuleset } from '@/libs/hooks';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  displayType: FacetDisplayType;
  index: number;
};

type CommonFacetRowProps = {
  isWriteEnabled: boolean;
  onDispatch: (action: RuleSetActions) => void;
  hasChanges: boolean;
  isNewlyIncluded?: boolean;
  isUnavailable?: boolean;
};

type IncludedFacetRowProps = FacetRowDisplayValue &
  CommonFacetRowProps & {
    displayType: 'included';
    isDragDisabled: boolean;
    includedFacetOrder: string[];
    localOrders: Record<string, number | ''>;
    handleInputChange: (displayValue: string, value: string) => void;
    handleInputBlur: (
      displayValue: string,
      value: string,
      order: number
    ) => void;
    handleInputKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      displayValue: string,
      order: number
    ) => void;
    handleFacetOrderInputRef: (
      facetId: string
    ) => (el: HTMLInputElement | null) => void;
    selectedCategories: string[];
    selectedSearchTerms: string[];
    facetType: FacetType;
    countryCode: string;
    rulesetId: string;
    isNewRuleset?: boolean;
    currentRuleset: MerchandisingRuleSet;
  };

type NonIncludedFacetRowProps = FacetRowDisplayValue &
  CommonFacetRowProps & {
    displayType: 'algoControl' | 'excluded';
  };

export type FacetRowProps = IncludedFacetRowProps | NonIncludedFacetRowProps;

export const FacetRow = memo<FacetRowProps>((props: FacetRowProps) => {
  const {
    displayValue,
    displayType,
    id,
    indexPropertyName,
    isWriteEnabled,
    onDispatch,
    hasChanges,
    isNewlyIncluded,
    isUnavailable,
  } = props;

  const { saveDraft } = useDraftRuleset();
  const router = useRouter();

  const isIncludedFacet = displayType === 'included';

  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingEditValuesHref, setPendingEditValuesHref] = useState('');

  const handleEditValuesForNewRuleset = useCallback(() => {
    if (isIncludedFacet && 'isNewRuleset' in props && props.isNewRuleset) {
      // istanbul ignore else
      if (props.currentRuleset) {
        switch (props.facetType) {
          case 'category':
            saveDraft({
              ruleset: {
                ...props.currentRuleset,
                categoryIds: props.selectedCategories,
              },
              type: 'category',
            });
            break;
          case 'search':
            saveDraft({
              ruleset: {
                ...props.currentRuleset,
                searchTerms: props.selectedSearchTerms,
              },
              type: 'search',
            });
            break;
          // istanbul ignore next
          default:
            // istanbul ignore next
            break;
        }
      }
    }
  }, [props, isIncludedFacet, saveDraft]);

  const handleEditValuesClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (hasChanges) {
        e.preventDefault();
        setPendingEditValuesHref(href);
        setShowUnsavedChangesModal(true);
      } else {
        handleEditValuesForNewRuleset();
      }
    },
    [hasChanges, handleEditValuesForNewRuleset]
  );

  const handleModalConfirm = useCallback(() => {
    setShowUnsavedChangesModal(false);
    handleEditValuesForNewRuleset();
    router.push(pendingEditValuesHref);
  }, [handleEditValuesForNewRuleset, pendingEditValuesHref, router]);

  const renderRow = (sortableProps?: SortableRowRenderArgs) => (
    <div
      className={styles.facetTableRow}
      data-option={displayType}
      data-unavailable={isUnavailable || undefined}
      data-testid={`Row showing ${displayValue} as ${displayType}`}
      key={sortableProps ? undefined : id}
      ref={sortableProps?.setNodeRef}
      // eslint-disable-next-line react/forbid-dom-props
      style={sortableProps?.style}
      data-with-reorder
    >
      <div className={`${styles.tableCol} ${styles.facetOrderInput}`}>
        {isIncludedFacet && (
          <FacetOrderInput
            displayValue={id}
            order={props.includedFacetOrder.indexOf(id) + 1}
            localOrder={
              props.localOrders[id] ?? props.includedFacetOrder.indexOf(id) + 1
            }
            inputRef={props.handleFacetOrderInputRef(id)}
            onInputChange={props.handleInputChange}
            onInputBlur={props.handleInputBlur}
            onInputKeyDown={props.handleInputKeyDown}
            isWriteEnabled={isWriteEnabled}
          />
        )}
      </div>
      <div className={styles.tableCol}>
        <Typography variant="bodySmall">{indexPropertyName}</Typography>
      </div>
      <div className={styles.tableCol}>
        <Typography variant="bodySmall">{displayValue}</Typography>
        {isUnavailable && (
          <Typography variant="bodySmall" className={styles.unavailableText}>
            — currently not available
          </Typography>
        )}
      </div>
      <div className={styles.tableCol}>
        <div className={styles.orderColumn}>
          <CombinedDropdown
            variant={DropdownVariant.FacetOrder}
            status={displayType}
            onChange={(status) => {
              if (status === displayType) return;
              onDispatch({
                type: 'facetChangeDisplayType',
                payload: {
                  id,
                  newType: status as FacetDisplayType,
                  oldType: displayType,
                },
              });
            }}
            hasAlgoControl
            isWriteEnabled={isWriteEnabled}
            ariaLabel="Select to set as included, excluded or algo control"
          />
        </div>
      </div>
      <div className={styles.tableCol}>
        {displayType === 'included' &&
          !isUnavailable &&
          props.facetType !== FacetType.Global &&
          (() => {
            const baseUrl = getFacetRoute(props.facetType, 'valuesEdit', id);
            const ruleSetIdParam = !props.rulesetId ? 'draft' : props.rulesetId;
            const params = new URLSearchParams({
              ruleSetId: ruleSetIdParam,
              displayName: displayValue,
              countryCode: props.countryCode || 'UK_IE',
            });

            if (
              props.facetType === FacetType.Category &&
              props.selectedCategories.length > 0
            ) {
              props.selectedCategories.forEach((categoryId) => {
                params.append('categories', categoryId);
              });
            }

            if (
              props.facetType === FacetType.Search &&
              props.selectedSearchTerms.length > 0
            ) {
              props.selectedSearchTerms.forEach((term) => {
                params.append('searchTerms', term);
              });
            }

            if (!isWriteEnabled) {
              params.set('readOnly', 'true');
            }

            const editValuesHref = `${baseUrl}?${params.toString()}`;

            return (
              <Button
                as="a"
                theme="secondary"
                onClick={(e: React.MouseEvent) =>
                  handleEditValuesClick(e, editValuesHref)
                }
                href={editValuesHref}
              >
                {isWriteEnabled ? 'Edit values' : 'View values'}
              </Button>
            );
          })()}
      </div>
      <div className={styles.tableCol}>
        {isIncludedFacet && (
          <DragHandleButton
            disabled={props.isDragDisabled}
            displayName={displayValue}
            setActivatorNodeRef={sortableProps?.setActivatorNodeRef}
            listeners={sortableProps?.listeners ?? {}}
          />
        )}
      </div>
    </div>
  );

  if (isIncludedFacet) {
    return (
      <>
        <SortableRow key={id} id={id} disabled={props.isDragDisabled}>
          {(sortableProps) => renderRow(sortableProps)}
        </SortableRow>
        {showUnsavedChangesModal && (
          <ModalEditValuesUnsavedChanges
            onConfirm={handleModalConfirm}
            onCancel={() => setShowUnsavedChangesModal(false)}
            isNewlyIncluded={isNewlyIncluded}
          />
        )}
      </>
    );
  }

  return renderRow();
});

FacetRow.displayName = 'FacetRow';
