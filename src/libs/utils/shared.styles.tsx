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

export const boxShadow = () => css`
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
`;

export const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
  min-width: 1024px;

  ${mediaQuery('xxl')} {
    margin: ${spacing(2)} ${spacing(3)};
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

export const ToolsContainer = styled.div`
  display: flex;
  margin: ${spacing(2)};
  gap: ${spacing(2)};
  max-width: 100%;
  align-items: center;
`;
