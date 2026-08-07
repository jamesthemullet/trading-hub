import type { Dispatch, KeyboardEvent, ReactElement, RefCallback } from 'react';
import { useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  FacetOrderInput,
  Loader,
  Typography,
} from '@/libs/components';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import type { GlobalAttributesPageReducer } from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import Image from 'next/image';

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
  dispatch: Dispatch<GlobalAttributesPageReducer>;
  isWriteEnabled: boolean;
  displayType: 'included' | 'excluded' | 'algoControl';
  displayValue: string;
  order: number | undefined;
  localOrder: number | '';
  inputRef: RefCallback<HTMLInputElement>;
  onInputChange: (displayValue: string, value: string) => void;
  onInputBlur: (displayValue: string, value: string, order: number) => void;
  onInputKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    displayValue: string,
    order: number
  ) => void;
};

export const GlobalFacetAttribute = ({
  attributes,
  isMergeGroup,
  isChecked,
  displayName,
  handleRemoveFromMerge,
  dispatch,
  isWriteEnabled,
  displayType,
  order,
  localOrder,
  inputRef,
  onInputChange: handleInputChange,
  onInputBlur: handleInputBlur,
  onInputKeyDown: handleInputKeyDown,
}: GlobalFacetAttributeProps): ReactElement => {
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
        {isWriteEnabled && (
          <Checkbox
            checked={isChecked}
            onChange={() => handleSelect(displayName)}
            label={`Select ${displayName} to merge`}
            shouldShowLabel={false}
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
            isWriteEnabled={isWriteEnabled}
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

              {visibleAttributes.map((value) => (
                <div className={styles.mergedValue} key={value}>
                  <Typography variant="bodySmall">{value}</Typography>{' '}
                  {isMergeGroup && value !== displayName && isWriteEnabled && (
                    <Button
                      appearance="icon"
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
                      isDisabled={isAwaitingUpdate}
                    >
                      <Image
                        width={18}
                        height={18}
                        src="/trading-hub/asset/icon-close-black.svg"
                        alt=""
                      />
                    </Button>
                  )}
                </div>
              ))}

              {attributes.length > maxVisible && (
                <Button
                  type="button"
                  appearance="plain"
                  className={styles.toggleLink}
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <Typography variant="bodySmall" as="span">
                    {isExpanded ? 'Show Fewer' : 'Show More'}
                  </Typography>
                </Button>
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
