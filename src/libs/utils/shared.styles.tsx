import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { fonts } from '../components/typography/typography.styles';
import { color } from './constants';
import { mediaQuery } from './media-query';
import { spacing, type SpacingUnit } from './spacing';

export const formDefaultStyles = ({ padding }: { padding: SpacingUnit }) => css`
  appearance: none;
  background: #fff;
  border: 1px solid ${color.lightGrey};
  border-radius: 0;
  box-sizing: border-box;
  display: inline-block;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  padding: ${spacing(padding)};
  &::placeholder {
    color: ${color.lightGrey};
  }
  &:disabled {
    border-color: ${color.lightGrey};
    cursor: not-allowed;
  }
`;

export const formActiveStyles = () => css`
  border-color: ${color.surfaceDark.onSurfaceDarkVariant};
  border-width: 2px;
  &:focus {
    box-shadow: none;
  }
`;

export const PageNameLabel = styled.h1<{ marginBottom?: boolean }>`
  font-size: 1.5em;
  margin: ${spacing(3)} ${spacing(2)}
    ${({ marginBottom }) => (marginBottom ? spacing(3) : 0)};
  font-weight: 600;
  font-family: ${fonts.semiBold};

  ${mediaQuery('xxl')} {
    margin: ${spacing(3)} ${spacing(3)}
      ${({ marginBottom }) => (marginBottom ? spacing(3) : 0)};
  }
`;
