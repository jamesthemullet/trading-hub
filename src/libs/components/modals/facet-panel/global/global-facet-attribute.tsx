import styled from '@emotion/styled';
import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';

import { Loader, Text } from '@/libs/components';
import {
  AttributeWrapper,
  Col,
  MergedValue,
  RemoveMergedFacet,
} from '@/libs/components/modals/facet-panel/search-and-category/edit-facet-modal-content.styles';

import type { GlobalAttributeReducer } from './global-attribute-reducer';

const StyledText = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background: none;
`;

export const GlobalFacetAttribute = ({
  attributes,
  isMergeGroup,
  displayName,
  allSelected,
  allDeselected,
  handleRemoveFromMerge,
  dispatch,
}: {
  attributes: string[];
  isMergeGroup: boolean;
  displayName: string;
  allSelected: boolean;
  allDeselected: boolean;
  handleRemoveFromMerge: ({
    valueToRemove,
    mergeDisplayName,
  }: {
    valueToRemove: string;
    mergeDisplayName: string;
  }) => void;
  dispatch: Dispatch<GlobalAttributeReducer>;
}) => {
  const maxVisible = 4;
  const [isChecked, setIsChecked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);

  useEffect(() => {
    if (!isAwaitingUpdate) return;

    setIsAwaitingUpdate(false);
  }, [isAwaitingUpdate]);

  useEffect(() => {
    if (allSelected) {
      setIsChecked(true);
    }
  }, [allSelected]);

  useEffect(() => {
    if (allDeselected) {
      setIsChecked(false);
    }
  }, [allDeselected]);

  const visibleAttributes = isExpanded
    ? attributes
    : attributes.slice(0, maxVisible);

  const handleSelect = () => {
    setIsChecked((prev) => !prev);

    requestAnimationFrame(() => {
      dispatch({
        type: 'TOGGLE_SELECTED_ATTRIBUTES',
        payload: {
          attributes: attributes,
          allSelected: false,
          allDeselected: false,
        },
      });
    });
  };

  return (
    <>
      <Col>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleSelect}
          aria-label={`Select ${displayName} to merge`}
        />
      </Col>
      <Col>
        <AttributeWrapper>
          {attributes.length > 1 ? (
            <div>
              <Text isStrong>Merged Value Group</Text>

              {visibleAttributes.map((value, i) => (
                <MergedValue key={`${i}-${value}`}>
                  <Text>{value}</Text>{' '}
                  {isMergeGroup && value !== displayName && (
                    <RemoveMergedFacet
                      onClick={() => {
                        setIsAwaitingUpdate(true);
                        if (isChecked) {
                          dispatch({
                            type: 'TOGGLE_SELECTED_ATTRIBUTES',
                            payload: {
                              attributes: [value],
                              allSelected,
                              allDeselected,
                            },
                          });
                        }
                        requestAnimationFrame(() => {
                          handleRemoveFromMerge({
                            valueToRemove: value,
                            mergeDisplayName: displayName,
                          });
                        });
                      }}
                      aria-label={`Remove merged facet for ${value}`}
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
