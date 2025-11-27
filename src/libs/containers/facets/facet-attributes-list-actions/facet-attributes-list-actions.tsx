import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';

import { Button, Search } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

const FacetAttributesListActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing(4)};
  padding: ${spacing(2)} ${spacing(2.5)};
  border-top: 1px solid ${color.accent.primary.primary};
`;
const FacetAttributesActionsButtonsContainer = styled.div`
  height: 100%;
  min-width: 290px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 2;
`;

const FacetAttributesActionsButton = styled(Button, {
  shouldForwardProp: (prop) => isPropValid(prop) || prop === 'theme',
})`
  display: flex;
  align-items: center;
  width: auto;
  gap: ${spacing(1)};
  line-height: 1;
`;

const SearchWrapper = styled.div`
  justify-content: flex-end;
  display: flex;
  flex-grow: 3;
`;

export const FacetAttributesListActions = ({
  onSearchChange,
  onMergeClick,
  isMergeHidden = false,
  isMergeDisabled = true,
  writeEnabled,
}: {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMergeClick?: () => void;
  isMergeHidden?: boolean;
  isMergeDisabled?: boolean;
  writeEnabled: boolean;
}) => {
  return (
    <FacetAttributesListActionsContainer>
      <FacetAttributesActionsButtonsContainer>
        {!isMergeHidden && (
          <FacetAttributesActionsButton
            theme="secondary"
            onClick={onMergeClick}
            disabled={isMergeDisabled || !writeEnabled}
          >
            <Image
              src="/trading-hub/asset/icon-merge.svg"
              width="18"
              height="18"
              alt=""
            />
            <span>Merge</span>
          </FacetAttributesActionsButton>
        )}
      </FacetAttributesActionsButtonsContainer>

      <SearchWrapper>
        <Search onChange={onSearchChange} placeholder="Search" fullWidth />
      </SearchWrapper>
    </FacetAttributesListActionsContainer>
  );
};
