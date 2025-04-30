import styled from '@emotion/styled';
import { useState } from 'react';

import { Text } from '@/libs/components';
import {
  AttributeWrapper,
  MergedValue,
  RemoveMergedFacet,
} from '@/libs/components/modals/facet-panel/search-and-category/edit-facet-modal-content.styles';

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
  handleRemoveFromMerge,
}: {
  attributes: string[];
  isMergeGroup: boolean;
  displayName: string;
  handleRemoveFromMerge: ({
    valueToRemove,
    mergeDisplayName,
  }: {
    valueToRemove: string;
    mergeDisplayName: string;
  }) => void;
}) => {
  const maxVisible = 4;
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleAttributes = isExpanded
    ? attributes
    : attributes.slice(0, maxVisible);

  return (
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
                    handleRemoveFromMerge({
                      valueToRemove: value,
                      mergeDisplayName: displayName,
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
  );
};
