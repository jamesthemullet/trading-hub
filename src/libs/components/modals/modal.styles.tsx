import styled from '@emotion/styled';

import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const ModalAttributesTable = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ModalStickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: ${color.surface.surfaceContainer};
`;

export const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing(3)};

  h3 {
    font-size: 1.25em;
  }
`;

export const HeadingAndCloseButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing(3)};

  h3 {
    font-size: 1.25em;
  }

  button {
    background: none;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    display: flex;
    padding: 0;
    border: none;

    &:hover {
      background: none;
    }
  }
`;

export const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

export const ModalFooter = styled.div`
  background-color: ${color.surface.surfaceContainer};
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(2)};
  button {
    width: 160px;
  }
`;
