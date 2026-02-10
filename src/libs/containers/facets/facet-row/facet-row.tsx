import { memo } from 'react';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  FacetOrderInput,
  Typography,
} from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import type { RuleSetActions } from '@/libs/components/types';
import { getFacetRoute } from '@/libs/constants';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  displayType: FacetDisplayType;
  index: number;
};

type CommonFacetRowProps = {
  writeEnabled: boolean;
  onDispatch: (action: RuleSetActions) => void;
};

type IncludedFacetRowProps = FacetRowDisplayValue &
  CommonFacetRowProps & {
    displayType: 'included';
    isDragDisabled: boolean;
    includedFacetOrder: string[];
    localOrders: Record<string, number | string>;
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
    showNewFacetValuesPage: boolean;
    selectedCategories: string[];
    selectedSearchTerms: string[];
    facetType: 'search' | 'category' | 'global';
    countryCode: string;
    rulesetId: string;
    onSetIsFacetValuesModalOpen: (value: boolean) => void;
    onSetSelectedFacet: (
      facet: MerchandisingReturnedFacet &
        Partial<MerchandisingRuleSetFacetConfigWithId>
    ) => void;
    rulesetFacets?: MerchandisingRuleSetFacetConfigWithId[];
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
    writeEnabled,
    onDispatch,
  } = props;

  const isIncludedFacet = displayType === 'included';

  const renderRow = (sortableProps?: SortableRowRenderArgs) => (
    <div
      className={styles.facetTableRow}
      data-option={displayType}
      data-testid={`Row showing ${displayValue} as ${displayType}`}
      key={sortableProps ? undefined : id}
      ref={sortableProps?.setNodeRef}
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
            writeEnabled={writeEnabled}
          />
        )}
      </div>
      <div className={styles.tableCol}>
        <Typography variant="bodySmall">{indexPropertyName}</Typography>
      </div>
      <div className={styles.tableCol}>
        <Typography variant="bodySmall">{displayValue}</Typography>
      </div>
      <div className={styles.tableCol}>
        <div className={styles.orderColumn}>
          <CombinedDropdown
            variant="facetOrder"
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
            writeEnabled={writeEnabled}
            ariaLabel="Select to set as included, excluded or algo control"
          />
        </div>
      </div>
      <div className={styles.tableCol}>
        {displayType === 'included' && props.showNewFacetValuesPage && (
          <Button
            as="a"
            theme="secondary"
            href={(() => {
              const baseUrl = getFacetRoute(props.facetType, 'valuesEdit', id);
              const params = new URLSearchParams({
                ruleSetId: props.rulesetId,
                displayName: displayValue,
                countryCode: props.countryCode || 'UK_IE',
              });

              if (
                props.facetType === 'category' &&
                props.selectedCategories.length > 0
              ) {
                props.selectedCategories.forEach((categoryId) => {
                  params.append('categories', categoryId);
                });
              }

              if (
                props.facetType === 'search' &&
                props.selectedSearchTerms.length > 0
              ) {
                props.selectedSearchTerms.forEach((term) => {
                  params.append('searchTerms', term);
                });
              }

              return `${baseUrl}?${params.toString()}`;
            })()}
          >
            {writeEnabled ? 'Edit values' : 'View values'}
          </Button>
        )}
        {displayType === 'included' &&
          writeEnabled &&
          !props.showNewFacetValuesPage && (
            <Button
              theme="secondary"
              onClick={() => {
                props.onSetIsFacetValuesModalOpen(true);
                const rulesetConfig = props.rulesetFacets?.find(
                  (f) => f.id === id
                );
                props.onSetSelectedFacet({
                  displayValue,
                  id,
                  indexPropertyName,
                  boosted: rulesetConfig?.boosted,
                  excludedValues: rulesetConfig?.excludedValues,
                } as MerchandisingReturnedFacet &
                  Partial<MerchandisingRuleSetFacetConfigWithId>);
              }}
            >
              Edit values
            </Button>
          )}
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
      <SortableRow key={id} id={id} disabled={props.isDragDisabled}>
        {(sortableProps) => renderRow(sortableProps)}
      </SortableRow>
    );
  }

  return renderRow();
});

FacetRow.displayName = 'FacetRow';
