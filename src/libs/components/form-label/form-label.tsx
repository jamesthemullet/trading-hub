import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { LabelHTMLAttributes, ReactNode } from 'react';

import type { BreakPoints } from '@/libs/utils/breakpoint-type';

import { Label as LabelText } from '../typography/typography.styles';

type BaseFormLabelProps = LabelHTMLAttributes<HTMLParagraphElement> & {
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

const StyledFormLabel = styled(LabelText)<BaseFormLabelProps>`
  cursor: pointer;
  ${({ isHidden }) => isHidden && visuallyHide};
`;

export type FormLabelProps = BaseFormLabelProps & {
  as?: never;
};

export const FormLabel = ({
  children,
  isRequired,
  ...rest
}: FormLabelProps) => (
  <StyledFormLabel isStrong {...rest} as="label">
    {children}
    {isRequired && REQUIRED_FIELD_INDICATOR}
  </StyledFormLabel>
);
