import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { spacing } from '../utils/spacing';

export const fonts = {
  regular: 'mnsLondonRegular, Helvetica, Arial, sans-serif',
  bold: 'mnsLondonBold, Helvetica, Arial, sans-serif',
  semiBold: 'mnsLondonSemiBold, Helvetica, Arial, sans-serif',
  italic: 'mnsLondonItalic, Helvetica, Arial, sans-serif',
  light: 'mnsLondonLight, Helvetica, Arial, sans-serif',
  boldCondensed: 'mnsLondonBoldCondensed, Helvetica, Arial, sans-serif',
};

const commonStyles = css`
  color: #222222;
  font-weight: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
`;

export const Header1 = styled.h1`
  ${commonStyles}
  font-family: ${fonts.bold};
  font-size: 35px;
`;

export const Header2 = styled.h2`
  ${commonStyles}
  font-family: ${fonts.bold};
  font-size: 25px;
`;

export const Header3 = styled.h3`
  ${commonStyles}
  font-family: ${fonts.bold};
  font-size: 20px;
`;

export const Title = styled.h4`
  ${commonStyles}
  font-family: ${fonts.bold};
  font-size: 0.875rem;
  line-height: 1.5714;
`;

export const Text = styled.p<{ isStrong?: boolean }>`
  ${commonStyles}
  font-family: ${fonts.regular};
  font-weight: ${({ isStrong }) => (isStrong ? 600 : 'normal')};
  font-size: 0.875rem;
  line-height: 1.5714;
`;

export const Label = styled.p<{ isStrong?: boolean; withMargin?: boolean }>`
  ${commonStyles}
  font-family: ${fonts.regular};
  font-weight: ${({ isStrong }) => (isStrong ? 600 : 'normal')};
  font-size: 14px;
  line-height: 1.5714;
  margin-bottom: ${({ withMargin }) => (withMargin ? spacing(1) : 0)};
`;
