import styled from '@emotion/styled';
import { Typography } from '../typography/typography';
import { colourDictionary } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  width: 460px;
  min-height: 160px;
  background: pink;
  position: fixed;
  top: calc(50% - 80px);
  left: calc(50% - 230px);
`;

type Props = {
  children: ReactNode;
};

export const Modal = ({ children }: Props) => {
  return <Wrapper>{children}</Wrapper>;
};
