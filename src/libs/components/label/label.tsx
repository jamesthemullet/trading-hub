import type { LabelHTMLAttributes, ReactNode } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { dotcomTheme } from '../utils/constants';

type BaseLabelProps = LabelHTMLAttributes<HTMLParagraphElement> & {
  isDisabled?: boolean;
  isHidden?: boolean;
  isRequired?: boolean;
  children: ReactNode;
  theme?: typeof dotcomTheme;
};

const StyledLabel = styled.p<BaseLabelProps>`
  ${({ isDisabled }) =>
    !isDisabled &&
    css`
      cursor: pointer;
    `};
  ${({ isHidden }) => isHidden};
  ${({ isDisabled: disabled, theme }) =>
    disabled &&
    css`
      color: ${theme.colours.text.disabled};
    `};
`;

export type LabelProps = BaseLabelProps;

export const Label = ({
  children,
  isRequired,
  theme = dotcomTheme,
  ...rest
}: LabelProps) => (
  <StyledLabel theme={theme} {...rest}>
    {children}
  </StyledLabel>
);
