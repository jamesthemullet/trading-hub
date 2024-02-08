import type { ReactNode } from 'react';
import React from 'react';

import styled from '@emotion/styled';
import { css } from '@emotion/react';

export const visuallyHide = css`
  border: 0;
  clip: rect(0, 0, 0, 0);
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  left: -999px;
  top: auto;
  white-space: nowrap;
  width: 1px;
  height: 1px;
`;

export type VisuallyHideProps = {
  as: React.ElementType;
  children: ReactNode;
  [props: string]: unknown;
};

export const VisuallyHide = styled(
  ({ as: element, children, ...props }: VisuallyHideProps) =>
    React.createElement(element, props, children)
)`
  ${visuallyHide}
`;
