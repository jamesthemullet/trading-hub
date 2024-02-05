import { css } from '@emotion/react';
import { colourPalette, colourDictionary, fonts } from './constants';
import { spacing, type SpacingUnit } from './spacing';

export const formDefaultStyles = ({ padding }: { padding: SpacingUnit }) => css`
  appearance: none;
  background: ${colourDictionary.white};
  border: 1px solid ${colourPalette.tertiary.accessibilityGrey};
  border-radius: 0;
  box-sizing: border-box;
  display: inline-block;
  font-family: inherit;
  font-size: ${fonts.size[400]};
  outline: none;
  padding: ${spacing(padding)};
  &::placeholder {
    color: ${colourPalette.tertiary.lightGrey};
  }
  &:disabled {
    border-color: ${colourPalette.tertiary.lightGrey};
    cursor: not-allowed;
  }
`;

export const formActiveStyles = () => css`
  border-color: ${colourPalette.tertiary.darkGrey};
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
