import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { spacing } from '@/libs/utils/spacing';

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

export const SubHeader2 = styled.h2`
  ${commonStyles}
  font-family: ${fonts.regular};
  font-size: 20px;
`;

export const Title = styled.h4`
  ${commonStyles}
  font-family: ${fonts.bold};
  font-size: 0.875rem;
  line-height: 1.5714;
`;

export const Text = styled.p<{ isStrong?: boolean; withMargin?: boolean }>`
  ${commonStyles}
  font-family: ${fonts.regular};
  font-weight: ${({ isStrong }) => (isStrong ? 600 : 'normal')};
  font-size: 0.875rem;
  line-height: 1.5714;
  margin-bottom: ${({ withMargin }) => (withMargin ? spacing(1) : 0)};
`;

export const Label = styled.p<{ isStrong?: boolean; withMargin?: boolean }>`
  ${commonStyles}
  font-family: ${fonts.regular};
  font-weight: ${({ isStrong }) => (isStrong ? 600 : 'normal')};
  font-size: 14px;
  line-height: 1.5714;
  margin-bottom: ${({ withMargin }) => (withMargin ? spacing(1) : 0)};
`;

type TypographyProps = {
  isStrong?: boolean;
  withMargin?: boolean;
  variant?:
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall';
  as?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'label'
    | 'output'
    | 'time';
  align?: 'left' | 'right';
  children: React.ReactNode;
};

const fontSizes = {
  bodyLarge: '18px',
  bodyMedium: '16px',
  bodySmall: '14px',
  displayLarge: '52px',
  displayMedium: '46px',
  displaySmall: '41px',
  headlineLarge: '36px',
  headlineMedium: '32px',
  headlineSmall: '29px',
  labelLarge: '13px',
  labelMedium: '11px',
  labelSmall: '10px',
  titleLarge: '26px',
  titleMedium: '23px',
  titleSmall: '20px',
};

const lineHeights = {
  bodyLarge: '28px',
  bodyMedium: '24px',
  bodySmall: '20px',
  displayLarge: '60px',
  displayMedium: '54px',
  displaySmall: '48px',
  headlineLarge: '44px',
  headlineMedium: '40px',
  headlineSmall: '36px',
  labelLarge: '20px',
  labelMedium: '18px',
  labelSmall: '16px',
  titleLarge: '36px',
  titleMedium: '32px',
  titleSmall: '28px',
};

export const Typography = ({
  align = 'left',
  as = 'p',
  variant = 'bodyMedium',
  children,
  isStrong = false,
  withMargin = false,
  ...rest
}: TypographyProps) => {
  const StyledTypography = styled.p<TypographyProps>`
    ${commonStyles}
    font-family: ${({ isStrong }) =>
      isStrong ? fonts.semiBold : fonts.regular};
    font-weight: ${({ isStrong }) => (isStrong ? 400 : 100)};
    font-size: ${fontSizes[variant]};
    line-height: ${lineHeights[variant]};
    text-align: ${align};
    margin-bottom: ${({ withMargin }) => (withMargin ? spacing(1) : 0)};
  `;

  return (
    <StyledTypography
      variant={variant}
      as={as}
      isStrong={isStrong}
      withMargin={withMargin}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
};
