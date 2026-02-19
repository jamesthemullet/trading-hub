import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';

import type { FacetOrderInputProps } from '@/libs/components';
import {
  Checkbox,
  FacetOrderInput,
  Loader,
  Typography,
} from '@/libs/components';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import type { GlobalAttributeReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';

import styles from './global-facet-attribute.module.css';

type GlobalFacetAttributeProps = {
  attributes: string[];
  isMergeGroup: boolean;
  isChecked: boolean;
  displayName: string;
  handleRemoveFromMerge: ({
    valueToRemove,
    mergeDisplayName,
  }: {
    valueToRemove: string;
    mergeDisplayName: string;
  }) => void;
  dispatch: Dispatch<GlobalAttributeReducer>;
  writeEnabled: boolean;
  displayType: 'included' | 'excluded' | 'algoControl';
  showInput?: boolean;
} & FacetOrderInputProps;

export const GlobalFacetAttribute = ({
  attributes,
  isMergeGroup,
  isChecked,
  displayName,
  handleRemoveFromMerge,
  dispatch,
  writeEnabled,
  displayType,
  order,
  localOrder,
  inputRef,
  onInputChange: handleInputChange,
  onInputBlur: handleInputBlur,
  onInputKeyDown: handleInputKeyDown,
}: GlobalFacetAttributeProps) => {
  const maxVisible = 4;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);

  useEffect(() => {
    setIsAwaitingUpdate(false);
  }, [attributes]);

  const visibleAttributes = isExpanded
    ? attributes
    : attributes.slice(0, maxVisible);

  const handleSelect = (displayName: string) => {
    requestAnimationFrame(() => {
      dispatch({
        type: 'TOGGLE_SELECTED_ATTRIBUTE',
        payload: {
          displayName,
        },
      });
    });
  };

  return (
    <>
      <div className={facetPanelStyles.tableCol}>
        {writeEnabled && (
          <Checkbox
            checked={isChecked}
            onChange={() => handleSelect(displayName)}
            label={`Select ${displayName} to merge`}
            showLabel={false}
          />
        )}
      </div>

      <div
        className={`${facetPanelStyles.tableCol} ${facetPanelStyles.facetOrderInput}`}
      >
        {displayType === 'included' && order && (
          <FacetOrderInput
            displayValue={displayName}
            order={order}
            localOrder={localOrder}
            inputRef={inputRef}
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            onInputKeyDown={handleInputKeyDown}
            writeEnabled={writeEnabled}
          />
        )}
      </div>

      <div className={facetPanelStyles.tableCol}>
        <div className={styles.attributeWrapper}>
          {attributes.length > 1 ? (
            <>
              <Typography variant="bodySmall" isStrong>
                Merged Value Group
              </Typography>

              {visibleAttributes.map((value, i) => (
                <div className={styles.mergedValue} key={`${i}-${value}`}>
                  <Typography variant="bodySmall">{value}</Typography>{' '}
                  {isMergeGroup && value !== displayName && writeEnabled && (
                    <button
                      type="button"
                      className={styles.removeMergedValueButton}
                      onClick={() => {
                        setIsAwaitingUpdate(true);
                        requestAnimationFrame(() => {
                          handleRemoveFromMerge({
                            valueToRemove: value,
                            mergeDisplayName: displayName,
                          });
                        });
                      }}
                      aria-label={`Remove merged facet for ${value}`}
                      disabled={isAwaitingUpdate}
                    />
                  )}
                </div>
              ))}

              {attributes.length > maxVisible && (
                <button
                  type="button"
                  className={styles.toggleLink}
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <Typography variant="bodySmall" as="span">
                    {isExpanded ? 'Show Fewer' : 'Show More'}
                  </Typography>
                </button>
              )}
            </>
          ) : (
            <Typography variant="bodySmall">{attributes[0]}</Typography>
          )}
        </div>
        {isAwaitingUpdate && <Loader isInModal />}
      </div>
    </>
  );
};
