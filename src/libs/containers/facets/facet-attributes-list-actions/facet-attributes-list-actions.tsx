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
const FacetAttributesSearch = styled(Search)`
  max-width: 750px;
  width: 100%;

  & > div {
    width: 100%;
    border: 0;

    & input {
      width: 100%;
      border: 1px solid ${color.surface.onSurfaceVariant};
      border-radius: 30px;
      background-color: ${color.surface.surfaceContainer};
      padding-left: 52px;
    }

    & button {
      right: unset;
      left: 4px;
    }
  }
`;

export const FacetAttributesListActions = ({
  onSearchChange,
}: {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <FacetAttributesListActionsContainer>
      <FacetAttributesActionsButtonsContainer>
        <FacetAttributesActionsButton theme="secondary" disabled>
          <Image
            src="/trading-hub/asset/icon-multi-select.svg"
            width="18"
            height="18"
            alt=""
          />
          <span>Multi-select</span>
        </FacetAttributesActionsButton>
        <FacetAttributesActionsButton theme="secondary" disabled>
          <Image
            src="/trading-hub/asset/icon-merge.svg"
            width="18"
            height="18"
            alt=""
          />
          <span>Merge</span>
        </FacetAttributesActionsButton>
      </FacetAttributesActionsButtonsContainer>

      <FacetAttributesSearch onChange={onSearchChange} />
    </FacetAttributesListActionsContainer>
  );
};
