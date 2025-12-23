import styled from '@emotion/styled';
import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';

import { Checkbox, Loader, Text } from '@/libs/components';
import {
  AttributeWrapper,
  Col,
  MergedValue,
  RemoveMergedFacet,
} from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import type { GlobalAttributeReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';

const StyledText = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background: none;
`;

export const GlobalFacetAttribute = ({
  attributes,
  isMergeGroup,
  isChecked,
  displayName,
  handleRemoveFromMerge,
  dispatch,
  writeEnabled,
}: {
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
}) => {
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
      <Col>
        {writeEnabled && (
          <Checkbox
            checked={isChecked}
            onChange={() => handleSelect(displayName)}
            label={`Select ${displayName} to merge`}
            showLabel={false}
          />
        )}
      </Col>
      <Col>
        <AttributeWrapper>
          {attributes.length > 1 ? (
            <div>
              <Text isStrong>Merged Value Group</Text>

              {visibleAttributes.map((value, i) => (
                <MergedValue key={`${i}-${value}`}>
                  <Text>{value}</Text>{' '}
                  {isMergeGroup && value !== displayName && writeEnabled && (
                    <RemoveMergedFacet
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
                </MergedValue>
              ))}

              {attributes.length > maxVisible && (
                <StyledText
                  as="button"
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? 'Show Fewer' : 'Show More'}
                </StyledText>
              )}
            </div>
          ) : (
            <Text>{attributes[0]}</Text>
          )}
        </AttributeWrapper>
        {isAwaitingUpdate && <Loader isInModal />}
      </Col>
    </>
  );
};
