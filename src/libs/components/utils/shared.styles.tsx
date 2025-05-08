import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { fonts } from '../typography/typography.styles';
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
  border-color: ${color.grey};
  border-width: 2px;
  &:focus {
    box-shadow: none;
  }
`;

export const resetSearchInput = css`
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
`;

export type TypographyStyleProps = {
  isStrong?: boolean;
};

export const microTypographyStyles = () => css`
  font-family: 'mnsLondonSemiBold, Helvetica, Arial, sans-serif';
  font-size: 1rem;
  letter-spacing: 0.25px;
  line-height: 1.4;
`;

export const smallTypographyStyles = ({
  isStrong,
}: {
  isStrong?: TypographyStyleProps['isStrong'];
}) => css`
  font-family: ${isStrong ? fonts.semiBold : fonts.regular};
  font-size: 1rem;
  line-height: 1.5714;
`;

export const extraSmallTypographyStyles = ({
  isStrong,
}: {
  isStrong?: TypographyStyleProps['isStrong'];
}) => css`
  font-family: ${isStrong ? fonts.semiBold : fonts.regular};
  font-size: 1rem;
  line-height: 1.5;
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

export const PageNameLabel = styled.h1`
  font-size: 1.5em;
  margin: ${spacing(3)} ${spacing(2)};

  ${mediaQuery('xxl')} {
    margin: ${spacing(3)};
  }
`;

export const ToolsContainer = styled.div`
  display: flex;
  margin: ${spacing(2)};
  gap: ${spacing(2)};
  max-width: 100%;
  align-items: center;
`;

export const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;
