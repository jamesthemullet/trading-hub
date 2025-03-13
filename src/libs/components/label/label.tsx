import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { LabelHTMLAttributes, ReactNode } from 'react';

import { Label as LabelText } from '../typography/typography.styles';
import type { BreakPoints } from '../utils/breakpoint-type';

type BaseLabelProps = LabelHTMLAttributes<HTMLParagraphElement> & {
  isDisabled?: boolean;
  isHidden?: boolean;
  isRequired?: boolean;
  children: ReactNode;
  isStrong?: boolean;
  hiddenOn?: BreakPoints;
  visuallyHiddenOn?: never;
};

const REQUIRED_FIELD_INDICATOR = '*';

const visuallyHide = css`
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

const StyledLabel = styled(LabelText)<BaseLabelProps>`
  ${({ isDisabled }) =>
    !isDisabled &&
    css`
      cursor: pointer;
    `};
  ${({ isHidden }) => isHidden && visuallyHide};
  ${({ isDisabled: disabled }) =>
    disabled &&
    css`
      color: #cccccc;
    `};
`;

export type LabelProps = BaseLabelProps & {
  as?: never;
};

export const Label = ({ children, isRequired, ...rest }: LabelProps) => (
  <StyledLabel isStrong {...rest} as="label">
    {children}
    {isRequired && REQUIRED_FIELD_INDICATOR}
  </StyledLabel>
);
