import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  background-color: #fff;
  width: 460px;
  min-height: 160px;
  position: fixed;
  z-index: 50;
  top: calc(50% - 80px);
  left: calc(50% - 230px);
  padding: ${spacing(1.5)};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const Overlay = styled.button`
  border: none;
  background-color: rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 49;
`;

const CloseButton = styled.button`
  background: url('/trading-hub/asset/icon-close-black.svg');
  width: 25px;
  height: 25px;
  display: inline-block;
  border: none;
  position: absolute;
  right: ${spacing(2)};
  top: ${spacing(2)};
  background-size: contain;
`;

type Props = {
  children: ReactNode;
  onClose: () => void;
};

export const Modal = ({ children, onClose }: Props) => {
  return (
    <>
      <Overlay onClick={onClose} aria-label="Close modal" />
      <Wrapper>
        <CloseButton onClick={onClose} />
        {children}
      </Wrapper>
    </>
  );
};
