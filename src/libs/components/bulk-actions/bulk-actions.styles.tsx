import styled from '@emotion/styled';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { boxShadow } from '../utils/shared.styles';
import { spacing } from '../utils/spacing';

export const ConfirmationPanel = styled.div`
  width: 100%;
  background: ${color.surface.surfaceContainer};
  border-top: solid 1px #000;
  z-index: 1;
  bottom: 0;
  right: 0;
  padding-left: ${spacing(12)};
  position: fixed;
  min-height: 60px;
  display: flex;
`;

export const BulkActionsSpacer = styled.div`
  height: 60px;
  width: 100%;
`;

export const ConfirmationInfo = styled.div`
  padding: ${spacing(2)};
`;

export const ConfirmationActions = styled.div`
  padding: ${spacing(1)};
  margin-left: auto;
  position: relative;

  & button {
    margin-left: ${spacing(1)};
  }
`;

export const BulkActionsHeader = styled(Text)`
  padding: ${spacing(1)} ${spacing(1)} 0;
`;

export const ProductMenu = styled.div`
  ${boxShadow}
  position: absolute;
  bottom: 40px;
  right: 50px;
  width: 100%;
  min-width: 160px;
  background: ${color.surface.surfaceContainer};
  border-radius: 3px;
  z-index: 2;
`;

export const ProductMenuOverlay = styled.button`
  position: fixed;
  background: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  border: none;
`;

export const ProductMenuButton = styled(Text)<{ icon: string; size?: string }>`
  border: none;
  background: ${color.surface.surfaceContainer};
  width: 100%;
  min-height: 40px;
  text-align: left;
  display: flex;
  padding-top: ${spacing(1.5)};

  &:hover,
  &:focus {
    background-color: ${color.lightGreen};
    outline: none;
    box-shadow: none;
  }

  &::before {
    content: '';
    background: no-repeat 0 0;
    background-image: ${({ icon }) =>
      `url(/trading-hub/asset/icon-${icon}.svg)`};
    background-size: ${({ size }) => (size ? size : '20px 20px')};
    width: 25px;
    height: 20px;
  }
`;

export const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;
  margin-top: ${spacing(1)};

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;
