import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { FACET_ATTRIBUTE_VIEW_MODE } from '@/libs/utils/facet-attribute-types';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

const FacetAttributesActionsContainer = styled.div`
  height: 94px;
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(4)};
  margin: 14px ${spacing(2.5)};
`;
const FacetAttributesActionsButtonsContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0;
`;
const FacetAttributesActionsButton = styled(Button, {
  shouldForwardProp: (prop) => isPropValid(prop) || prop === 'theme',
})`
  height: ${sizing(6)};
  width: ${sizing(14)};
  border-radius: 0;
  border: 1px solid ${color.accent.primary.primary};

  display: flex;
  align-items: center;
  gap: ${spacing(1.5)};

  font-size: 14px;

  font-weight: ${(props) => (props.theme === 'filled' ? 700 : 400)};};

  &:first-of-type {
    border-right: none;
  }
  &:last-of-type {
    border-left: none;
  }

  & > img {
    margin-right: 8px;
    color: #ffffff;
  }
`;

type FacetAttributeActionsProps = {
  currentMode: FACET_ATTRIBUTE_VIEW_MODE;
  setCurrentMode: Dispatch<SetStateAction<FACET_ATTRIBUTE_VIEW_MODE>>;
};

export const FacetAttributesActions = ({
  currentMode,
  setCurrentMode,
}: FacetAttributeActionsProps) => {
  return (
    <FacetAttributesActionsContainer>
      <FacetAttributesActionsButtonsContainer>
        <FacetAttributesActionsButton
          onClick={() => setCurrentMode(FACET_ATTRIBUTE_VIEW_MODE.LIST)}
          theme={
            currentMode === FACET_ATTRIBUTE_VIEW_MODE.LIST
              ? 'filled'
              : 'secondary'
          }
        >
          <Image
            src={`/trading-hub/asset/icon-list${currentMode === FACET_ATTRIBUTE_VIEW_MODE.LIST ? '-white' : ''}.svg`}
            width="24"
            height="24"
            alt=""
          />
          <span>List</span>
        </FacetAttributesActionsButton>
        <FacetAttributesActionsButton
          onClick={() => setCurrentMode(FACET_ATTRIBUTE_VIEW_MODE.GRID)}
          theme={
            currentMode === FACET_ATTRIBUTE_VIEW_MODE.GRID
              ? 'filled'
              : 'secondary'
          }
        >
          <Image
            src={`/trading-hub/asset/icon-grid${currentMode === FACET_ATTRIBUTE_VIEW_MODE.GRID ? '-white' : ''}.svg`}
            width="24"
            height="24"
            alt=""
          />
          <span>Grid</span>
        </FacetAttributesActionsButton>
      </FacetAttributesActionsButtonsContainer>
    </FacetAttributesActionsContainer>
  );
};
