import { memo } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  FacetOrderInput,
  Typography,
} from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import { ROUTES } from '@/libs/constants';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import type {
  FacetDisplayType,
  FacetRowDisplayValue,
} from '@/libs/stores/facets-panel/facets-panel-reducer';

import styles from './facets-panel.module.css';

type OnFacetDataChange = ({
  value,
  facet,
}: {
  value: string;
  facet: MerchandisingReturnedFacet;
}) => void;

type FacetRowProps = {
  facet: FacetRowDisplayValue;
  errorMessage: string;
  writeEnabled: boolean;
  canReorderIncludedFacets: boolean;
  order: number;
  localOrder: number | '';
  isDisplayValueDuplicate: (facetId: string, value: string) => boolean;
  countryCode: MerchandisingCountryCode;
  ruleSetId: string;
  setError: (id: string, message: string) => void;
  onFacetDataChange: OnFacetDataChange;
  onDisplayTypeChange: (id: string, newDisplayType: FacetDisplayType) => void;
  getInputRef: (id: string) => (el: HTMLInputElement | null) => void;
  handleInputChange: (displayValue: string, value: string) => void;
  handleInputBlur: (displayValue: string, value: string, order: number) => void;
  handleInputKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    displayValue: string,
    order: number
  ) => void;
};

export const FacetRow = memo(
  ({
    facet,
    errorMessage,
    writeEnabled,
    canReorderIncludedFacets,
    order,
    localOrder,
    isDisplayValueDuplicate,
    countryCode,
    ruleSetId,
    setError,
    onFacetDataChange,
    onDisplayTypeChange,
    getInputRef,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  }: FacetRowProps) => {
    const { displayValue, displayType, id } = facet;
    const isIncludedFacet = displayType === 'included';
    const isDragDisabled = !writeEnabled || !canReorderIncludedFacets;

    const renderRow = (sortableProps?: SortableRowRenderArgs) => (
      <div
        className={styles.facetTableRow}
        data-option={displayType}
        data-testid={`Row showing ${facet.displayValue} as ${displayType}`}
        key={sortableProps ? undefined : id}
        ref={sortableProps?.setNodeRef}
        // eslint-disable-next-line react/forbid-dom-props
        style={sortableProps?.style}
        {...(sortableProps?.attributes ?? {})}
        data-with-reorder
      >
        <div className={`${styles.tableCol} ${styles.facetOrderInput}`}>
          {displayType === 'included' && (
            <FacetOrderInput
              displayValue={id}
              order={order}
              localOrder={localOrder}
              inputRef={getInputRef(id)}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              onInputKeyDown={handleInputKeyDown}
              writeEnabled={writeEnabled}
            />
          )}
        </div>

        <div className={styles.tableCol}>
          <Typography variant="bodySmall">{facet.indexPropertyName}</Typography>
        </div>

        <div className={styles.tableCol}>
          {writeEnabled ? (
            <EditableLabel
              displayValue={displayValue}
              onCancel={() => setError(id, '')}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange({ value: newValue, facet })
              }
              canCancelEdit
              showErrorState={!!errorMessage}
              setError={(message) => setError(id, message)}
              disallowedErrorMessage={errorMessage}
              handleUpdatedValue={(event) => {
                event.stopPropagation();
                if (event.target.value === '') {
                  setError(id, 'You must supply a value');
                } else if (isDisplayValueDuplicate(id, event.target.value)) {
                  setError(id, `${event.target.value} is not a unique value`);
                } else {
                  setError(id, '');
                }
              }}
              writeEnabled={writeEnabled}
            />
          ) : (
            <Typography variant="bodySmall">{facet.displayValue}</Typography>
          )}
        </div>

        <div className={styles.tableCol}>
          <div className={styles.orderColumn}>
            <CombinedDropdown
              variant={DropdownVariant.FacetOrder}
              status={displayType}
              onChange={(newOrder) =>
                onDisplayTypeChange(id, newOrder as FacetDisplayType)
              }
              hasAlgoControl
              writeEnabled={writeEnabled}
              ariaLabel="Select to set as included, excluded or algo control"
            />
          </div>
        </div>

        <div className={styles.tableCol}>
          <Button
            theme="secondary"
            as="a"
            href={(() => {
              const baseUrl = ROUTES.GLOBAL.FACETS.VALUES.EDIT(facet.id);
              const params = new URLSearchParams({
                ruleSetId,
                displayName: facet.displayValue,
                countryCode,
              });
              return `${baseUrl}?${params.toString()}`;
            })()}
            disabled={!writeEnabled}
          >
            {writeEnabled ? 'Edit values' : 'View values'}
          </Button>
        </div>

        <div className={styles.tableCol}>
          {isIncludedFacet && (
            <DragHandleButton
              disabled={isDragDisabled}
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
        <SortableRow key={id} id={id} disabled={!writeEnabled}>
          {(sortableProps) => renderRow(sortableProps)}
        </SortableRow>
      );
    }

    return renderRow();
  }
);

FacetRow.displayName = 'FacetRow';
